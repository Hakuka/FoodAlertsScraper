import { chromium } from "playwright";
import { Urls } from "../config/urls.js";
import type { AlertRecord } from "../models/alertRecord.js";
import { extractValueByLabels } from "../utils/extractValueByLabels.js";
import { normalizeWhiteSpaces } from "../utils/normalizeWhiteSpaces.js";
import { normalizeGisPublishedDate } from "../utils/publishedDateParser.js";

interface GisListItem {
  date: string;
  title: string;
  href: string;
}

export async function scrapeGisWarnings(): Promise<AlertRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(Urls.gisWarnings, { waitUntil: "domcontentloaded" });

    const scrapedAt = new Date().toISOString();
    const listeItems = await getGisListItems(page);
    const records: AlertRecord[] = [];

    for (const item of listeItems) {
      await page.goto(item.href, { waitUntil: "domcontentloaded" });

      const editorContentText = await page
        .locator(".editor-content")
        .innerText();

      const product = extractValueByLabels(editorContentText, [
        "Nazwa produktu",
        "Produkt",
      ]);

      const batchNumber = extractValueByLabels(editorContentText, [
        "Numer partii",
        "EAN",
      ]);

      const producer = extractValueByLabels(editorContentText, [
        "Producent",
        "Marka",
        "Dystrybutor w Polsce",
      ]);

      const record: AlertRecord = {
        id: `GIS:${item.href}`,
        source: "GIS",
        title: item.title,
        publishedAt: normalizeGisPublishedDate(item.date),
        url: item.href,
        scrapedAt,
        sent: false,
      };

      if (product) {
        record.product = product;
      }

      if (batchNumber) {
        record.batchNumber = batchNumber;
      }

      if (producer) {
        record.producer = producer;
      }

      records.push(record);
    }

    return records;
  } finally {
    await browser.close();
  }
}

async function getGisListItems(
  page: import("playwright").Page,
): Promise<GisListItem[]> {
  const warningItems = page.locator(".article-area__article").locator("li");

  // Wait until at least one warning row is loaded
  await warningItems.first().waitFor();

  const rows = await warningItems.all();
  const warnings: GisListItem[] = [];

  for (const row of rows) {
    const date = await row.locator(".event .date").innerText();
    const link = row.locator(".title a").first();
    const title = await link.innerText();
    const href = await link.getAttribute("href");

    if (!href) {
      continue;
    }

    warnings.push({
      date: normalizeWhiteSpaces(date),
      title: normalizeWhiteSpaces(title),
      href: new URL(href, Urls.gisWarnings).toString(),
    });
  }

  return warnings;
}
