// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSubscriptions } from '@/lib/subscriptions';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const subscriptions = await getSubscriptions(supabase);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Your subscriptions and recurring costs
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        An overview of all active contracts and subscriptions in your household.
      </p>

      <DashboardClient initialSubscriptions={subscriptions} userId={user.id} />
    </main>
  );
}
