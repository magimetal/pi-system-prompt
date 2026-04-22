<!--THIS IS A GENERATED FILE - DO NOT MODIFY DIRECTLY, FOR MANUAL ADJUSTMENTS UPDATE `AGENTS_CUSTOM.MD`-->
# ALWAYS READ THESE FILE(S)
- @AGENTS_CUSTOM.md

# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-22T05:20:18Z
**Commit:** 0fb8f0b
**Branch:** main

## OVERVIEW
Git-installable Pi package. Ships `/system-prompt` command extension for snapshotting active session system prompt with redaction and token count notes.

## STRUCTURE
```text
pi-system-prompt/
├── extensions/    # packaged runtime entrypoint + command implementation
├── tests/         # Vitest behavior coverage for registration, redaction, token counts
├── docs/          # image asset + migration plan artifact
├── .github/       # CI verify job
└── package.json   # Pi package manifest; repo root = package root
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Package manifest / shipped files | `package.json` | `pi.extensions` points at `./extensions/system-prompt.ts`; `files` allowlist controls pack output |
| Command registration | `extensions/system-prompt.ts` | Thin extension adapter only |
| Runtime behavior | `extensions/system-prompt-core.ts` | Redaction, token counting, transcript assembly |
| Behavior tests | `tests/system-prompt.test.ts` | Characterization suite; update deliberately when output copy changes |
| Install / operator docs | `README.md` | Git install flow, security note, verification shape |
| CI baseline | `.github/workflows/ci.yml` | Install + test + typecheck + pack dry-run |
| Migration history | `docs/plans/pi-system-prompt-git-package-migration.md` | Why repo root became package root |

## CODE MAP
| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|
| `applySystemPromptExtension` | function | `extensions/system-prompt.ts` | Unknown | Register helper for extension API subset |
| `redactSensitiveValue` | function | `extensions/system-prompt-core.ts` | Unknown | Single-pattern replacer; preserves prefix; flips changed flag |
| `redactSensitivePrompt` | function | `extensions/system-prompt-core.ts` | Unknown | Runs redaction patterns over prompt |
| `countTokens` | async function | `extensions/system-prompt-core.ts` | Unknown | Exact -> estimate -> unknown fallback ladder |
| `buildTranscript` | function | `extensions/system-prompt-core.ts` | Unknown | Transcript text builder |
| `createSystemPromptCommandHandler` | function | `extensions/system-prompt-core.ts` | Unknown | Reads prompt, redacts, counts, sends message |
| `registerSystemPromptCommand` | function | `extensions/system-prompt-core.ts` | Unknown | Binds `/system-prompt` command into bridge |
| `createBridge` | test helper | `tests/system-prompt.test.ts` | Unknown | In-memory bridge for command registration + output assertions |

## CONVENTIONS
- Repo root = package root. Do not nest runtime under secondary package dir.
- Runtime stays extension-only. No packaged skills, prompts, or themes here.
- Command output is transcript-visible text, not hidden telemetry.
- Redaction placeholder must stay literal `[REDACTED]`.
- Tests assert user-facing copy. If copy changes, update tests deliberately.

## ANTI-PATTERNS (THIS PROJECT)
- Breaking `/system-prompt` command name or transcript markers.
- Claiming exact secret detection. Redaction is pattern-based only.
- Adding runtime deps or peers without import evidence from `extensions/`.
- Verifying install with ambient global Pi config. Use isolated `HOME`.
- Shipping junk from `.pi-lens/`, coverage, tarballs, or `node_modules/`.

## UNIQUE STYLES
- Thin adapter in `extensions/system-prompt.ts`; behavior lives in core file.
- Output copy explains basis and uncertainty, not bare numbers.
- Test suite doubles as behavior contract for README claims.

## COMMANDS
```bash
npm test
npm run typecheck
npm run check
npm pack --dry-run
```

## NOTES
- `.pi-lens/` exists locally for indexed function metadata; not shipped.
- LSP unavailable during doc generation. CODE MAP refs derived from local `.pi-lens` index + source readback.
- No child `AGENTS.md` generated. Observed: repo has 30 files total, small surface area, and subdirs did not cross standalone-doc scoring threshold.
