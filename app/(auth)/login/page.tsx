// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const emailSchema = z.string().trim().email('Enter a valid email address.');
const passwordSchema = z.string().min(1, 'Password is required.');

type Mode = 'password' | 'magic-link';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setInfo(null);

    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);

    if (!emailResult.success || !passwordResult.success) {
      const nextErrors: Record<string, string> = {};
      if (!emailResult.success) nextErrors.email = emailResult.error.issues[0].message;
      if (!passwordResult.success) nextErrors.password = passwordResult.error.issues[0].message;
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: emailResult.data,
      password: passwordResult.data,
    });

    setLoading(false);

    if (error) {
      setErrors({ form: 'Incorrect email or password.' });
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setInfo(null);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.issues[0].message });
      return;
    }
    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: emailResult.data,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setErrors({ form: 'Sending the link failed. Please try again.' });
      return;
    }

    setInfo('We sent a login link to your email. Check your inbox.');
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex rounded-md bg-slate-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 rounded-md py-1.5 ${
            mode === 'password' ? 'bg-white shadow-sm font-medium' : 'text-slate-500'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic-link')}
          className={`flex-1 rounded-md py-1.5 ${
            mode === 'magic-link' ? 'bg-white shadow-sm font-medium' : 'text-slate-500'
          }`}
        >
          Magic link
        </button>
      </div>

      {errors.form && (
        <p role="alert" className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}
      {info && (
        <p className="mb-3 rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{info}</p>
      )}

      <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-3">
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

        {mode === 'password' && (
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
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading
            ? 'Signing in…'
            : mode === 'password'
              ? 'Sign in'
              : 'Send login link'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-slate-900 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
