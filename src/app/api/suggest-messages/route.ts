import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error('Missing GROQ_API_KEY in environment variables');
}

const client = new Groq({ apiKey }); 
const PROMPT = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: "What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?". Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

const RATE_LIMIT = 5;
const WINDOW_SIZE = 60 * 1000;
const ipRequestsMap = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestsMap.get(ip);

  if (!entry || now - entry.timestamp > WINDOW_SIZE) {
    ipRequestsMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  ipRequestsMap.set(ip, entry);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Rate limiting check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: PROMPT }],
      model: 'openai/gpt-oss-20b', 
    });

    const text = chatCompletion.choices[0]?.message.content?.trim();

    if (!text || text === '') {
      return NextResponse.json(
        { error: 'Empty response from Groq API' },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions: text }, { status: 200 });
  } catch (err) {
    console.error('Groq API error:', err);
    return NextResponse.json(
      { error: 'Failed to generate questions. Please try again later.' },
      { status: 500 }
    );
  }
}
