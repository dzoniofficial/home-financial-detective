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
      star
