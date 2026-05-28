# FoodAlertsScraper

Scraper for public food safety alerts from GIS.

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

## Configuration

Create a local `.env` file based on `.env.example`.  

`TELEGRAM_BOT_TOKEN` is created with BotFather.  
`TELEGRAM_CHAT_ID` is the target chat or group ID where alert messages should be sent.

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