---
name: project-validation
description: Validate a FoodAlertsScraper code change safely before handoff. Use when asked to check, verify, review, or finish an implementation while avoiding live Telegram side effects.
---

# Safe project validation

Validate proportionally to the change. Do not turn validation into a refactor.

1. Inspect `git status` and `git diff` so validation covers only the intended files and does not overwrite unrelated user work.
2. For TypeScript/source changes, run:
   - `npm run typecheck`
   - `npm run build`
3. Do not use `npm run scrape` or `npm run start` as routine validation. They access live sources and the normal flow can send Telegram messages when credentials are present.
4. For pure parsing/utility logic, prefer a small targeted invocation or an existing test if one exists. Do not introduce a test framework solely to validate a tiny change unless the user asked for tests.
5. For scraper selector changes, do a live read-only browser check only when necessary and permitted. Verify extraction without passing the result into Telegram sending code.
6. For `docker-compose.yml` changes, run `docker compose config` first when Docker is available.
7. For `Dockerfile` changes, build the image only when runtime/container behavior is part of the task or static checks are insufficient.
8. Never run `git push`. Do not commit unless explicitly requested.
9. Report:
   - checks that passed,
   - checks that failed,
   - checks skipped because they could cause external side effects or required unavailable network/runtime access.
