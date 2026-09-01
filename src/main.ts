import { readStoredAlerts, writeStoredAlerts } from "./alerts/alertsStorage.js";
import { markAlertsAsSent } from "./alerts/markAsSent.js";
import { mergeNewAlerts } from "./alerts/mergeNewAlerts.js";
import { scrapeGisWarnings } from "./scrapers/gisWarnings.js";
import { scrapeRasffWarnings } from "./scrapers/rasffWarnings.js";
import { formatTelegramMessage } from "./telegram/formatTelegramMessage.js";
import { shouldSendTelegramAlert } from "./telegram/shouldSendTelegramAlert.js";
import { TelegramApiError } from "./telegram/telegramClient.js";
import {
  getTelegramMessageDelay,
  sendTelegramMessageWithRetry,
  TELEGRAM_BATCH_INTERVAL_MS,
} from "./telegram/telegramDelivery.js";
import {
  getTwoMonthsAgoIsoDate,
  parsePublishedDateForSorting,
} from "./utils/publishedDateParser.js";
import { wait } from "./utils/wait.js";

console.log(">>> START OF NEW RUN <<<");
const storedAlerts = await readStoredAlerts();
const firstRunPublishedSince = getTwoMonthsAgoIsoDate();
const gisPublishedSince = storedAlerts.some((alert) => alert.source === "GIS")
  ? undefined
  : firstRunPublishedSince;
const rasffPublishedSince = storedAlerts.some(
  (alert) => alert.source === "RASFF",
)
  ? undefined
  : firstRunPublishedSince;

console.log("Scraper start");
const scraperResults = await Promise.all([
  scrapeGisWarnings(gisPublishedSince),
  scrapeRasffWarnings(rasffPublishedSince),
]);
console.log("Scraper end");

const scrapedAlerts = scraperResults.flatMap((result) =>
  result.status === "success" ? result.alerts : [],
);

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

// Send alerts and save sent status after each successful message
let alertsToSave = mergedAlerts;
let sentAlertsCount = 0;

const alertsToSend = sortedUnsentAlerts.filter((alert) => {
  if (!shouldSendTelegramAlert(alert)) {
    console.warn(`Skipped incomplete RASFF alert: ${alert.id}`);
    return false;
  }

  return true;
});

for (const [messageIndex, alert] of alertsToSend.entries()) {
  const delay = getTelegramMessageDelay(messageIndex);

  if (delay > 0) {
    if (delay === TELEGRAM_BATCH_INTERVAL_MS) {
      console.log("Telegram batch limit reached. Waiting 1 minute...");
    }

    await wait(delay);
  }

  const message = formatTelegramMessage(alert);

  try {
    await sendTelegramMessageWithRetry(message);
  } catch (error) {
    if (!(error instanceof TelegramApiError)) {
      throw error;
    }

    console.error(
      `Telegram send failed; alert remains unsent: ${alert.id}`,
      error,
    );
    continue;
  }

  alertsToSave = markAlertsAsSent(alertsToSave, [alert.id]);
  await writeStoredAlerts(alertsToSave);
  sentAlertsCount++;
  console.log(`Sent and marked as sent: ${alert.id}`);
}

console.log(`Sent ${sentAlertsCount} alert(s) to Telegram.`);
console.log(">>> END OF THE RUN <<<");
