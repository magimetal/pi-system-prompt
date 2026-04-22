import { describe, expect, it, vi } from "vitest";
import { applySystemPromptExtension } from "../extensions/system-prompt";
import {
	createSystemPromptCommandHandler,
	registerSystemPromptCommand,
	type SystemPromptCommandBridge,
	type SystemPromptMessage,
} from "../extensions/system-prompt-core";

function createBridge() {
	const sentMessages: SystemPromptMessage[] = [];
	const commands = new Map<
		string,
		{
			description?: string;
			handler: (
				_args: string,
				ctx: { getSystemPrompt(): string },
			) => Promise<void>;
		}
	>();

	const bridge: SystemPromptCommandBridge = {
		registerCommand(name, options) {
			commands.set(name, options);
		},
		sendMessage(message) {
			sentMessages.push(message);
		},
	};

	return { bridge, sentMessages, commands };
}

describe("pi-system-prompt", () => {
	it("extension helper registers /system-prompt command", () => {
		const { bridge, commands } = createBridge();
		applySystemPromptExtension(bridge);

		expect(commands.has("system-prompt")).toBe(true);
		expect(commands.get("system-prompt")?.description).toContain(
			"system prompt snapshot",
		);
	});

	it("register helper wires command through bridge", () => {
		const { bridge, commands } = createBridge();
		registerSystemPromptCommand(bridge);

		expect(commands.has("system-prompt")).toBe(true);
	});

	it("sends transcript-visible output and re-reads prompt on rerun", async () => {
		const { bridge, sentMessages } = createBridge();
		let prompt = "alpha prompt";
		const handler = createSystemPromptCommandHandler(bridge);

		await handler({
			getSystemPrompt: () => prompt,
		});

		prompt = "beta prompt";
		await handler({
			getSystemPrompt: () => prompt,
		});

		expect(sentMessages).toHaveLength(2);
		expect(sentMessages[0]?.display).toBe(true);
		expect(sentMessages[0]?.content).toContain("alpha prompt");
		expect(sentMessages[1]?.content).toContain("beta prompt");
		expect(sentMessages[1]?.content).toContain("ctx.getSystemPrompt()");
		expect(sentMessages[1]?.content).toContain(
			"not a future-turn recomputation",
		);
	});

	it("uses default 4 chars/token heuristic in packaged runtime", async () => {
		const { bridge, sentMessages } = createBridge();
		const handler = createSystemPromptCommandHandler(bridge);

		await handler({
			getSystemPrompt: () => "12345678",
		});

		const content = sentMessages[0]?.content ?? "";
		expect(content).toContain("Token count: ~2 tokens (estimate)");
		expect(content).toContain("Count basis: 4 chars/token heuristic");
	});

	it("redacts sensitive values and discloses unredacted count basis", async () => {
		const { bridge, sentMessages } = createBridge();
		const handler = createSystemPromptCommandHandler(bridge, {
			estimateTokenCounter: () => ({ tokens: 12, basis: "fixture heuristic" }),
		});

		await handler({
			getSystemPrompt: () =>
				"Authorization: Bearer sk-test-secret\napi_key=abc123\nsafe prose stays visible",
		});

		const content = sentMessages[0]?.content ?? "";
		expect(content).toContain("Authorization: [REDACTED]");
		expect(content).toContain("api_key=[REDACTED]");
		expect(content).toContain("safe prose stays visible");
		expect(content).not.toContain("sk-test-secret");
		expect(content).not.toContain("abc123");
		expect(content).toContain(
			"Count note: token count based on unredacted prompt text",
		);
	});

	it("marks start-of-string secret redaction as redacted", async () => {
		const { bridge, sentMessages } = createBridge();
		const handler = createSystemPromptCommandHandler(bridge, {
			estimateTokenCounter: () => ({ tokens: 4, basis: "fixture heuristic" }),
		});

		await handler({
			getSystemPrompt: () => "sk-test-startonly",
		});

		const content = sentMessages[0]?.content ?? "";
		expect(content).toContain("[REDACTED]");
		expect(content).not.toContain("sk-test-startonly");
		expect(content).toContain("Redaction: visible sensitive values replaced");
		expect(content).toContain(
			"Count note: token count based on unredacted prompt text",
		);
	});

	it("prefers exact token counts when exact counter available", async () => {
		const { bridge, sentMessages } = createBridge();
		const exactTokenCounter = vi.fn(async () => ({
			tokens: 42,
			basis: "active model tokenizer",
		}));
		const estimateTokenCounter = vi.fn(() => ({
			tokens: 99,
			basis: "should not be used",
		}));
		const handler = createSystemPromptCommandHandler(bridge, {
			exactTokenCounter,
			estimateTokenCounter,
		});

		await handler({
			getSystemPrompt: () => "plain prompt",
		});

		const content = sentMessages[0]?.content ?? "";
		expect(content).toContain("Token count: 42 tokens (exact)");
		expect(content).toContain("Count basis: active model tokenizer");
		expect(exactTokenCounter).toHaveBeenCalledTimes(1);
		expect(estimateTokenCounter).not.toHaveBeenCalled();
	});

	it("falls back to estimated token counts when exact counter unavailable", async () => {
		const { bridge, sentMessages } = createBridge();
		const handler = createSystemPromptCommandHandler(bridge, {
			exactTokenCounter: () => null,
			estimateTokenCounter: () => ({ tokens: 7, basis: "fixture estimate" }),
		});

		await handler({
			getSystemPrompt: () => "plain prompt",
		});

		const content = sentMessages[0]?.content ?? "";
		expect(content).toContain("Token count: ~7 tokens (estimate)");
		expect(content).toContain("Count basis: fixture estimate");
	});

	it("returns prompt body with explicit unknown token explanation when no counter available", async () => {
		const { bridge, sentMessages } = createBridge();
		const handler = createSystemPromptCommandHandler(bridge, {
			exactTokenCounter: () => null,
			estimateTokenCounter: () => null,
		});

		await handler({
			getSystemPrompt: () => "plain prompt",
		});

		const content = sentMessages[0]?.content ?? "";
		expect(content).toContain("Token count: unavailable");
		expect(content).toContain(
			"Count basis: unavailable. No exact or estimated token counter available for current prompt basis.",
		);
		expect(content).toContain("plain prompt");
	});

	it("register helper wires handler through command bridge", async () => {
		const { bridge, sentMessages, commands } = createBridge();
		registerSystemPromptCommand(bridge, {
			estimateTokenCounter: () => ({ tokens: 3, basis: "fixture estimate" }),
		});

		await commands.get("system-prompt")?.handler("", {
			getSystemPrompt: () => "bridge prompt",
		});

		expect(sentMessages[0]?.content).toContain("bridge prompt");
	});
});
