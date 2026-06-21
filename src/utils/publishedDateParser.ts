export function normalizeGisPublishedDate(date: string): string {
  const [day, month, year] = date.split(".").map(Number);

  if (!day || !month || !year) {
    throw new Error(`Invalid GIS published date format: "${date}"`);
  }

  return formatIsoDate(year, month, day);
}

export function normalizeRasffPublishedDate(date: string): string {
  const parts = date.trim().split(/\s+/);

  if (parts.length !== 3) {
    throw new Error(`Invalid RASFF published date format: "${date}"`);
  }

  const day = Number(parts[0]);
  const month = parseEnglishMonth(parts[1]);
  const year = Number(parts[2]);

  if (!day || !month || !year) {
    throw new Error(`Invalid RASFF published date format: "${date}"`);
  }

  return formatIsoDate(year, month, day);
}

export function parsePublishedDateForSorting(date: string | undefined): number {
  if (!date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return Number.MAX_SAFE_INTEGER;
  }

  return new Date(year, month - 1, day).getTime();
}

function formatIsoDate(year: number, month: number, day: number): string {
  return [
    year.toString(),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("-");
}

function parseEnglishMonth(month: string | undefined): number | undefined {
  if (!month) {
    return undefined;
  }

  const normalizedMonth = month.trim().toUpperCase();

  const months: Record<string, number> = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    SEPT: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
  };

  return months[normalizedMonth];
}
