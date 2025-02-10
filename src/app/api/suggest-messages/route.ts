import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";


const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(apiKey);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Use "gemini-2.0-flash" for fast responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate content from Gemini API
    const response = await model.generateContent(prompt);

    // Extract text from response
    const text = response?.content ?? "No response received";

    return NextResponse.json({ questions: text }, { status: 200 });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}

