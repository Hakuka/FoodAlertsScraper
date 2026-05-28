import type { AlertRecord } from "../models/alertRecord.js";

export function mergeNewAlerts(
  storedAlerts: AlertRecord[],
  scrapedAlerts: AlertRecord[],
): AlertRecord[] {
  const storedAlertIds = new Set(storedAlerts.map((alert) => alert.id));

  const newAlerts = scrapedAlerts.filter(
    (alert) => !storedAlertIds.has(alert.id),
  );

  return [...storedAlerts, ...newAlerts];
}
