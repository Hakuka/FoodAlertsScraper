import type { AlertRecord, AlertSource } from "./alertRecord.js";

export type ScrapeResult =
  | {
      source: AlertSource;
      status: "success";
      alerts: AlertRecord[];
    }
  | {
      source: AlertSource;
      status: "failed";
      error: unknown;
    };
