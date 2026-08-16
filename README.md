# FoodAlertsScraper

Scraper for public food safety alerts.

## Purpose

The goal of this project is to save time by collecting public food safety alerts from multiple websites and sending them as telegram messages.
The application keeps local alert state, so already sent alerts are not sent again.

## Supported sources

Currently supported:
- GIS warnings: https://www.gov.pl/web/gis/ostrzezenia
- RASFF Window for PL: https://webgate.ec.europa.eu/rasff-window/screen/search

## Stack

- Node.js
- TypeScript
- Playwright
- Telegram Bot API
- dotenv

## Features

- Scrapes GIS, RASFF (for Poland) public food safety warnings.
- Opens each alert details page.
- Extracts alert data.  
NOTE: Parsing is done by matching keywords so sometimes its unstable.
- Stores alert state locally in `data/alerts.json` as we only need info which one was sent and they are not that often.
- Sends only unsent alerts to Telegram.
- Marks successfully sent alerts as `sent: true`.

## Installation and configuration

1. `git clone`
2. `copy .env.example .env`
   Set `TELEGRAM_CHAT_ID` to the target chat or group ID where alert messages should be sent.
   For an existing installation, remove the legacy `TELEGRAM_BOT_TOKEN` entry from `.env`.
3. Create `secrets/telegram_bot_token.txt` and paste the bot token from BotFather as its only content.
4. `docker compose build`
5. `docker compose up -d`
6. Force start without waiting for cron: `docker compose exec food-alerts-scraper npm run start`

## Structure

```txt
FOODALERTSSCRAPER/
├─ data/                  # Local state
├─ dist/                  # Build
├─ src/
│  ├─ alerts/             # Alert storage, merging and sent-status logic
│  ├─ config/             # Environment variables and source URLs
│  ├─ models/             # Models
│  ├─ scrapers/           # Scrapers per source
│  ├─ telegram/           # Telegram message formatting and sending
│  ├─ utils/              # Utils
│  └─ main.ts             
├─ .env.example           
```
