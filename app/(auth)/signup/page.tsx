// app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const signupSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password is too long.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = signupSchema.safeParse({ email, password, confirmPassword });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? 'form';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setErrors({ form: error.message === 'User already registered'
        ? 'An account with this email already exists.'
        : 'Sign up failed. Please try again.' });
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-700">
          We sent you a confirmation email. Click the link in the message to
          activate your account and continue to the dashboard.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-slate-900 underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {errors.form && (
        <p role="alert" className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="name@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-slate-900 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
