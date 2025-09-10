/**
 * Format price with currency (default: MAD).
 */
export function formatPrice(value: number, currency: string = "MAD") {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date in long style (ex: 5 septembre 2025).
 */
export function formatDate(date: Date | string, locale: string = "fr-FR") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Truncate a string with ellipsis if too long.
 */
export function truncate(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}