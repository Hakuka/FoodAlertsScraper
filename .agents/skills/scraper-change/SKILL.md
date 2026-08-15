---
name: scraper-change
description: Add, fix, or maintain a GIS/RASFF scraper, selector, extracted field, date parser, or source deduplication in FoodAlertsScraper. Use for scraping-related changes; do not use for unrelated Telegram or Docker-only work.
---

# Scraper change workflow

Use the smallest change that fits the existing scraper design.

1. Inspect the affected scraper in `src/scrapers/`, then inspect `src/models/alertRecord.ts`, `src/config/urls.ts`, and only the utilities relevant to the requested field or behavior.
2. Determine whether the change belongs to list-page discovery, detail-page extraction, normalization/parsing, or duplicate filtering. Keep that responsibility in the closest existing module.
3. Preserve the `AlertRecord` contract and stable IDs unless the task explicitly requires a migration:
   - GIS: `GIS:${item.href}`
   - RASFF: `RASFF:${item.reference}`
4. When changing selectors:
   - prefer semantic/stable locators already exposed by the page,
   - avoid positional selectors when a label, heading, `data-*` attribute, or scoped component exists,
   - handle a genuinely optional element without throwing,
   - do not silently return fabricated data when the page format is unknown.
5. Normalize whitespace with existing helpers when appropriate. Keep dates normalized to `YYYY-MM-DD` through `publishedDateParser.ts`.
6. Keep optional extracted data as `undefined`. Do not put display placeholders such as `NOT FOUND` into stored records.
7. Keep Chromium lifecycle protected by `try/finally` and `browser.close()`.
8. Preserve the current RASFF-vs-GIS duplicate suppression unless duplicate behavior is the requested change.
9. If adding a new source, make only the required integrations: source type, URL/config, scraper, aggregation in `main.ts`, stable source-specific ID, and relevant README source list. Do not build a generic scraper framework for one extra source.
10. If live verification is available and needed, use it only to read public source pages and confirm selectors/data. Do not trigger Telegram delivery.
11. Finish with `npm run typecheck` and `npm run build`.

If the external site cannot be reached, make only changes that can be justified from the available code/input and clearly state that the live selector was not verified.
