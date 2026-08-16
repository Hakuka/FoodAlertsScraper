import { chromium, type Page } from "playwright";
import { Urls } from "../config/urls.js";
import type { AlertRecord } from "../models/alertRecord.js";
import type { ScrapeResult } from "../models/scrapeResult.js";
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

export async function scrapeRasffWarnings(
  publishedSince?: string,
): Promise<ScrapeResult> {
  try {
    return {
      source: "RASFF",
      status: "success",
      alerts: await collectRasffWarnings(publishedSince),
    };
  } catch (error) {
    return {
      source: "RASFF",
      status: "failed",
      error,
    };
  }
}

async function collectRasffWarnings(
  publishedSince?: string,
): Promise<AlertRecord[]> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(Urls.rasffWarnings, { waitUntil: "domcontentloaded" });

    const scrapedAt = new Date().toISOString();
    const listItems = await getRasffListItems(page);
    const records: AlertRecord[] = [];

    for (const item of listItems) {
      const publishedAt = normalizeRasffPublishedDate(item.publishedAt);

      if (publishedSince && publishedAt < publishedSince) {
        continue;
      }

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
        publishedAt,
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
