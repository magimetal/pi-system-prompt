import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerSystemPromptCommand } from "./system-prompt-core";

type SystemPromptExtensionAPI = Pick<
	ExtensionAPI,
	"registerCommand" | "sendMessage"
>;

export function applySystemPromptExtension(pi: SystemPromptExtensionAPI): void {
	registerSystemPromptCommand(pi);
}

export default function (pi: ExtensionAPI): void {
	applySystemPromptExtension(pi);
}
