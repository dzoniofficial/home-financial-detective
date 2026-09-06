// components/dashboard/DashboardClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Subscription } from '@/types/database';
import { isRenewingSoon, isUrgent, toMonthlyAmount, toYearlyAmount } from '@/lib/date-utils';
import BurnRateSummary from './BurnRateSummary';
import RenewalAlertBanner from './RenewalAlertBanner';
import SubscriptionList from './SubscriptionList';
import SubscriptionForm from './SubscriptionForm';

interface Props {
  initialSubscriptions: Subscription[];
  userId: string;
}

type FormMode = { open: false } | { open: true; editing?: Subscription };

export default function DashboardClient({ initialSubscriptions, userId }: Props) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [formMode, setFormMode] = useState<FormMode>({ open: false });
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === 'active'),
    [subscriptions]
  );

  const { monthlyTotal, yearlyTotal } = useMemo(() => {
    let monthly = 0;
    let yearly = 0;
    for (const sub of activeSubs) {
      monthly += toMonthlyAmount(sub.amount, sub.billing_cycle);
      yearly += toYearlyAmount(sub.amount, sub.billing_cycle);
    }
    return { monthlyTotal: monthly, yearlyTotal: yearly };
  }, [activeSubs]);

  const upcomingRenewals = useMemo(
    () => activeSubs.filter((s) => isRenewingSoon(s.renewal_date, 30)),
    [activeSubs]
  );

  const urgentRenewal = useMemo(
    () => upcomingRenewals.find((s) => isUrgent(s.renewal_date, 14)),
    [upcomingRenewals]
  );

  function handleSaved(saved: Subscription) {
    setSubscriptions((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev];
    });
    setFormMode({ open: false });
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      {urgentRenewal && (
        <RenewalAlertBanner
          providerName={urgentRenewal.name}
          renewalDate={urgentRenewal.renewal_date}
        />
      )}

      <BurnRateSummary
        monthlyTotal={monthlyTotal}
        yearlyTotal={yearlyTotal}
        upcomingCount={upcomingRenewals.length}
      />

      <div className="flex justify-end">
        <button
          onClick={() => setFormMode({ open: true })}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Add subscription
        </button>
      </div>

      {formMode.open && (
        <SubscriptionForm
          userId={userId}
          existing={formMode.editing}
          onSaved={handleSaved}
          onCancel={() => setFormMode({ open: false })}
        />
      )}

      <SubscriptionList
        subscriptions={subscriptions}
        userId={userId}
        onChange={setSubscriptions}
        onEdit={(sub) => setFormMode({ open: true, editing: sub })}
      />
    </div>
  );
}
