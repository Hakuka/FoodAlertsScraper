import type { Page } from "playwright";
import { normalizeWhiteSpaces } from "./normalizeWhiteSpaces.js";

export async function getNotificationValueByLabel(
  page: Page,
  label: string,
): Promise<string | undefined> {
  const item = page
    .locator("#main-info app-nt-item")
    .filter({
      has: page.getByRole("heading", {
        name: label,
        exact: true,
      }),
    })
    .first();

  if ((await item.count()) === 0) {
    return undefined;
  }

  const value = item.locator("p").first();

  if ((await value.count()) === 0) {
    return undefined;
  }

  const text = await value.innerText();
  const normalizedText = normalizeWhiteSpaces(text);

  if (!normalizedText) {
    return undefined;
  }

  return normalizedText;
}
