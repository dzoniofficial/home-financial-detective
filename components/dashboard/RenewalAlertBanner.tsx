// components/dashboard/RenewalAlertBanner.tsx
'use client';

import { formatDate } from '@/lib/date-utils';

interface Props {
  providerName: string;
  renewalDate: string;
}

export default function RenewalAlertBanner({ providerName, renewalDate }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4"
    >
      <span aria-hidden className="mt-0.5 text-xl">⚠️</span>
      <p className="text-sm text-amber-900">
        Your contract for <strong>{providerName}</strong> renews automatically on{' '}
        <strong>{formatDate(renewalDate)}</strong>. Prices often increase upon renewal
        — consider reviewing the terms or cancelling.
      </p>
    </div>
  );
}
