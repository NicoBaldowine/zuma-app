const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const currencyCache = new Map<number, string>();

export function formatCurrency(cents: number): string {
  const cached = currencyCache.get(cents);
  if (cached) return cached;
  const result = currencyFormatter.format(cents / 100);
  if (currencyCache.size > 500) currencyCache.clear();
  currencyCache.set(cents, result);
  return result;
}

/** Format amount input with commas while typing (e.g. "10000" → "10,000") */
export function formatAmountInput(value: string): string {
  // Strip everything except digits and one decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  // Format integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
}

/** Parse formatted amount back to plain number string (e.g. "10,000" → "10000") */
export function parseAmountInput(formatted: string): string {
  return formatted.replace(/,/g, '');
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function calcProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  // Compare by local calendar day, not by ms difference
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
