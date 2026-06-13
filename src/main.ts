import { readStoredAlerts, writeStoredAlerts } from "./alerts/alertsStorage.js";
import { markAlertsAsSent } from "./alerts/markAsSent.js";
import { mergeNewAlerts } from "./alerts/mergeNewAlerts.js";
import { scrapeGisWarnings } from "./scrapers/gisWarnings.js";
import { formatTelegramMessage } from "./telegram/formatTelegramMessage.js";
import { sendTelegramMessage } from "./telegram/telegramClient.js";
import { parseGisPublishDate } from "./utils/gisPublishDateParser.js";

const scrapedAlerts = await scrapeGisWarnings();
const storedAlerts = await readStoredAlerts();

//save new alerts
const mergedAlerts = mergeNewAlerts(storedAlerts, scrapedAlerts);
await writeStoredAlerts(mergedAlerts);

//sort unserted
const unsentAlerts = mergedAlerts.filter((alert) => !alert.sent);
const sortedUnsentAlerts = [...unsentAlerts].sort((a, b) => {
  return (
    parseGisPublishDate(a.publishedAt) - parseGisPublishDate(b.publishedAt)
  );
});


//sent and store 
const sentAlertIds: string[] = [];
for (const alert of sortedUnsentAlerts) {
  const message = formatTelegramMessage(alert);
  await sendTelegramMessage(message);

  sentAlertIds.push(alert.id);
}

//update sent and save
const updatedAlerts = markAlertsAsSent(mergedAlerts, sentAlertIds);
await writeStoredAlerts(updatedAlerts);