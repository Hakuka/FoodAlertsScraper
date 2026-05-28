# FoodAlertsScraper

Scraper for public food safety alerts from GIS.

## Purpose

The goal of this project is to save time by collecting public food safety alerts from multiple websites and sending them as telegram messages.

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