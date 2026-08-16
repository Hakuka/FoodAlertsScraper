import { readStoredAlerts, writeStoredAlerts } from "./alerts/alertsStorage.js";
import { markAlertsAsSent } from "./alerts/markAsSent.js";
import { mergeNewAlerts } from "./alerts/mergeNewAlerts.js";
import { scrapeGisWarnings } from "./scrapers/gisWarnings.js";
import { scrapeRasffWarnings } from "./scrapers/rasffWarnings.js";
import { formatTelegramMessage } from "./telegram/formatTelegramMessage.js";
import { sendTelegramMessage } from "./telegram/telegramClient.js";
import { parsePublishedDateForSorting } from "./utils/publishedDateParser.js";

const scraperResults = await Promise.all([
  scrapeGisWarnings(),
  scrapeRasffWarnings(),
]);

const scrapedAlerts = scraperResults.flatMap((result) =>
  result.status === "success" ? result.alerts : [],
);

const storedAlerts = await readStoredAlerts();

// Save new alerts
const mergedAlerts = mergeNewAlerts(storedAlerts, scrapedAlerts);
await writeStoredAlerts(mergedAlerts);

// Sort unsent alerts
const unsentAlerts = mergedAlerts.filter((alert) => !alert.sent);

const sortedUnsentAlerts = [...unsentAlerts].sort((a, b) => {
  return (
    parsePublishedDateForSorting(a.publishedAt) -
    parsePublishedDateForSorting(b.publishedAt)
  );
});

for (const result of scraperResults) {
  if (result.status === "success") {
    console.log(
      `${result.source} scraper succeeded: ${result.alerts.length} alert(s).`,
    );
  } else {
    console.error(`${result.source} scraper failed:`, result.error);
  }
}

console.log(`Scraped total alerts: ${scrapedAlerts.length}`);
console.log(`Unsent alerts: ${sortedUnsentAlerts.length}`);

// console.table(
//   sortedUnsentAlerts.map((record) => ({
//     source: record.source,
//     publishedAt: record.publishedAt ?? "NOT FOUND",
//     product: record.product ?? "NOT FOUND",
//     title: record.title,
//     url: record.url,
//     sent: record.sent,
//   })),
// );

// Send alerts and save sent status after each successful message
let alertsToSave = mergedAlerts;
let sentAlertsCount = 0;

for (const alert of sortedUnsentAlerts) {
  const message = formatTelegramMessage(alert);

  await sendTelegramMessage(message);
  alertsToSave = markAlertsAsSent(alertsToSave, [alert.id]);
  await writeStoredAlerts(alertsToSave);
  sentAlertsCount++;
  console.log(`Sent and marked as sent: ${alert.id}`);
}

console.log(`Sent ${sentAlertsCount} alert(s) to Telegram.`);
