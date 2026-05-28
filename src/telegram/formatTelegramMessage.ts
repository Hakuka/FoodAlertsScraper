import type { AlertRecord } from "../models/alertRecord.js";

export function formatTelegramMessage(alert: AlertRecord): string {
  return [
    "Nowe ostrzeżenie",
    "",
    `Produkt: ${alert.product ?? "Nie znaleziono/Nietypowy zapis"}`,
    `Producent: ${alert.producer ?? "Nie znaleziono/Nietypowy zapis"}`,
    `Źródło: ${alert.source}`,
    `Opublikowano: ${alert.publishedAt ?? "Nie znaleziono/Nietypowy zapis"}`,
    "",
    `Link: ${alert.url}`,
  ].join("\n");

  // EN
  // return [
  //   "New alert",
  //   "",
  //   `Product: ${alert.product ?? "NOT FOUND"}`,
  //   `Producer: ${alert.producer ?? "NOT FOUND"}`,
  //   `Source: ${alert.source}`,
  //   `Published: ${alert.publishedAt ?? "NOT FOUND"}`,
  //   "",
  //   `Link: ${alert.url}`,
  // ].join("\n");
}
