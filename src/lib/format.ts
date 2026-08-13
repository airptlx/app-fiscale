const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEuros(value: number): string {
  return euroFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${String(value).replace(".", ",")} %`;
}
