import { chromium, type Page } from "playwright";
import { Urls } from "../config/urls.js";
import type { AlertRecord } from "../models/alertRecord.js";
import { getCellText } from "../utils/getCellText.js";
import { getNotificationValueByLabel } from "../utils/getNotificationValueByLabel.js";
import { getReferenceUrl } from "../utils/getReferenceUrl.js";
import { hasGisPublicWarning } from "../utils/hasGisPublicWarning.js";
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
        //console.log(`Skipped GIS duplicate: ${item.reference}`);
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
