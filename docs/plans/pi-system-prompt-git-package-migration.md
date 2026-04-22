# Plan: pi-system-prompt Git Package Migration

- **Status:** Revised draft for re-review
- **Date:** 2026-04-21
- **Objective:** Migrate `pi-system-prompt` from legacy local package path `/Users/magimetal/.pi/agent/packages/pi-system-prompt` into this repository so repo root becomes publishable Pi package installable with `pi install git:github.com/magimetal/pi-system-prompt`, then update `README.md` to document install and runtime behavior accurately.
- **Plan path:** `docs/plans/pi-system-prompt-git-package-migration.md`
- **Target repo:** `/Users/magimetal/Dev/pi/pi-system-prompt`
- **Legacy source:** `/Users/magimetal/.pi/agent/packages/pi-system-prompt`
- **Example repos:**
  - `/Users/magimetal/Dev/pi/pi-gizmo`
  - `/Users/magimetal/Dev/pi/pi-dev-browser`
  - `/Users/magimetal/Dev/pi/pi-gremlins`
- **Pi docs:**
  - `/Users/magimetal/.nvm/versions/node/v24.14.0/lib/node_modules/@mariozechner/pi-coding-agent/docs/packages.md`
  - `/Users/magimetal/.nvm/versions/node/v24.14.0/lib/node_modules/@mariozechner/pi-coding-agent/docs/skills.md`
- **Global settings hazard:** `/Users/magimetal/.pi/agent/settings.json`

## Scope

In scope:
- repo-root package migration
- repo metadata and support files needed for git-installable package
- README rewrite
- verification plan for local-path and remote git install
- legacy cutover and stale settings cleanup plan

Out of scope:
- new feature work
- ADR authoring unless migration uncovers architectural change beyond straight package relocation
- unrelated cleanup outside legacy `pi-system-prompt` references

## Current Evidence

### Target repo now

- `README.md` contains placeholder title only.
- No repo-root `package.json`, runtime source, tests, changelog, license, or CI workflows observed.
- Repo remote already points at `git@github.com:magimetal/pi-system-prompt.git`.

### Legacy package now

- `package.json` exists with `name: "pi-system-prompt"`, `version: "0.0.1-local"`, `type: "module"`, `keywords` including `pi-package`, `pi.extensions: ["./extensions/system-prompt.ts"]`, peer dependency on `@mariozechner/pi-coding-agent`, and `vitest` test script.
- `extensions/system-prompt.ts` is thin entrypoint delegating to `extensions/system-prompt-core.ts`.
- `extensions/system-prompt-core.ts` implements `/system-prompt`, prompt redaction to `[REDACTED]`, and token-count reporting.
- `tests/system-prompt.test.ts` covers registration, rerun behavior, redaction, exact token counts, estimated token counts, and unavailable-token fallback.
- `tsconfig.json`, `vitest.config.ts`, and `package-lock.json` exist in legacy package.

### Example repo signals

- `pi-gizmo` and `pi-dev-browser` show publishable repo-root package shape: `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, `files` allowlist, GitHub metadata, scripts, and workflow baseline.
- `pi-gremlins` confirms lighter extension-only repo-root package layout.
- Common pattern: repo root is package root, extension path resolves from repo root, README explains git install flow.

### Known false-pass hazard

- `/Users/magimetal/.pi/agent/settings.json` currently contains `"./packages/pi-system-prompt"`.
- Impact: `pi list`, `pi config`, or runtime checks can pass because legacy package still auto-loads.
- Control: pre-push and post-push verification must run in fresh temp project plus fresh temp `HOME`.

## Package Decisions

### Decision 1 — Repo root becomes package root

- **Decision:** Use repository root as package root.
- **Why:** Required for `pi install git:...` to clone repo and discover root `package.json`; matches all three example repos.

### Decision 2 — Extension-only package

- **Decision:** Keep package scope extension-only.
- **Why:** Observed legacy package ships extension files only. No packaged skills, prompts, or themes observed.

### Decision 3 — Minimal publishable repo baseline

- **Decision:** Add repo-root `package.json`, migrated runtime/config/tests, rewritten `README.md`, `.gitignore`, `CHANGELOG.md`, `LICENSE`, and at least one CI workflow if examples justify lightweight automation.
- **Why:** Needed for publishable package parity with sibling repos and verifiable git-install flow.

### Decision 4 — ADR not required

- **Decision:** Do not create ADR for this migration.
- **Why:** Observed change is straight package relocation plus repo packaging hygiene, not architecture change, runtime redesign, or cross-package policy shift.
- **Revisit trigger:** Only revisit if execution uncovers non-trivial architectural decision such as bundling additional resource types, changing runtime model, or introducing new release/distribution architecture.

### Decision 5 — Verification split by lifecycle stage

- **Decision:** Separate verification into:
  1. **pre-push local-path proof** from repo working tree
  2. **post-push remote git proof** from exact pushed ref
  3. **legacy cutover cleanup** only after remote git proof passes
- **Why:** Prevent false confidence from verifying unpublished local state and prevent stale settings drift.

## Expected Files Touched During Execution

### Repo files

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vitest.config.ts`
- `extensions/system-prompt.ts`
- `extensions/system-prompt-core.ts`
- `tests/system-prompt.test.ts`
- `README.md`
- `.gitignore`
- `CHANGELOG.md`
- `LICENSE`
- `.github/workflows/ci.yml` *(recommended, if kept lightweight and justified)*

### External file for cutover cleanup

- `/Users/magimetal/.pi/agent/settings.json`

### Legacy source path subject to cutover

- `/Users/magimetal/.pi/agent/packages/pi-system-prompt`

## Phase 1 — Inventory, Governance, and Cutover Contract

### Milestone

Execution starts with exact source inventory, explicit no-ADR decision, and documented legacy cutover sequence.

### Task 1.1 — Record ADR decision and migration boundary

- **What:** Document that ADR is not required for this straight migration and define revisit trigger if scope expands.
- **References:** this plan; package migration objective; example repos.
- **Acceptance criteria:** Plan states ADR not required, why, and what would force reconsideration.
- **Guardrails:** Do not open docs/adr work for routine repo migration. Do not treat README/package hygiene as architecture decision.
- **Verification:** Manual review of plan text before implementation begins.

### Task 1.2 — Build legacy-to-repo migration inventory

- **What:** Map every legacy package artifact to target repo path and classify each as migrate-as-is, adapt, create-new, or omit.
- **References:**
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt`
  - `/Users/magimetal/Dev/pi/pi-system-prompt`
  - example repo roots
- **Acceptance criteria:** Inventory covers manifest, lockfile, TypeScript config, Vitest config, extension files, tests, README work, support files, workflows, and known junk paths like `.pi-lens/`.
- **Guardrails:** Do not start implementation before inventory exists. Do not omit `package-lock.json`, `tsconfig.json`, `vitest.config.ts`, or tests.
- **Verification:** Manual inventory checklist against observed source tree.

### Task 1.3 — Define legacy cutover sequence and stale-settings policy

- **What:** Define exact order for cutting over source of truth from legacy package path to repo-root package, then cleaning up stale config.
- **References:**
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt`
  - `/Users/magimetal/.pi/agent/settings.json`
  - Pi package docs on scope and deduplication
- **Acceptance criteria:** Plan explicitly states:
  - legacy package remains untouched until repo package passes pre-push verification
  - stale `./packages/pi-system-prompt` entry in `/Users/magimetal/.pi/agent/settings.json` is removed or replaced only after post-push remote git proof passes
  - zero-reference check happens before deleting or trashing legacy package directory
  - non-destructive removal uses `trash`, not `rm`, if legacy directory is retired
- **Guardrails:** Do not delete legacy package early. Do not leave global settings pointing at stale path after successful cutover. Do not mutate unrelated package entries.
- **Verification:** Cutover checklist present in plan and sequenced after remote proof.

### Task 1.4 — Lock repo-root package metadata contract

- **What:** Define final manifest contract for root `package.json`.
- **References:**
  - legacy `package.json`
  - `/Users/magimetal/Dev/pi/pi-gizmo/package.json`
  - `/Users/magimetal/Dev/pi/pi-dev-browser/package.json`
  - `/Users/magimetal/Dev/pi/pi-gremlins/package.json`
  - Pi package docs
- **Acceptance criteria:** Contract explicitly states:
  - `name: "pi-system-prompt"`
  - normalized releasable version, not `0.0.1-local`
  - `keywords` include `pi-package`
  - GitHub metadata points at `https://github.com/magimetal/pi-system-prompt`
  - `pi.extensions` points at `./extensions/system-prompt.ts`
  - `files` allowlist includes shipped runtime/docs/license/changelog and excludes junk
  - `peerDependencies` contain only actual Pi runtime imports used by runtime code
- **Guardrails:** Do not invent unsupported `pi` keys. Do not carry forward local-only version suffix. Do not copy broader peer dependency set without import evidence.
- **Verification:** Manifest contract checklist reviewed before implementation.

### Phase 1 exit gate

- ADR decision recorded.
- Inventory complete.
- Cutover order explicit.
- Manifest contract explicit.

## Phase 2 — Migrate Package Into Repo Root

### Milestone

Repo root contains behavior-parity package baseline before docs and cutover work.

### Task 2.1 — Migrate runtime, tests, and config from legacy package

- **What:** Copy/migrate extension source, tests, lockfile, and TypeScript/Vitest config into repo-root package structure.
- **References:**
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt/extensions/system-prompt.ts`
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt/extensions/system-prompt-core.ts`
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt/tests/system-prompt.test.ts`
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt/tsconfig.json`
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt/vitest.config.ts`
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt/package-lock.json`
- **Acceptance criteria:** Repo root contains `extensions/`, `tests/`, `tsconfig.json`, `vitest.config.ts`, and `package-lock.json` aligned to legacy behavior.
- **Guardrails:** Preserve behavior first. Do not rename `/system-prompt`. Do not weaken tests while migrating files.
- **Verification:** Tree review against migration inventory.

### Task 2.2 — Author repo-root `package.json`

- **What:** Create root manifest using migrated legacy metadata plus repo metadata patterns from example packages.
- **References:** legacy `package.json`; example package manifests; repo remote URL.
- **Acceptance criteria:** Root manifest includes description, version, keywords, repository/homepage/bugs metadata, scripts, `files` allowlist, and `pi.extensions` entry.
- **Guardrails:** Do not misclassify Pi runtime dependency into `dependencies`. Do not add unsupported package resources. Do not leave missing metadata required for git-installable package docs.
- **Verification:** Manifest review plus later `npm pack --dry-run`.

### Task 2.3 — Verify runtime import-to-dependency contract

- **What:** Audit runtime imports under `extensions/` and align `peerDependencies`, `dependencies`, and `devDependencies` to actual usage.
- **References:**
  - `extensions/system-prompt.ts`
  - `extensions/system-prompt-core.ts`
  - root `package.json`
- **Acceptance criteria:**
  - `peerDependencies` contain `@mariozechner/pi-coding-agent` and nothing extra unless runtime imports prove otherwise
  - no unused Pi runtime peers copied from example repos
  - test-only tools stay in `devDependencies`
- **Guardrails:** Do not broaden peer deps by imitation. Do not hide missing runtime deps behind devDependencies. Do not leave unused dependency declarations.
- **Verification:** Import audit using exact command pair during execution phase:
  ```bash
  REPO_ROOT="/Users/magimetal/Dev/pi/pi-system-prompt"
  (
    cd "$REPO_ROOT" &&
    rg -n 'from "@mariozechner/|import\("@mariozechner/' extensions &&
    node --input-type=module -e 'import fs from "node:fs"; const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")); console.log(JSON.stringify({peerDependencies: pkg.peerDependencies ?? {}, dependencies: pkg.dependencies ?? {}, devDependencies: pkg.devDependencies ?? {}}, null, 2));'
  )
  ```

### Task 2.4 — Preserve runtime verification baseline

- **What:** Keep or extend tests so README and package docs only claim behavior backed by code and automated checks.
- **References:** `tests/system-prompt.test.ts`; `extensions/system-prompt-core.ts`.
- **Acceptance criteria:** Automated coverage still proves at least:
  - `/system-prompt` registration
  - rerun re-reads current prompt
  - redaction outputs `[REDACTED]`
  - exact token count mode
  - estimated token count mode
  - unavailable token count fallback
- **Guardrails:** Do not remove characterization tests to simplify migration. Do not add README claims not covered by code or tests.
- **Verification:** `npm test` must cover documented behavior before README finalized.

### Phase 2 exit gate

- Runtime/config/tests migrated.
- Root manifest authored.
- Dependency contract verified.
- Behavior-verification baseline intact.

## Phase 3 — README and Repo Support Artifacts

### Milestone

Repo reads like standalone package and documentation matches actual runtime behavior.

### Task 3.1 — Rewrite `README.md` from verified package behavior

- **What:** Replace placeholder README with install, usage, behavior, security, and maintainer sections grounded in code and tests.
- **References:**
  - `README.md`
  - `extensions/system-prompt-core.ts`
  - `tests/system-prompt.test.ts`
  - example READMEs in `/Users/magimetal/Dev/pi/pi-gizmo`, `/Users/magimetal/Dev/pi/pi-dev-browser`, `/Users/magimetal/Dev/pi/pi-gremlins`
  - Pi package docs install syntax
- **Acceptance criteria:** README includes only verified claims for:
  - package purpose
  - git install command: `pi install git:github.com/magimetal/pi-system-prompt`
  - local-path install example for development
  - `/system-prompt` command summary
  - redaction behavior using `[REDACTED]`
  - token count modes and limitations at high level
  - local development commands
  - security note that prompt output may contain sensitive content before redaction rules apply
- **Guardrails:** Do not claim skills, prompts, or themes. Do not mention `/reload` unless verified by docs or runtime need. Do not describe token counts more precisely than tests/code support.
- **Verification:** README claim matrix review against code/tests before merge.

### Task 3.2 — Add `CHANGELOG.md` and `LICENSE`

- **What:** Add basic release-support docs aligned to example repos and manifest metadata.
- **References:** example changelogs and licenses in sibling repos; root `package.json`.
- **Acceptance criteria:**
  - `CHANGELOG.md` exists with initial migration/release entry aligned to final package version
  - `LICENSE` exists and matches manifest license field
- **Guardrails:** Do not invent fake release history. Do not leave manifest pointing at missing license.
- **Verification:** Version/license consistency review after files written.

### Task 3.3 — Add `.gitignore` and exclude non-source artifacts

- **What:** Add ignore rules for `node_modules/`, `.pi-lens/`, temp verification dirs, tarballs, and other generated outputs.
- **References:** current repo contents; example ignore files.
- **Acceptance criteria:** Generated artifacts remain untracked and shipped package allowlist excludes junk.
- **Guardrails:** Do not ignore authored source or docs. Do not leave `.pi-lens/` packaged or tracked accidentally.
- **Verification:** `git status --short` clean check during execution.

### Task 3.4 — Add lightweight CI only if justified by package baseline

- **What:** Decide whether to add `.github/workflows/ci.yml` for install, test, typecheck, and package dry-run.
- **References:** example workflows in `pi-gizmo` and `pi-dev-browser`.
- **Acceptance criteria:**
  - if added, CI runs repo-root install + test + typecheck and can include `npm pack --dry-run`
  - if deferred, plan or implementation notes explain why git-install goal does not need CI yet
- **Guardrails:** Do not cargo-cult publish workflow if git install from repo is only release target. Do not add workflow noise without purpose.
- **Verification:** Workflow scope decision documented and file reviewed if added.

### Phase 3 exit gate

- README rewritten from verified behavior.
- Changelog/license present.
- Ignore policy present.
- CI decision documented.

## Phase 4 — Pre-Push Local Verification

### Milestone

Repo working tree proves build/test/package behavior and project-local Pi install from local path in isolated environment.

### Task 4.1 — Run local quality gate

- **What:** Verify install, tests, typecheck, and packaged file list from repo working tree.
- **References:** final repo-root package files and scripts.
- **Acceptance criteria:** Exact command evidence shows success for install, tests, typecheck, and package dry-run.
- **Guardrails:** Do not claim complete without output. Do not skip `npm pack --dry-run`. Do not skip dependency audit from Task 2.3.
- **Verification:** Copy-paste-safe command set for execution phase:
  ```bash
  REPO_ROOT="/Users/magimetal/Dev/pi/pi-system-prompt"
  (
    cd "$REPO_ROOT" &&
    npm install &&
    npm test &&
    npx tsc --noEmit &&
    npm pack --dry-run
  )
  ```

### Task 4.2 — Prove isolated local-path install in temp project

- **What:** Install repo package into fresh temp project with fresh temp `HOME` using project-local scope.
- **References:** Pi package docs install syntax; repo root path; stale global settings hazard.
- **Acceptance criteria:** In clean environment, `pi install -l` from local repo path succeeds and `pi list` plus `pi config` show package resources without relying on existing global settings.
- **Guardrails:** Do not reuse normal `HOME`. Do not run in existing repo checkout. Do not let global stale package entry affect result.
- **Verification:** Copy-paste-safe command set for execution phase:
  ```bash
  REPO_ROOT="/Users/magimetal/Dev/pi/pi-system-prompt"
  TMP_HOME="$(mktemp -d)"
  TMP_PROJECT="$(mktemp -d)"
  git init -q "$TMP_PROJECT"
  (
    cd "$TMP_PROJECT" &&
    HOME="$TMP_HOME" pi install -l "$REPO_ROOT" &&
    HOME="$TMP_HOME" pi list &&
    HOME="$TMP_HOME" pi config
  )
  ```

### Task 4.3 — Verify README/runtime claims against observed local proof

- **What:** Confirm README install/usage statements still match actual pre-push behavior and automated runtime coverage.
- **References:** `README.md`; `tests/system-prompt.test.ts`; local verification outputs.
- **Acceptance criteria:** README install command, command name, redaction placeholder, and token-count description all match tested behavior and observed package discovery.
- **Guardrails:** Do not ship README with unverified operational steps. Do not rely on placeholder prose.
- **Verification:** Manual claim-by-claim cross-check using Task 4.1 and 4.2 outputs plus tests.

### Phase 4 exit gate

- Local quality gate passes.
- Isolated local-path install proof passes.
- README claims match observed and tested behavior.

## Phase 5 — Post-Push Remote Git Proof and Legacy Cutover

### Milestone

Exact pushed ref installs from remote git source, then stale legacy config and source path get cleaned up safely.

### Task 5.1 — Prove remote git install from exact pushed ref

- **What:** After push, verify package installs from remote git source using exact branch, tag, or commit SHA.
- **References:** repo remote URL; Pi package docs git install syntax.
- **Acceptance criteria:** Fresh temp project plus fresh temp `HOME` show successful install from remote git source, and `pi list` plus `pi config` show package resources from remote source. Verified ref is already pushed and reachable in non-interactive git context.
- **Guardrails:** Do not reuse pre-push temp environment. Do not verify against unpublished working tree. Do not use floating ref when exact pushed state must be proven. Do not rely on interactive auth prompts or local-only refs.
- **Verification:** Copy-paste-safe command set for execution phase:
  ```bash
  PUSHED_REF="<branch-or-tag-or-sha>"
  TMP_HOME="$(mktemp -d)"
  TMP_PROJECT="$(mktemp -d)"
  git init -q "$TMP_PROJECT"
  (
    cd "$TMP_PROJECT" &&
    HOME="$TMP_HOME" GIT_TERMINAL_PROMPT=0 pi install -l "git:github.com/magimetal/pi-system-prompt@$PUSHED_REF" &&
    HOME="$TMP_HOME" pi list &&
    HOME="$TMP_HOME" pi config
  )
  ```

### Task 5.2 — Clean stale global settings entry

- **What:** Remove or replace stale legacy package registration in `/Users/magimetal/.pi/agent/settings.json` after remote proof succeeds.
- **References:** `/Users/magimetal/.pi/agent/settings.json`; Pi package docs on scope and deduplication.
- **Acceptance criteria:**
  - global settings no longer point at `./packages/pi-system-prompt`
  - if desired runtime state is permanent install, settings reflect new intended source exactly once
  - no duplicate active entries exist for same package identity across local legacy path and git source in same scope
- **Guardrails:** Do not edit unrelated package entries. Do not clean stale settings before remote proof passes. Do not leave both legacy local path and new git source active in same scope.
- **Verification:** Re-read settings file and run `pi list` after cleanup in normal environment or explicitly document if user chooses to defer permanent install.

### Task 5.3 — Retire legacy package directory safely

- **What:** Remove legacy source directory only after settings cleanup and zero-reference check pass; otherwise leave it as explicit manual-backup exception.
- **References:**
  - `/Users/magimetal/.pi/agent/packages/pi-system-prompt`
  - `/Users/magimetal/.pi/agent/settings.json`
  - repo docs and scripts that may mention legacy path
- **Acceptance criteria:**
  - exact legacy path `/Users/magimetal/.pi/agent/packages/pi-system-prompt` has no remaining live references in checked settings, repo docs, or repo scripts
  - relative settings-form reference `./packages/pi-system-prompt` has no remaining live references before retirement
  - legacy directory is trashed non-destructively or retained with documented reason
- **Guardrails:** Do not use `rm`. Do not remove legacy directory while any config still references either `/Users/magimetal/.pi/agent/packages/pi-system-prompt` or `./packages/pi-system-prompt`. Do not treat repo migration complete if stale references remain.
- **Verification:** Zero-reference check plus non-destructive cleanup command during execution phase:
  ```bash
  LEGACY_ROOT="/Users/magimetal/.pi/agent/packages/pi-system-prompt"
  LEGACY_SETTINGS_REF="./packages/pi-system-prompt"
  GLOBAL_SETTINGS="/Users/magimetal/.pi/agent/settings.json"
  REPO_ROOT="/Users/magimetal/Dev/pi/pi-system-prompt"
  rg -n --fixed-strings -e "$LEGACY_ROOT" -e "$LEGACY_SETTINGS_REF" "$GLOBAL_SETTINGS" "$REPO_ROOT"
  ```
  If zero live references remain and retirement is desired:
  ```bash
  trash "/Users/magimetal/.pi/agent/packages/pi-system-prompt"
  ```

### Phase 5 exit gate

- Remote git install proof passes from exact pushed ref.
- Stale global settings entry cleaned or explicitly deferred by user choice.
- Legacy package directory retired safely or retained with documented reason.

## Recommended Execution Order

1. Task 1.1 — record ADR decision
2. Task 1.2 — build migration inventory
3. Task 1.3 — define cutover sequence and stale-settings policy
4. Task 1.4 — lock manifest contract
5. Task 2.1 — migrate runtime/tests/config
6. Task 2.2 — author root `package.json`
7. Task 2.3 — verify dependency contract
8. Task 2.4 — preserve runtime verification baseline
9. Task 3.1 — rewrite `README.md`
10. Task 3.2 — add changelog/license
11. Task 3.3 — add `.gitignore`
12. Task 3.4 — add or defer lightweight CI
13. Task 4.1 — run local quality gate
14. Task 4.2 — run isolated pre-push local-path install proof
15. Task 4.3 — confirm README/runtime claims against observed proof
16. Push exact ref
17. Task 5.1 — run isolated post-push remote git install proof
18. Task 5.2 — clean stale global settings entry
19. Task 5.3 — retire legacy package path safely

## Risks and Unknowns

### Risk 1 — False-pass from existing global package registration
- **Impact:** Broken migration looks healthy because Pi still loads legacy local package.
- **Control:** Fresh temp `HOME` plus temp project for both pre-push and post-push proofs.

### Risk 2 — README drifts from actual runtime behavior
- **Impact:** Package installs but user-facing docs misstate redaction or token-count semantics.
- **Control:** README claims must map to code/tests and pre-push observed outputs.

### Risk 3 — Dependency metadata copied from examples instead of actual imports
- **Impact:** Package declares unnecessary peers or misses required runtime peers.
- **Control:** Explicit import-to-dependency audit in Task 2.3.

### Risk 4 — Legacy cutover incomplete
- **Impact:** Users keep loading stale local path, hiding defects and creating duplicate package sources.
- **Control:** Post-push settings cleanup plus zero-reference check before retiring legacy directory.

### Risk 5 — CI/workflow scope drifts beyond migration goal
- **Impact:** Plan expands into release automation unrelated to git-installable package objective.
- **Control:** Keep CI lightweight and justify every added workflow.

## Key Assumptions

- Package remains extension-only.
- Canonical home stays `https://github.com/magimetal/pi-system-prompt`.
- Git install from repo is primary distribution target.
- Existing Vitest suite remains baseline runtime proof.
- Normalizing version away from `0.0.1-local` is required for publishable package posture.

## Self-Review Checklist

- [x] Existing plan revised in place only
- [x] No production code or repo files outside `docs/plans/` changed
- [x] ADR decision stated explicitly
- [x] Legacy cutover and stale-settings cleanup added
- [x] Pre-push local-path proof separated from post-push remote git proof
- [x] Verification commands written copy-paste-safe with temp dirs and absolute paths
- [x] README/runtime verification tightened
- [x] Dependency verification tightened
- [x] Scope remains migration, README, verification, and legacy cutover only
