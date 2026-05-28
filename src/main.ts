import { readStoredAlerts, writeStoredAlerts } from "./alerts/alertsStorage.js";
import { markAlertsAsSent } from "./alerts/markAsSent.js";
import { mergeNewAlerts } from "./alerts/mergeNewAlerts.js";
import { scrapeGisWarnings } from "./scrapers/gisWarnings.js";
import { formatTelegramMessage } from "./telegram/formatTelegramMessage.js";
import { sendTelegramMessage } from "./telegram/telegramClient.js";
import { parseGisPublishDate } from "./utils/gisPublishDateParser.js";

const scrapedAlerts = await scrapeGisWarnings();
const storedAlerts = await readStoredAlerts();

const mergedAlerts = mergeNewAlerts(storedAlerts, scrapedAlerts);

await writeStoredAlerts(mergedAlerts);

const unsentAlerts = mergedAlerts.filter((alert) => !alert.sent);

const sortedUnsentAlerts = [...unsentAlerts].sort((a, b) => {
  return (
    parseGisPublishDate(a.publishedAt) - parseGisPublishDate(b.publishedAt)
  );
});

// console.table(
//   unsentAlerts.map((record) => ({
//     source: record.source,
//     publishedAt: record.publishedAt ?? "NOT FOUND",
//     product: record.product ?? "NOT FOUND",
//     url: record.url,
//     sent: record.sent,
//   })),
// );

const sentAlertIds: string[] = [];

for (const alert of sortedUnsentAlerts) {
  const message = formatTelegramMessage(alert);

  await sendTelegramMessage(message);

  sentAlertIds.push(alert.id);
}

const updatedAlerts = markAlertsAsSent(mergedAlerts, sentAlertIds);

await writeStoredAlerts(updatedAlerts);

console.log(`Sent ${sentAlertIds.length} alert(s) to Telegram.`);
