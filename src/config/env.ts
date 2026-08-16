import { readFileSync } from "node:fs";
import "dotenv/config";

export const Env = {
  telegramBotToken: readFileSync(
    "/run/secrets/telegram_bot_token",
    "utf-8",
  ).trim(),
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
} as const;
