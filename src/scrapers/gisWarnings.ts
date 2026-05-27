import { chromium } from "playwright";
import { Urls } from "../config/urls.js";
import type { AlertRecord } from "../models/alertRecord.ts";
import { extractValueByLabels } from "../utils/gisTextExtractors.js";

export async function scrapeGisWarnings(): Promise<AlertRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(Urls.gisWarnings, { waitUntil: "domcontentloaded" });

    // TODO: pagination
    const warningItems = page.locator(".article-area__article").locator("li");

    // Runs in browser context
    const warnings = await warningItems.evaluateAll((items) =>
      items.map((item) => {
        const date =
          item.querySelector(".event .date")?.textContent?.trim() ?? "";

        const link = item.querySelector(".title a") as HTMLAnchorElement | null;

        return {
          date,
          // Trim + change white chars to single space
          title: link?.textContent?.trim().replace(/\s+/g, " ") ?? "",
          href: link?.href ?? "",
        };
      }),
    );

    const scrapedAt = new Date().toISOString();
    const records: AlertRecord[] = [];

    for (const warning of warnings) {
      await page.goto(warning.href, { waitUntil: "domcontentloaded" });
      const editorContentText = await page
        .locator(".editor-content")
        .innerText();
      const product = extractValueByLabels(editorContentText, [
        "Nazwa produktu",
        "Produkt",
      ]);
      const batchNumber = extractValueByLabels(editorContentText, [
        "Numer partii",
      ]);
      const producer = extractValueByLabels(editorContentText, ["Producent"]);
      const record: AlertRecord = {
        id: `GIS:${warning.href}`,
        source: "GIS",
        title: warning.title,
        publishedAt: warning.date,
        url: warning.href,
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
