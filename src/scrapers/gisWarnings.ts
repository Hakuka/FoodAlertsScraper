import { chromium } from "playwright";
import type { AlertRecord } from "../models/alertRecord.ts";

const GIS_WARNINGS_URL = "https://www.gov.pl/web/gis/ostrzezenia";

export async function scrapeGisWarnings(): Promise<AlertRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(GIS_WARNINGS_URL, { waitUntil: "domcontentloaded" });

    //test
    console.log(await page.title());

    //todo
    return [];
  } finally {
    await browser.close();
  }
}
