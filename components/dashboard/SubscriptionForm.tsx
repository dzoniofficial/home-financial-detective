// components/dashboard/SubscriptionForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createSubscription, updateSubscription } from '@/lib/subscriptions';
import {
  subscriptionSchema,
  flattenZodErrors,
  type SubscriptionFormValues,
} from '@/lib/validation/subscription';
import type { Subscription } from '@/types/database';

interface Props {
  userId: string;
  existing?: Subscription;
  onSaved: (subscription: Subscription) => void;
  onCancel: () => void;
}

type FormState = {
  name: string;
  amount: string;
  currency: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  category: string;
  status: string;
  notes: string;
};

function toFormState(sub?: Subscription): FormState {
  return {
    name: sub?.name ?? '',
    amount: sub ? String(sub.amount) : '',
    currency: sub?.currency ?? 'EUR',
    billing_cycle: sub?.billing_cycle ?? 'monthly',
    start_date: sub?.start_date ?? '',
    renewal_date: sub?.renewal_date ?? '',
    category: sub?.category ?? 'Other',
    status: sub?.status ?? 'active',
    notes: sub?.notes ?? '',
  };
}

export default function SubscriptionForm({ userId, existing, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(toFormState(existing));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createClient();

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const candidate = {
      name: form.name,
      amount: Number(form.amount),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      start_date: form.start_date || undefined,
      renewal_date: form.renewal_date,
      category: form.category,
      status: form.status,
      notes: form.notes || undefined,
    };

    const result = subscriptionSchema.safeParse(candidate);

    if (!result.success) {
      setErrors(flattenZodErrors(result.error));
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const validated: SubscriptionFormValues = result.data;

      const saved = existing
        ? await updateSubscription(supabase, existing.id, validated)
        : await createSubscription(supabase, userId, validated);

      onSaved(saved);
    } catch (err) {
      console.error(err);
      setFormError('Saving failed. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="font-medium text-slate-900">
        {existing ? 'Edit subscription' : 'Add a new subscription'}
      </h3>

      {formError && (
        <p role="alert" className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. Netflix, Internet, Gym…"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Amount</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setField('amount', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Currency</label>
          <select
            value={form.currency}
            onChange={(e) => setField('currency', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="CHF">CHF</option>
          </select>
          {errors.currency && <p className="mt-1 text-xs text-red-600">{errors.currency}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Billing cycle</label>
          <select
            value={form.billing_cycle}
            onChange={(e) => setField('billing_cycle', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.billing_cycle && (
            <p className="mt-1 text-xs text-red-600">{errors.billing_cycle}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <select
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Insurance">Insurance</option>
            <option value="Software">Software</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Start date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setField('start_date', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.start_date && (
            <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Renewal date</label>
          <input
            type="date"
            value={form.renewal_date}
            onChange={(e) => setField('renewal_date', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.renewal_date && (
            <p className="mt-1 text-xs text-red-600">{errors.renewal_date}</p>
          )}
        </div>
      </div>

      {existing && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : existing ? 'Save changes' : 'Add subscription'}
        </button>
      </div>
    </form>
  );
}
