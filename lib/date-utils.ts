// lib/date-utils.ts

export function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function isRenewingSoon(isoDate: string, withinDays = 30): boolean {
  const diff = daysUntil(isoDate);
  return diff >= 0 && diff <= withinDays;
}

export function isUrgent(isoDate: string, withinDays = 14): boolean {
  return isRenewingSoon(isoDate, withinDays);
}

export function toMonthlyAmount(amount: number, cycle: 'monthly' | 'quarterly' | 'yearly'): number {
  switch (cycle) {
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}

export function toYearlyAmount(amount: number, cycle: 'monthly' | 'quarterly' | 'yearly'): number {
  switch (cycle) {
    case 'monthly':
      return amount * 12;
    case 'quarterly':
      return amount * 4;
    case 'yearly':
      return amount;
    default:
      return amount;
  }
}

export function formatDate(isoDate: string, locale = 'en-US'): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
