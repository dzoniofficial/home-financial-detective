// app/api/generate-cancellation/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCancellationLetter } from '@/lib/claude';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(userId, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { providerName, category, renewalDate } = body ?? {};

    if (
      typeof providerName !== 'string' ||
      providerName.trim().length === 0 ||
      providerName.length > 200 ||
      typeof category !== 'string' ||
      typeof renewalDate !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const letter = await generateCancellationLetter({
      providerName: providerName.trim(),
      category,
      renewalDate,
    });

    return NextResponse.json({ letter });
  } catch (err) {
    console.error('generate-cancellation error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
