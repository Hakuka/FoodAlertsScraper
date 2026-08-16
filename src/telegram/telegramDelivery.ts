import { wait } from "../utils/wait.js";
import {
  sendTelegramMessage,
  TelegramApiError,
} from "./telegramClient.js";

export const TELEGRAM_BATCH_SIZE = 10;
export const TELEGRAM_MESSAGE_INTERVAL_MS = 1_000;
export const TELEGRAM_BATCH_INTERVAL_MS = 60_000;

export function getTelegramMessageDelay(messageIndex: number): number {
  if (messageIndex === 0) {
    return 0;
  }

  return messageIndex % TELEGRAM_BATCH_SIZE === 0
    ? TELEGRAM_BATCH_INTERVAL_MS
    : TELEGRAM_MESSAGE_INTERVAL_MS;
}

export async function sendTelegramMessageWithRetry(
  message: string,
): Promise<void> {
  try {
    await sendTelegramMessage(message);
  } catch (error) {
    if (!(error instanceof TelegramApiError)) {
      throw error;
    }

    console.warn("Telegram send failed. Retrying once...", error);
    await wait(TELEGRAM_MESSAGE_INTERVAL_MS);
    await sendTelegramMessage(message);
  }
}
