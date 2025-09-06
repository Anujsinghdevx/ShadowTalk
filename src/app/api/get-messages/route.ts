import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import type { User } from "next-auth";
import mongoose from "mongoose";

type SentimentTag = "POSITIVE" | "NEGATIVE" | "UNCERTAIN";

interface SentimentItem {
  tag: SentimentTag;
  confidence: number;
  positive_score: number;
  negative_score: number;
}

interface SentimentBatchResponse {
  results: SentimentItem[];
}

interface SentimentSingleResponse {
  results: [SentimentItem] | [];
}

type SessionUser = User & { _id: string };

interface MessageDoc {
  _id?: string;
  text?: string;
  message?: string;
  content?: string;
  createdAt?: string | Date;
  [key: string]: unknown;
}

interface AggregatedUser {
  _id: mongoose.Types.ObjectId;
  messages: MessageDoc[];
}

interface Buckets<T> {
  positive: T[];
  negative: T[];
  neutral: T[];
}

type MessageWithSentiment = MessageDoc & { sentiment?: SentimentItem | null };

/** ========= Config ========= */
const SENTIMENT_URL = process.env.SENTIMENT_URL as string; 
const SENTIMENT_TOKEN = process.env.SENTIMENT_TOKEN as string | undefined;

function isSentimentBatchResponse(x: unknown): x is SentimentBatchResponse {
  return !!x && typeof x === "object" && Array.isArray((x as SentimentBatchResponse).results);
}

function isSentimentSingleResponse(x: unknown): x is SentimentSingleResponse {
  return (
    !!x &&
    typeof x === "object" &&
    Array.isArray((x as SentimentSingleResponse).results) &&
    ((x as SentimentSingleResponse).results.length === 0 ||
      (x as SentimentSingleResponse).results.length === 1)
  );
}

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!session || !user?._id) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const agg = (await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } }
    ]).exec()) as AggregatedUser[];

    const messages: MessageDoc[] = agg?.[0]?.messages?.filter(Boolean) ?? [];

    if (messages.length === 0) {
      return Response.json({
        success: true,
        message: "No messages found",
        messages: [] as MessageWithSentiment[],
        buckets: { positive: [], negative: [], neutral: [] } as Buckets<MessageWithSentiment>,
        counts: { positive: 0, negative: 0, neutral: 0 }
      });
    }

    // Build texts safely (map actual field names you store)
    const texts: string[] = messages
      .map((m) => String((m.text ?? m.message ?? m.content ?? "") as string).trim())
      .filter((t) => t.length > 0);

    if (texts.length === 0) {
      return Response.json({
        success: true,
        message: "No valid message text to analyze",
        messages,
        buckets: { positive: [], negative: [], neutral: [] } as Buckets<MessageWithSentiment>,
        counts: { positive: 0, negative: 0, neutral: 0 }
      });
    }

    const workerUrl = `${SENTIMENT_URL.replace(/\/$/, "")}/feedback/sentiment`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(SENTIMENT_TOKEN ? { Authorization: `Bearer ${SENTIMENT_TOKEN}` } : {})
    };

    // --- Try batch first
    let results: (SentimentItem | null)[] | null = null;
    try {
      const batch = await fetch(workerUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ texts })
      });

      if (batch.ok) {
        const json: unknown = await batch.json().catch(() => ({}));
        if (isSentimentBatchResponse(json)) {
          results = json.results;
        }
      }
    } catch {
      // fall through to per-item
    }

    // --- Fallback: per-text calls
    if (!results || results.length !== texts.length) {
      const classifyOne = async (text: string): Promise<SentimentItem | null> => {
        try {
          const r = await fetch(workerUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ text })
          });
          if (!r.ok) return null;
          const j: unknown = await r.json().catch(() => null);
          if (isSentimentSingleResponse(j)) {
            return j.results[0] ?? null;
          }
          return null;
        } catch {
          return null;
        }
      };

      results = await Promise.all(texts.map((t) => classifyOne(t)));
    }

    // Ensure results array length matches messages length
    const normalized: (SentimentItem | null)[] = Array.from({ length: messages.length }, (_, i) =>
      (results && results[i]) ? results[i] : null
    );

    // Bucket
    const buckets: Buckets<MessageWithSentiment> = { positive: [], negative: [], neutral: [] };
    messages.forEach((msg, i) => {
      const s = normalized[i];
      const tag = (s?.tag ?? "UNCERTAIN") as SentimentTag;
      const enriched: MessageWithSentiment = { ...msg, sentiment: s ?? null };

      if (tag === "POSITIVE") buckets.positive.push(enriched);
      else if (tag === "NEGATIVE") buckets.negative.push(enriched);
      else buckets.neutral.push(enriched);
    });

    const flat: MessageWithSentiment[] = [
      ...buckets.positive,
      ...buckets.negative,
      ...buckets.neutral
    ];

    return Response.json({
      success: true,
      message: "User messages fetched successfully",
      counts: {
        positive: buckets.positive.length,
        negative: buckets.negative.length,
        neutral: buckets.neutral.length
      },
      buckets,
      messages: flat
    });
  } catch (error) {
    console.error("get-messages error:", error);
    return Response.json(
      { success: false, message: "Something went wrong, please try again later" },
      { status: 500 }
    );
  }
}
