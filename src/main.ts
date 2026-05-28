import { readStoredAlerts, writeStoredAlerts } from "./alerts/alertsStorage.js";
import { formatTelegramMessage } from "./alerts/formatTelegramMessage.js";
import { mergeNewAlerts } from "./alerts/mergeNewAlerts.js";
import { scrapeGisWarnings } from "./scrapers/gisWarnings.js";

const scrapedAlerts = await scrapeGisWarnings();
const storedAlerts = await readStoredAlerts();

const mergedAlerts = mergeNewAlerts(storedAlerts, scrapedAlerts);

await writeStoredAlerts(mergedAlerts);

const unsentAlerts = mergedAlerts.filter((alert) => !alert.sent);

console.table(
  unsentAlerts.map((record) => ({
    source: record.source,
    publishedAt: record.publishedAt ?? "NOT FOUND",
    product: record.product ?? "NOT FOUND",
    url: record.url,
    sent: record.sent,
  })),
);

for (const alert of unsentAlerts) {
  console.log("\n--- Telegram message preview ---\n");
  console.log(formatTelegramMessage(alert));
}
