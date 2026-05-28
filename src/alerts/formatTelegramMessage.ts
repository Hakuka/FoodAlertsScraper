import type { AlertRecord } from "../models/alertRecord.ts";

export function formatTelegramMessage(alert: AlertRecord): string {
  return [
    "New alert",
    "",
    `Product: ${alert.product ?? "NOT FOUND"}`,
    `Producer: ${alert.producer ?? "NOT FOUND"}`,
    `Source: ${alert.source}`,
    `Published: ${alert.publishedAt ?? "NOT FOUND"}`,
    "",
    `Link: ${alert.url}`,
  ].join("\n");
}
