import { Env } from "../config/env.js";

export class TelegramApiError extends Error {
  override name = "TelegramApiError";
}

export async function sendTelegramMessage(message: string): Promise<void> {
  if (!Env.telegramBotToken) {
    throw new Error("Telegram bot token Docker secret is empty");
  }

  if (!Env.telegramChatId) {
    throw new Error("Missing TELEGRAM_CHAT_ID in .env");
  }

  let response: Response;
  let responseBody: string;

  try {
    response = await fetch(
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
    responseBody = await response.text();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    throw new TelegramApiError(
      `Telegram API request failed: ${errorMessage}`,
    );
  }

  if (!response.ok) {
    throw new TelegramApiError(
      `Telegram API request failed with status ${response.status}: ${responseBody}`,
    );
  }

  let responseData: unknown;

  try {
    responseData = JSON.parse(responseBody) as unknown;
  } catch {
    throw new TelegramApiError(
      "Telegram API returned an invalid JSON response.",
    );
  }

  if (!isSuccessfulTelegramResponse(responseData)) {
    throw new TelegramApiError(
      `Telegram API did not confirm success: ${responseBody}`,
    );
  }
}

function isSuccessfulTelegramResponse(response: unknown): boolean {
  return (
    typeof response === "object" &&
    response !== null &&
    "ok" in response &&
    response.ok === true
  );
}
