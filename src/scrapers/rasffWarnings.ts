import { chromium, type Locator, type Page } from "playwright";
import { Urls } from "../config/urls.js";
import type { AlertRecord } from "../models/alertRecord.js";
import { normalizeRasffPublishedDate } from "../utils/publishedDateParser.js";

interface RasffListItem {
  reference: string;
  title: string;
  publishedAt: string;
  detailUrl: string;
}

export async function scrapeRasffWarnings(): Promise<AlertRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(Urls.rasffWarnings, { waitUntil: "domcontentloaded" });

    const scrapedAt = new Date().toISOString();
    const listItems = await getRasffListItems(page);
    const records: AlertRecord[] = [];

    for (const item of listItems) {
      await page.goto(item.detailUrl, { waitUntil: "domcontentloaded" });

      const shouldSkipAlert = await hasGisPublicWarning(page);

      if (shouldSkipAlert) {
        console.log(`Skipped GIS duplicate: ${item.reference}`);
        continue;
      }

      const product = await getNotificationValueByLabel(page, "Product");

      const record: AlertRecord = {
        id: `RASFF:${item.reference}`,
        source: "RASFF",
        title: item.title,
        publishedAt: normalizeRasffPublishedDate(item.publishedAt),
        url: item.detailUrl,
        scrapedAt,
        sent: false,
      };

      if (product) {
        record.product = product;
      }

      records.push(record);
    }

    return records;
  } finally {
    await browser.close();
  }
}

async function getRasffListItems(page: Page): Promise<RasffListItem[]> {
  const allAlerts = page.locator("table.eui-table tbody tr");

  // Wait until at least one alert row is loaded
  await allAlerts.first().waitFor();

  const rowsAlerts = await allAlerts.all();
  const listItems: RasffListItem[] = [];

  for (const row of rowsAlerts) {
    const reference = await getCellText(row, "Reference");
    const title = await getCellText(row, "Subject");
    const publishedAt = await getCellText(row, "Date");
    const detailUrl = await getReferenceUrl(row);

    if (!reference || !detailUrl) {
      continue;
    }

    listItems.push({
      reference,
      title,
      publishedAt,
      detailUrl,
    });
  }

  return listItems;
}

async function getCellText(row: Locator, columnName: string): Promise<string> {
  const cell = row.locator(`td[data-col-label="${columnName}"]`);

  if ((await cell.count()) === 0) {
    return "";
  }

  const text = await cell.innerText();

  return normalizeWhiteSpaces(text);
}

async function getReferenceUrl(row: Locator): Promise<string | undefined> {
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

async function hasGisPublicWarning(page: Page): Promise<boolean> {
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

async function getNotificationValueByLabel(
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

function normalizeWhiteSpaces(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}
