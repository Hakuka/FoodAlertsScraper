export type AlertSource = "GIS" | "RASFF";

export interface AlertRecord {
  source: AlertSource;
  title: string;
  date?: string;
  url?: string;
}
