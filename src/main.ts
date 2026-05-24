import { scrapeGisWarnings } from "./scrapers/gisWarnings.js";

const records = await scrapeGisWarnings();

console.log(records);
