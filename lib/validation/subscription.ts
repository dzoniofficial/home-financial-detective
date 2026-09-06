// lib/validation/subscription.ts
import { z } from 'zod';

export const subscriptionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(120, 'Name is too long (max 120 characters).'),

    amount: z
      .number({ invalid_type_error: 'Amount must be a number.' })
      .positive('Amount must be greater than zero.')
      .max(1_000_000, 'Amount looks unrealistically high.'),

    currency: z.enum(['EUR', 'USD', 'GBP', 'CHF'], {
      errorMap: () => ({ message: 'Select a valid currency.' }),
    }),

    billing_cycle: z.enum(['monthly', 'quarterly', 'yearly'], {
      errorMap: () => ({ message: 'Select a billing cycle.' }),
    }),

    start_date: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val ?? null)
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Start date is not valid.',
      }),

    renewal_date: z
      .string()
      .min(1, 'Renewal date is required.')
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Renewal date is not valid.',
      }),

    category: z.enum(['Utilities', 'Entertainment', 'Insurance', 'Software', 'Other'], {
      errorMap: () => ({ message: 'Select a category.' }),
    }),

    status: z.enum(['active', 'cancelled', 'paused']).default('active'),

    notes: z
      .string()
      .trim()
      .max(1000, 'Note is too long.')
      .optional()
      .nullable()
      .transform((val) => val ?? null),
  })
  .refine(
    (data) =>
      !data.start_date || Date.parse(data.start_date) <= Date.parse(data.renewal_date),
    {
      message: 'Start date cannot be after the renewal date.',
      path: ['start_date'],
    }
  );

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
