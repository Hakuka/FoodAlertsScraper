import { sendTelegramMessage } from "./telegramClient.js";

await sendTelegramMessage("Test message from FoodAlertsScraper");

console.log("Telegram test message sent");
