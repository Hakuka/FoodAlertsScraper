import type { Page } from "playwright";
import { normalizeWhiteSpaces } from "./normalizeWhiteSpaces.js";

export async function hasGisPublicWarning(page: Page): Promise<boolean> {
  const measuresTable = page.locator("app-measures-table");

  try {
    await measuresTable.waitFor({ timeout: 5000 });
  } catch {
    return false;
  }

  const measuresText = normalizeWhiteSpaces(
    await measuresTable.innerText(),
  ).toLowerCase();

  const hasPublicWarningText = measuresText.includes(
    "public warning - press release",
  );

  const gisLinks = measuresTable.locator(
    'a[href^="https://www.gov.pl/web/gis/"]',
  );

  const hasGisLink = (await gisLinks.count()) > 0;

  return hasPublicWarningText && hasGisLink;
}
