import type { AlertRecord } from "../models/alertRecord.js";

export function shouldSendTelegramAlert(alert: AlertRecord): boolean {
  return (
    alert.source !== "RASFF" ||
    alert.product !== undefined ||
    alert.producer !== undefined
  );
}
