import type { Locator } from "playwright";
import { Urls } from "../config/urls.js";

export async function getReferenceUrl(
  row: Locator,
): Promise<string | undefined> {
  const referenceLink = row.locator('td[data-col-label="Reference"] a').first();

  if ((await referenceLink.count()) === 0) {
    return undefined;
  }

  const href = await referenceLink.getAttribute("href");

  if (!href) {
    return undefined;
  }

  return new URL(href, Urls.rasffWarnings).toString();
}
