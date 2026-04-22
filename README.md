![Pi System Prompt](docs/pi-system-prompt.png)
# pi-system-prompt

Pi package. Adds `/system-prompt` command for inspecting current session system prompt snapshot.

Repo root = package root. Important because `pi install` from git clones repo and reads root `package.json`.

## Install

From GitHub:

```bash
pi install git:github.com/magimetal/pi-system-prompt
# or
pi install https://github.com/magimetal/pi-system-prompt
```

Project-local install:

```bash
pi install -l git:github.com/magimetal/pi-system-prompt
```

From local checkout:

```bash
pi install /absolute/path/to/pi-system-prompt
# or project-local
pi install -l /absolute/path/to/pi-system-prompt
```

## Command

```text
/system-prompt
```

Command sends transcript-visible snapshot with:

- current prompt text from `ctx.getSystemPrompt()` at command time
- token count line
- redaction status line
- prompt body between `--- BEGIN SYSTEM PROMPT ---` and `--- END SYSTEM PROMPT ---`

Re-running command re-reads current session prompt. Output not future-turn recomputation.

## Redaction behavior

Visible output replaces common secret-like values with `[REDACTED]`.

Observed patterns in code:

- `Authorization:` header values
- `Bearer ...` token values
- assignment-style keys like `api_key=`, `password=`, `token=`
- `x-api-key:` and `x-auth-token:` header values
- `sk-...` style secrets

Important limitation: redaction is pattern-based, not full secret detection. Sensitive text outside those patterns may still appear.

## Token count behavior

Shipped package currently reports estimated count using `4 chars/token heuristic`.

Internal handler also supports:

- exact count mode when host wiring provides exact counter
- explicit unavailable mode when no exact or estimated counter exists

When redaction happens and count available, count note states count came from unredacted prompt text, not visible `[REDACTED]` output.

## Security

`/system-prompt` can expose sensitive system instructions in current session transcript. Use carefully. Redaction covers common token/header patterns only.

## Development

```bash
npm install
npm test
npx tsc --noEmit
npm pack --dry-run
```

Key files:

- `extensions/system-prompt.ts`
- `extensions/system-prompt-core.ts`
- `tests/system-prompt.test.ts`

## Verification shape

Local install proof should use fresh temp `HOME` plus project-local install target so existing global Pi settings cannot false-pass discovery.

Commands used for local verification:

```bash
npm install
npm test
npx tsc --noEmit
npm pack --dry-run
HOME="$TMP_HOME" pi install -l /absolute/path/to/pi-system-prompt
HOME="$TMP_HOME" pi list
HOME="$TMP_HOME" pi config
```

## License

MIT
