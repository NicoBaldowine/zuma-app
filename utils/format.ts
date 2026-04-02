export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
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
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
