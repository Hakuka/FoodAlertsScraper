# FoodAlertsScraper

Scraper for public food safety alerts.

## Purpose

The goal of this project is to save time by collecting public food safety alerts from multiple websites and sending them as telegram messages.
The application keeps local alert state, so already sent alerts are not sent again.

## Supported sources

Currently supported:
- GIS warnings: https://www.gov.pl/web/gis/ostrzezenia

Planned:
- RASFF Window: https://webgate.ec.europa.eu/rasff-window/screen/search


## Stack

- Node.js
- TypeScript
- Playwright
- Telegram Bot API
- dotenv

## Features

- Scrapes GIS public food safety warnings.
- Opens each GIS alert details page.
- Extracts alert data.  
NOTE: Parsing is done by matching keywords so sometimes its unstable.
- Stores alert state locally in `data/alerts.json`.
- Sends only unsent alerts to Telegram.
- Marks successfully sent alerts as `sent: true`.

## Installation and configuration

1. `git clone https://github.com/TWOJ_LOGIN/FoodAlertsScraper.git`  
2. `copy .env.example .env`  
with:  
`TELEGRAM_BOT_TOKEN` is created with BotFather.  
`TELEGRAM_CHAT_ID` is the target chat or group ID where alert messages should be sent.  
3. `docker compose build`  
4. `docker compose up -d`  
5. Force start without waiting for crone: `docker compose exec food-alerts-scraper npm run start`

## Structure

```txt
FOODALERTSSCRAPER/
├─ data/                  # Local state
├─ dist/                  # Build
├─ src/
│  ├─ alerts/             # Alert storage, merging and sent-status logic
│  ├─ config/             # Environment variables and source URLs
│  ├─ models/             # Models
│  ├─ scrapers/           # Scrappers per source
│  ├─ telegram/           # Telegram message formatting and sending
│  ├─ utils/              # Utils
│  └─ main.ts             
├─ .env.example           
```