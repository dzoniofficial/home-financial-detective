// types/database.ts
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export type SubscriptionCategory =
  | 'Utilities'
  | 'Entertainment'
  | 'Insurance'
  | 'Software'
  | 'Other';

export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

export interface Profile {
  id: string;
  email: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  start_date: string | null;
  renewal_date: string;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionInput = Omit<
  Subscription,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export interface UpcomingRenewal extends Subscription {
  days_until_renewal: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'email'>;
        Update: Partial<Profile>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> &
          Pick<Subscription, 'user_id' | 'name' | 'amount' | 'renewal_date'>;
        Update: Partial<Subscription>;
      };
    };
    Views: {
      upcoming_renewals: {
        Row: UpcomingRenewal;
      };
    };
  };
}
