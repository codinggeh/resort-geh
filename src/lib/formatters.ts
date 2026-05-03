const localeMap: Record<string, string> = {
  en: 'en-US',
  id: 'id-ID',
};

function normalizeLocale(locale: string) {
  return localeMap[locale] ?? locale;
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function formatCurrency(
  amount: number,
  locale: string,
  currency = 'USD'
) {
  return new Intl.NumberFormat(normalizeLocale(locale), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(normalizeLocale(locale)).format(value);
}

export function formatShortDate(value: Date | string, locale: string) {
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    month: 'short',
    day: 'numeric',
  }).format(toDate(value));
}

export function formatLongDate(value: Date | string, locale: string) {
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(toDate(value));
}

export function formatNumericDate(value: Date | string, locale: string) {
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    month: 'numeric',
    day: 'numeric',
  }).format(toDate(value));
}

export function formatLocalDateRange(
  start: Date | string,
  end: Date | string,
  locale: string
) {
  return `${formatShortDate(start, locale)} – ${formatLongDate(end, locale)}`;
}
