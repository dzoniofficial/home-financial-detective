// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface CancellationLetterParams {
  providerName: string;
  category: string;
  renewalDate: string;
  userFullName?: string;
  locale?: string;
}

export async function generateCancellationLetter({
  providerName,
  category,
  renewalDate,
  userFullName = '[Customer Full Name]',
  locale = 'en',
}: CancellationLetterParams): Promise<string> {
  const systemPrompt = `You are a legal-writing assistant helping consumers cancel
recurring subscriptions and contracts. Write a formal, polite, and legally
appropriate cancellation letter/email. Keep it concise, reference the contract
by provider name, and include a clear statement of intent to cancel effective
at the end of the current billing period. Write the letter in the language
appropriate for locale "${locale}". Do not invent specific contract numbers or
legal statutes you are not certain apply — instead use general, safe phrasing
such as "in accordance with the applicable consumer protection regulations".`;

  const userPrompt = `Generate a subscription/contract cancellation letter with:
- Provider / company name: ${providerName}
- Service category: ${category}
- Contract renewal date: ${renewalDate}
- Sender name: ${userFullName}

Structure: sender info placeholder, date, recipient (provider) placeholder,
subject line, body requesting cancellation effective at the end of the
current billing cycle, a polite closing, and a signature line.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock && 'text' in textBlock ? textBlock.text : '';
}
