// components/dashboard/BurnRateSummary.tsx
'use client';

interface Props {
  monthlyTotal: number;
  yearlyTotal: number;
  upcomingCount: number;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
}

export default function BurnRateSummary({ monthlyTotal, yearlyTotal, upcomingCount }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Monthly spend</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{formatMoney(monthlyTotal)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Yearly spend</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{formatMoney(yearlyTotal)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Renewing in the next 30 days</p>
        <p className="mt-1 text-2xl font-semibold text-amber-600">{upcomingCount}</p>
      </div>
    </div>
  );
}
