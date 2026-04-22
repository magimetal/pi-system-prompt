const SYSTEM_PROMPT_MESSAGE_TYPE = "system-prompt-output";
const REDACTED_VALUE = "[REDACTED]";

type TokenCountData = {
	tokens: number;
	basis: string;
};

type SystemPromptCommandDeps = {
	exactTokenCounter?: () =>
		| Promise<TokenCountData | null | undefined>
		| TokenCountData
		| null
		| undefined;
	estimateTokenCounter?: (prompt: string) => TokenCountData | null | undefined;
};

type TokenCountResult =
	| {
			kind: "exact";
			tokens: number;
			basis: string;
	  }
	| {
			kind: "estimate";
			tokens: number;
			basis: string;
	  }
	| {
			kind: "unknown";
			reason: string;
	  };

export type SystemPromptMessage = {
	customType: string;
	content: string;
	display: true;
};

type SystemPromptContext = {
	getSystemPrompt(): string;
};

export type SystemPromptCommandBridge = {
	registerCommand(
		name: string,
		options: {
			description?: string;
			handler: (_args: string, ctx: SystemPromptContext) => Promise<void>;
		},
	): void;
	sendMessage(message: SystemPromptMessage): void;
};

function redactSensitiveValue(
	text: string,
	pattern: RegExp,
): { text: string; changed: boolean } {
	let changed = false;
	const nextText = text.replace(pattern, (...args) => {
		const captures = args.slice(1, -2) as string[];
		const prefix = captures[0] ?? "";
		const value = captures.at(-1);
		if (!value || value === REDACTED_VALUE) {
			return `${prefix}${REDACTED_VALUE}`;
		}
		changed = true;
		return `${prefix}${REDACTED_VALUE}`;
	});
	return { text: nextText, changed };
}

function redactSensitivePrompt(prompt: string): {
	displayPrompt: string;
	redacted: boolean;
} {
	const patterns = [
		/(Authorization\s*:\s*)([^\r\n]+)/giu,
		/(Bearer\s+)([^\s\r\n]+)/gu,
		/((?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|secret|password|passwd|token)\s*[:=]\s*["']?)([^"'\s\r\n,;]+)/giu,
		/((?:x-api-key|x-auth-token)\s*:\s*)([^\r\n]+)/giu,
		/()(sk-[A-Za-z0-9._-]+)/gu,
	];

	let displayPrompt = prompt;
	let redacted = false;

	for (const pattern of patterns) {
		const result = redactSensitiveValue(displayPrompt, pattern);
		displayPrompt = result.text;
		redacted ||= result.changed;
	}

	return { displayPrompt, redacted };
}

function estimateTokensByCharacterHeuristic(prompt: string): TokenCountData {
	return {
		tokens: prompt.length === 0 ? 0 : Math.max(1, Math.ceil(prompt.length / 4)),
		basis: "4 chars/token heuristic",
	};
}

async function countTokens(
	prompt: string,
	deps: SystemPromptCommandDeps,
): Promise<TokenCountResult> {
	const exact = await deps.exactTokenCounter?.();
	if (exact && Number.isFinite(exact.tokens)) {
		return {
			kind: "exact",
			tokens: exact.tokens,
			basis: exact.basis,
		};
	}

	const estimate = deps.estimateTokenCounter
		? deps.estimateTokenCounter(prompt)
		: estimateTokensByCharacterHeuristic(prompt);
	if (estimate && Number.isFinite(estimate.tokens)) {
		return {
			kind: "estimate",
			tokens: estimate.tokens,
			basis: estimate.basis,
		};
	}

	return {
		kind: "unknown",
		reason:
			"No exact or estimated token counter available for current prompt basis.",
	};
}

function formatTokenLines(tokenCount: TokenCountResult): string[] {
	if (tokenCount.kind === "exact") {
		return [
			`Token count: ${tokenCount.tokens} tokens (exact)`,
			`Count basis: ${tokenCount.basis}`,
		];
	}

	if (tokenCount.kind === "estimate") {
		return [
			`Token count: ~${tokenCount.tokens} tokens (estimate)`,
			`Count basis: ${tokenCount.basis}`,
		];
	}

	return [
		"Token count: unavailable",
		`Count basis: unavailable. ${tokenCount.reason}`,
	];
}

function buildTranscript(
	displayPrompt: string,
	redacted: boolean,
	tokenCount: TokenCountResult,
): string {
	const promptBody = displayPrompt || "(empty)";
	const lines = [
		"Current session system prompt snapshot",
		"Prompt basis: command-time current session system prompt from ctx.getSystemPrompt().",
		"Turn semantics: not a future-turn recomputation.",
		...formatTokenLines(tokenCount),
		redacted
			? `Redaction: visible sensitive values replaced with ${REDACTED_VALUE}.`
			: "Redaction: none detected.",
	];

	if (redacted && tokenCount.kind !== "unknown") {
		lines.push(
			`Count note: token count based on unredacted prompt text, not visible ${REDACTED_VALUE} output.`,
		);
	}

	lines.push(
		"--- BEGIN SYSTEM PROMPT ---",
		promptBody,
		"--- END SYSTEM PROMPT ---",
	);
	return lines.join("\n");
}

export function createSystemPromptCommandHandler(
	bridge: Pick<SystemPromptCommandBridge, "sendMessage">,
	deps: SystemPromptCommandDeps = {},
) {
	return async (ctx: SystemPromptContext): Promise<void> => {
		const prompt = ctx.getSystemPrompt();
		const { displayPrompt, redacted } = redactSensitivePrompt(prompt);
		const tokenCount = await countTokens(prompt, deps);
		const content = buildTranscript(displayPrompt, redacted, tokenCount);

		bridge.sendMessage({
			customType: SYSTEM_PROMPT_MESSAGE_TYPE,
			content,
			display: true,
		});
	};
}

export function registerSystemPromptCommand(
	bridge: SystemPromptCommandBridge,
	deps: SystemPromptCommandDeps = {},
): void {
	const handler = createSystemPromptCommandHandler(bridge, deps);

	bridge.registerCommand("system-prompt", {
		description: "Show current session system prompt snapshot",
		handler: async (_args, ctx) => {
			await handler(ctx);
		},
	});
}
