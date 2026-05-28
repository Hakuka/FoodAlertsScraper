import type { AlertRecord } from "../models/alertRecord.ts";

export function markAlertsAsSent(
  alerts: AlertRecord[],
  alertIdsToMarkAsSent: string[],
): AlertRecord[] {
  const sentAlertIds = new Set(alertIdsToMarkAsSent);
  const sentAt = new Date().toISOString();

  return alerts.map((alert) => {
    if (!sentAlertIds.has(alert.id)) {
      return alert;
    }

    return {
      ...alert,
      sent: true,
      sentAt,
    };
  });
}
