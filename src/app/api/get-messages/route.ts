// app/api/get-messages/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

const SENTIMENT_URL = process.env.SENTIMENT_URL!; // e.g. https://your-worker.workers.dev

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User | undefined = (session?.user as any) ?? undefined;

  if (!session || !user?._id) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const userData = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } }
    ]).exec();

    const messages = userData?.[0]?.messages?.filter(Boolean) ?? [];

    if (messages.length === 0) {
      return Response.json({
        success: true,
        message: "No messages found",
        messages: [],
        buckets: { positive: [], negative: [], neutral: [] },
        counts: { positive: 0, negative: 0, neutral: 0 }
      });
    }

    // Build texts safely (map actual field names you store)
    interface Message {
      text?: string;
      message?: string;
      content?: string;
      [key: string]: any;
    }

    const texts: string[] = messages
      .map((m: Message) => String(m?.text ?? m?.message ?? m?.content ?? '').trim())
      .filter((t: string) => t.length > 0);

    if (texts.length === 0) {
      return Response.json({
        success: true,
        message: "No valid message text to analyze",
        messages,
        buckets: { positive: [], negative: [], neutral: [] },
        counts: { positive: 0, negative: 0, neutral: 0 }
      });
    }

    const workerUrl = `${SENTIMENT_URL.replace(/\/$/, '')}/feedback/sentiment`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    // Try batch first
    let results: any[] | null = null;
    try {
      const batch = await fetch(workerUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ texts })
      });
      if (batch.ok) {
        const json = await batch.json().catch(() => ({}));
        if (Array.isArray(json?.results)) results = json.results;
      }
    } catch {
      // fall through to per-item
    }

    // Fallback: per-text calls to guarantee coverage
    if (!results || results.length !== texts.length) {
      const classifyOne = async (text: string) => {
        try {
          const r = await fetch(workerUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ text })
          });
          if (!r.ok) return null;
          const j = await r.json().catch(() => null);
          return Array.isArray(j?.results) ? j.results[0] ?? null : null;
        } catch {
          return null;
        }
      };

      results = await Promise.all(texts.map((t) => classifyOne(t)));
    }

    // Bucket helper
    const buckets = { positive: [] as any[], negative: [] as any[], neutral: [] as any[] };
    messages.forEach((msg: any, i: number) => {
      const s = results?.[i];
      const tag = (s?.tag ?? "UNCERTAIN").toUpperCase();
      const enriched = { ...msg, sentiment: s };
      if (tag === "POSITIVE") buckets.positive.push(enriched);
      else if (tag === "NEGATIVE") buckets.negative.push(enriched);
      else buckets.neutral.push(enriched);
    });

    return Response.json({
      success: true,
      message: "User messages fetched successfully",
      counts: {
        positive: buckets.positive.length,
        negative: buckets.negative.length,
        neutral: buckets.neutral.length
      },
      buckets,
      messages: [...buckets.positive, ...buckets.negative, ...buckets.neutral]
    });
  } catch (error) {
    console.error("get-messages error:", error);
    return Response.json(
      { success: false, message: "Something went wrong, please try again later" },
      { status: 500 }
    );
  }
}
