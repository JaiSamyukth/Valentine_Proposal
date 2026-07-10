import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai
 * Body: { type: "poem" | "compliment" | "dialogue", receiverName, senderName, context? }
 * Returns: { text }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, receiverName, senderName, context } = body as {
      type: "poem" | "compliment" | "dialogue";
      receiverName: string;
      senderName: string;
      context?: string;
    };

    if (!receiverName) {
      return NextResponse.json(
        { error: "receiverName is required" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "poem") {
      systemPrompt =
        "You are a romantic poet. Write short, heartfelt, original love poems (4-8 lines). Use vivid imagery but keep it sincere and not cliché. No titles, just the poem.";
      userPrompt = `Write a short love poem for ${receiverName}${
        senderName ? ` from ${senderName}` : ""
      }.${context ? ` Context: ${context}` : ""}`;
    } else if (type === "compliment") {
      systemPrompt =
        "You are warm and sincere. Write a single, genuine, specific compliment that feels personal — not generic. Keep it under 2 sentences.";
      userPrompt = `Write a heartfelt compliment for ${receiverName}.${
        context ? ` Context: ${context}` : ""
      }`;
    } else {
      systemPrompt =
        "You are a romantic storyteller. Write a single line of dialogue that feels cinematic and personal. Keep it under 20 words.";
      userPrompt = `Write a romantic line addressed to ${receiverName}.${
        context ? ` Context: ${context}` : ""
      }`;
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json(
      { error: "AI generation failed: " + (e as Error).message },
      { status: 500 }
    );
  }
}
