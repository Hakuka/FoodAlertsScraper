import fs from "node:fs/promises";
import path from "node:path";
import type { AlertRecord } from "../models/alertRecord.js";

const ALERTS_FILE_PATH = path.resolve("data", "alerts.json");

export async function readStoredAlerts(): Promise<AlertRecord[]> {
  try {
    const fileContent = await fs.readFile(ALERTS_FILE_PATH, "utf-8");

    if (fileContent.trim().length === 0) {
      return [];
    }

    return JSON.parse(fileContent) as AlertRecord[];
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function writeStoredAlerts(alerts: AlertRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(ALERTS_FILE_PATH), { recursive: true });

  await fs.writeFile(
    ALERTS_FILE_PATH,
    JSON.stringify(alerts, null, 2),
    "utf-8",
  );
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
