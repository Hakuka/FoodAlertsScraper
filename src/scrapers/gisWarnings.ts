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

interface RawGisListItem {
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
  } catch (firstError) {
    console.warn("GIS scraper failed. Retrying once...", firstError);
  }

  try {
    return {
      source: "GIS",
      status: "success",
      alerts: await collectGisWarnings(publishedSince, true),
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
  skipIncompleteListItems = false,
): Promise<AlertRecord[]> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(Urls.gisWarnings, { waitUntil: "domcontentloaded" });

    const scrapedAt = new Date().toISOString();
    const listItems = await getGisListItems(page, skipIncompleteListItems);
    const records: AlertRecord[] = [];

    for (const item of listItems) {
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
  skipIncompleteListItems: boolean,
): Promise<GisListItem[]> {
  const warningItems = page.locator(
    ".article-area__article .art-prev > ul > li",
  );

  // Wait until at least one warning row is loaded
  await warningItems.first().waitFor();

  const rawItems: RawGisListItem[] = await warningItems.evaluateAll((rows) =>
    rows.map((row) => {
      const link = row.querySelector<HTMLAnchorElement>(".title a");

      return {
        date: row.querySelector(".event .date")?.textContent ?? "",
        title: link?.textContent ?? "",
        href: link?.getAttribute("href") ?? "",
      };
    }),
  );

  const incompleteItemPositions = rawItems.flatMap((item, index) =>
    item.date.trim() && item.title.trim() && item.href ? [] : [index + 1],
  );

  if (incompleteItemPositions.length > 0 && !skipIncompleteListItems) {
    throw new Error(
      `Incomplete GIS list item(s) at position(s): ${incompleteItemPositions.join(", ")}`,
    );
  }

  const warnings: GisListItem[] = [];

  for (const [index, item] of rawItems.entries()) {
    const date = normalizeWhiteSpaces(item.date);
    const title = normalizeWhiteSpaces(item.title);

    if (!date || !title || !item.href) {
      console.warn(`Skipped incomplete GIS list item at position ${index + 1}.`);
      continue;
    }

    warnings.push({
      date,
      title,
      href: new URL(item.href, Urls.gisWarnings).toString(),
    });
  }

  if (warnings.length === 0) {
    throw new Error("No complete GIS warning list items found.");
  }

  return warnings;
}
