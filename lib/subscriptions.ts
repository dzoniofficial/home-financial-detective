// lib/subscriptions.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Subscription, SubscriptionInput } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getSubscriptions(supabase: Client): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('renewal_date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSubscriptionById(
  supabase: Client,
  id: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createSubscription(
  supabase: Client,
  userId: string,
  input: SubscriptionInput
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(
  supabase: Client,
  id: string,
  input: Partial<SubscriptionInput>
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubscription(supabase: Client, id: string) {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
}
