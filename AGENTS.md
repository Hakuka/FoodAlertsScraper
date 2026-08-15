# FoodAlertsScraper - Codex instructions

## Project goal

FoodAlertsScraper is a small utility that collects public food-safety alerts from GIS and RASFF, stores local delivery state, and sends new alerts to Telegram.

Keep this project simple. Prefer the smallest clear change that solves the requested problem. Do not introduce architecture, frameworks, services, or abstractions unless the current task actually needs them.

## Stack and runtime

- Node.js 22
- npm with `package-lock.json`
- TypeScript 6 in strict mode
- NodeNext / ESM; TypeScript source imports local modules using `.js` extensions
- Playwright used directly as a browser automation/scraping library, not Playwright Test
- Native `fetch` for Telegram Bot API calls
- `dotenv` for environment variables
- Local JSON state in `data/alerts.json`
- Docker + Docker Compose
- cron inside the container; timezone `Europe/Warsaw`

Do not replace npm with pnpm/yarn and do not add `@playwright/test` unless explicitly requested.

## Important files

- `src/main.ts` - orchestration: scrape, merge, sort, send, mark as sent
- `src/scrapers/` - source-specific scraping logic
- `src/utils/` - small parsing and Playwright helpers
- `src/alerts/` - local alert state and sent-status logic
- `src/models/alertRecord.ts` - shared alert contract
- `src/telegram/` - message formatting and Telegram API client
- `src/config/urls.ts` - external source URLs
- `src/config/env.ts` - environment variables
- `Dockerfile` / `docker-compose.yml` - runtime and scheduling

## Engineering rules

- Read the relevant existing files before editing.
- Preserve the current simple functional/module-based design.
- Prefer small functions with explicit names and types.
- Reuse an existing utility when it already fits; do not create generic helpers for a single call site.
- Avoid dependency injection containers, repository/service layers, factories, event buses, queues, databases, browser pools, retry frameworks, and configuration frameworks unless explicitly requested.
- Do not add or replace dependencies unless the task requires it. Prefer Node.js and Playwright APIs already available in the project.
- Keep TypeScript strict. Do not use `any` to bypass type errors.
- Preserve NodeNext/ESM conventions, including `.js` on relative imports from TypeScript files.
- Keep environment secrets out of source control. Never print or copy Telegram tokens into code, logs, examples, or generated files.
- Do not edit `data/alerts.json` unless the task specifically concerns stored data/state.

## Scraping rules

- External page structure is unstable. Do not invent selectors when the current DOM or existing code does not support them.
- Prefer stable, readable Playwright locators and existing semantic attributes/headings over brittle positional selectors.
- Normalize extracted text with the existing utilities where appropriate.
- Keep `publishedAt` in ISO `YYYY-MM-DD` format.
- Missing optional scraped values should remain `undefined`; user-facing fallback text belongs in formatting code.
- Preserve stable alert IDs unless the task explicitly requires a migration. Changing IDs can cause old alerts to be treated as new and resent.
- Keep browser cleanup in `finally` so Chromium closes on errors.
- Preserve existing GIS/RASFF duplicate handling unless the task explicitly changes it.

## Side effects and validation

Default validation after TypeScript changes:

1. `npm run typecheck`
2. `npm run build`
3. Review the resulting diff for unrelated changes.

Do not run `npm run scrape`, `npm run start`, or `docker compose exec food-alerts-scraper npm run start` merely as a validation step. Those commands can access live sources and may send real Telegram messages when credentials are configured.

For scraper changes, perform live read-only verification only when it is needed and permitted. Do not send Telegram messages as part of verification.

For Docker-only changes, prefer `docker compose config` as the first validation. Build or start containers only when the task requires runtime verification.

`package.json` currently contains a `telegram:test` script whose referenced source file may not exist. Check the target before relying on that script.

## Git safety

- NEVER run `git push`, including force pushes or pushing tags.
- NEVER use Git commands or GitHub tools to publish local changes to a remote repository.
- Do not change Git remotes.
- Do not use destructive commands such as `git reset --hard`, `git clean -fd`, or checkout/restore commands that discard user work unless the user explicitly requests that exact operation.
- Do not create a commit unless the user explicitly asks for a commit.
- Safe inspection commands such as `git status`, `git diff`, `git log`, and `git show` are allowed.
- A project Codex rule in `.codex/rules/no-git-push.rules` also blocks direct `git push` commands.

## Definition of done

A change is complete when:

- it addresses the requested behavior without unrelated refactoring,
- `npm run typecheck` passes,
- `npm run build` passes,
- relevant Docker configuration is checked when Docker files changed,
- no real Telegram message was sent unintentionally,
- no remote Git operation was performed,
- the final response briefly lists changed files, checks performed, and anything that could not be verified.
