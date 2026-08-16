import { chromium } from "playwright";
import { Urls } from "../config/urls.js";
import type { AlertRecord } from "../models/alertRecord.js";
import type { ScrapeResult } from "../models/scrapeResult.js";
import { getValueByLabels } from "../utils/getValueByLabels.js";
import { normalizeWhiteSpaces } from "../utils/normalizeWhiteSpaces.js";
import { normalizeGisPublishedDate } from "../utils/publishedDateParser.js";

interface GisListItem {
  date: string;
  title: string;
  href: string;
}

export async function scrapeGisWarnings(
  publishedSince?: string,
): Promise<ScrapeResult> {
  try {
    return {
      source: "GIS",
      status: "success",
      alerts: await collectGisWarnings(publishedSince),
    };
  } catch (error) {
    return {
      source: "GIS",
      status: "failed",
      error,
    };
  }
}

async function collectGisWarnings(
  publishedSince?: string,
): Promise<AlertRecord[]> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(Urls.gisWarnings, { waitUntil: "domcontentloaded" });

    const scrapedAt = new Date().toISOString();
    const listeItems = await getGisListItems(page);
    const records: AlertRecord[] = [];

    for (const item of listeItems) {
      const publishedAt = normalizeGisPublishedDate(item.date);

      if (publishedSince && publishedAt < publishedSince) {
        continue;
      }

      await page.goto(item.href, { waitUntil: "domcontentloaded" });

      const editorContentText = await page
        .locator(".editor-content")
        .innerText();

      const product = getValueByLabels(editorContentText, [
        "Nazwa produktu",
        "Produkt",
      ]);

      const batchNumber = getValueByLabels(editorContentText, [
        "Numer partii",
        "EAN",
      ]);

      const producer = getValueByLabels(editorContentText, [
        "Producent",
        "Marka",
        "Dystrybutor w Polsce",
      ]);

      const record: AlertRecord = {
        id: `GIS:${item.href}`,
        source: "GIS",
        title: item.title,
        publishedAt,
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
