import type { Locator } from "playwright";
import { normalizeWhiteSpaces } from "./normalizeWhiteSpaces.js";

export async function getCellText(
  row: Locator,
  columnName: string,
): Promise<string> {
  const cell = row.locator(`td[data-col-label="${columnName}"]`);

  if ((await cell.count()) === 0) {
    return "";
  }

  const text = await cell.innerText();

  return normalizeWhiteSpaces(text);
}
