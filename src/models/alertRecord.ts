export type AlertSource = "GIS" | "RASFF";

export interface AlertRecord {
  //warning
  id: string;
  source: AlertSource;
  title: string;
  publishedAt?: string;
  url: string;
  //product
  product?: string;
  batchNumber?: string;
  producer?: string;
  //info
  scrapedAt: string;
  sent: boolean;
  sentAt?: string;
}
