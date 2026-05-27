import { scrapeGisWarnings } from "./scrapers/gisWarnings.js";

const records = await scrapeGisWarnings();

console.table(
  records.map((record) => ({
    source: record.source,
    publishedAt: record.publishedAt,
    product: record.product ?? "NOT FOUND",
    url: record.url,
  })),
);
