# FoodAlertsScraper

Scraper for public food safety alerts from GIS.

## Purpose

The goal of this project is to collect public food safety alerts and prepare them for further processing, for example, by sending new alerts as telegram messages, since checking multiple sites daily can be time consuming.

Currently supported source:
- GIS warnings: https://www.gov.pl/web/gis/ostrzezenia

Planned source:
- RASFF Window: https://webgate.ec.europa.eu/rasff-window/screen/search

## Stack

- Node.js
- TypeScript
- Playwright

## Structure

```txt
src/
├─ config/
│  └─ urls.ts
├─ models/
│  └─ ...
├─ scrapers/
│  └─ ...
├─ utils/
│  └─ ...
└─ main.ts