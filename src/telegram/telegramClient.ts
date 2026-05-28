import { Env } from "../config/env.js";

export async function sendTelegramMessage(message: string): Promise<void> {
  if (!Env.telegramBotToken) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN in .env");
  }

  if (!Env.telegramChatId) {
    throw new Error("Missing TELEGRAM_CHAT_ID in .env");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${Env.telegramBotToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: Env.telegramChatId,
        text: message,
      }),
    },
  );

  if (!response.ok) {
    const responseBody = await response.text();

    throw new Error(
      `Telegram API request failed with status ${response.status}: ${responseBody}`,
    );
  }
}
