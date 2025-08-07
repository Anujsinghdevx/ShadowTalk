import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// ENV validation
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Shared Prompt
const PROMPT = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: "What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?". Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

// --- In-Memory Rate Limiting Store (works in edge runtime) ---
const RATE_LIMIT = 5; // requests
const WINDOW_SIZE = 60 * 1000; // in ms (1 minute)
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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    //  Rate limiting check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // ✅ Gemini request
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(PROMPT);
    const text = await result.response.text();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Empty response from Gemini API" },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions: text }, { status: 200 });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again later." },
      { status: 500 }
    );
  }
}
