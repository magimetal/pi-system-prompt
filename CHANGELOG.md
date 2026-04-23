# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Audited package against `@mariozechner/pi-coding-agent` `0.69.0` breaking changes. No runtime code changes required because package does not import `@sinclair/typebox`, `typebox`, or use session-replacement APIs like `ctx.newSession()`, `ctx.fork()`, or `ctx.switchSession()`.
- Bumped local development and test dependency from `@mariozechner/pi-coding-agent` `0.68.0` to `0.69.0` so typecheck and Vitest run against current extension runtime.

## [0.1.0] - 2026-04-21

### Added
- Migrated legacy `pi-system-prompt` package into repo-root GitHub-installable Pi package layout.
- Added standalone package metadata, shipped file allowlist, MIT license, changelog, gitignore, and lightweight CI verification.
- Migrated extension runtime, TypeScript config, Vitest suite, and local package smoke verification baseline.
- Rewrote README with git install flow, `/system-prompt` behavior, redaction limits, local verification instructions, and package preview image.
- Added migration plan artifact under `docs/plans/` to capture repo move, cutover, and verification sequence.
