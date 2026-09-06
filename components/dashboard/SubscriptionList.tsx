// components/dashboard/SubscriptionList.tsx
'use client';

import { useState } from 'react';
import type { Subscription } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { deleteSubscription } from '@/lib/subscriptions';
import { formatDate, isRenewingSoon, isUrgent } from '@/lib/date-utils';

interface Props {
  subscriptions: Subscription[];
  userId: string;
  onChange: (subs: Subscription[]) => void;
  onEdit: (subscription: Subscription) => void;
}

export default function SubscriptionList({ subscriptions, userId, onChange, onEdit }: Props) {
  const [loadingLetterFor, setLoadingLetterFor] = useState<string | null>(null);
  const [letterText, setLetterText] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<'renewal_date' | 'amount'>('renewal_date');

  const supabase = createClient();

  const sorted = [...subscriptions].sort((a, b) =>
    sortBy === 'amount'
      ? b.amount - a.amount
      : new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
  );

  async function handleDelete(id: string) {
    await deleteSubscription(supabase, id);
    onChange(subscriptions.filter((s) => s.id !== id));
  }

  async function handleGenerateLetter(sub: Subscription) {
    setLoadingLetterFor(sub.id);
    try {
      const res = await fetch('/api/generate-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName: sub.name,
          category: sub.category,
          renewalDate: sub.renewal_date,
        }),
      });

      if (!res.ok) throw new Error('Letter generation failed');

      const data = await res.json();
      setLetterText((prev) => ({ ...prev, [sub.id]: data.letter }));
    } catch (err) {
      console.error(err);
      setLetterText((prev) => ({
        ...prev,
        [sub.id]: 'Something went wrong generating the letter. Please try again.',
      }));
    } finally {
      setLoadingLetterFor(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h2 className="font-medium text-slate-900">All subscriptions</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'renewal_date' | 'amount')}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="renewal_date">Sort by renewal date</option>
          <option value="amount">Sort by amount</option>
        </select>
      </div>

      <ul className="divide-y divide-slate-100">
        {sorted.map((sub) => {
          const urgent = sub.status === 'active' && isUrgent(sub.renewal_date);
          const soon = sub.status === 'active' && isRenewingSoon(sub.renewal_date);

          return (
            <li key={sub.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{sub.name}</p>
                  <p className="text-sm text-slate-500">
                    {sub.amount.toFixed(2)} {sub.currency} · {sub.billing_cycle} ·{' '}
                    {sub.category}
                  </p>
                  <p className="text-sm text-slate-500">
                    Renews on: {formatDate(sub.renewal_date)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {urgent && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Urgent
                    </span>
                  )}
                  {!urgent && soon && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Soon
                    </span>
                  )}

                  <button
                    onClick={() => onEdit(sub)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleGenerateLetter(sub)}
                    disabled={loadingLetterFor === sub.id}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    {loadingLetterFor === sub.id ? 'Generating…' : 'Cancellation letter (AI)'}
                  </button>

                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {letterText[sub.id] && (
                <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  {letterText[sub.id]}
                </pre>
              )}
            </li>
          );
        })}

        {sorted.length === 0 && (
          <li className="p-6 text-center text-sm text-slate-500">
            You haven't added any subscriptions yet.
          </li>
        )}
      </ul>
    </div>
  );
}
