export function parseGisPublishDate(date: string | undefined): number {
  if (!date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [day, month, year] = date.split(".").map(Number);

  if (!day || !month || !year) {
    return Number.MAX_SAFE_INTEGER;
  }

  return new Date(year, month - 1, day).getTime();
}
