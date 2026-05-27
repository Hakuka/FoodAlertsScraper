// For GIS
// .editor-content return something like:
// Szczegóły dotyczące produktu:
// Produkt/Nazwa produktu: xxx
// Numer partii: xxx
// Producent: xxx

export function extractValueByLabels(
  text: string,
  labels: string[],
): string | undefined {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    for (const label of labels) {
      const prefix = `${label}:`;

      if (line.startsWith(prefix)) {
        return line.replace(prefix, "").trim();
      }
    }
  }

  return undefined;
}
