import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai
 * Body: { type: "poem" | "compliment" | "dialogue", receiverName, senderName, context? }
 * Returns: { text, aiGenerated: boolean }
 *
 * This route tries the z-ai-web-dev-sdk first. If the SDK isn't configured
 * (no .z-ai-config file) or fails for any reason, it falls back to
 * high-quality curated templates so the app NEVER breaks.
 */

// ---- Curated fallback content (used when AI SDK is unavailable) ----

const FALLBACK_POEMS = [
  "In every sunrise, your name,\nin every star, your light.\nThe world is softer now\nbecause you're in it.",
  "Your hands, a quiet map\nof everywhere we've been.\nAnd everywhere we'll go,\ntraced in the lines of your skin.",
  "If the universe had a voice,\nit would sound like your laugh.\nIf time had a shape,\nit would be the curve of your smile.",
  "You are the question\nand the answer,\nthe silence between notes\nthat makes the music matter.",
  "I counted stars tonight\nand lost track—\nthey kept rearranging themselves\ninto the shape of your name.",
  "Some people search lifetimes\nfor a single moment of home.\nI found mine\nthe second you looked my way.",
  "Your heartbeat is the only clock\nI want to set my life by.\nEach tick a reminder:\nyou are here, you are here, you are here.",
  "Between the hellos and goodbyes,\nthere is a country where we live—\nunmapped, unhurried,\nbuilt from ordinary miracles.",
];

const FALLBACK_COMPLIMENTS = [
  "The way you see the world makes everyone around you feel like they're part of something bigger.",
  "You have this rare gift — you make ordinary moments feel like they matter, just by being in them.",
  "Your kindness isn't loud, but it changes the temperature of every room you walk into.",
  "You move through chaos like it's just another word for possibility.",
  "There's something about the way you laugh at your own jokes that makes the whole world feel lighter.",
  "You don't just listen — you make people feel heard. That's rarer than you think.",
  "Your mind is the kind of beautiful that doesn't know it's beautiful, which makes it even more so.",
  "You have a way of making people feel like they're exactly where they're supposed to be.",
];

function pickFallback(
  type: string,
  receiverName: string,
  senderName?: string
): string {
  if (type === "poem") {
    const poem =
      FALLBACK_POEMS[Math.floor(Math.random() * FALLBACK_POEMS.length)];
    // personalize the last line
    return poem + `\n\n— for ${receiverName}`;
  }
  if (type === "compliment") {
    const c =
      FALLBACK_COMPLIMENTS[Math.floor(Math.random() * FALLBACK_COMPLIMENTS.length)];
    return `${receiverName}, ${c.charAt(0).toLowerCase() + c.slice(1)}`;
  }
  // dialogue
  const lines = [
    `Hey ${receiverName}... stay a little longer.`,
    `${receiverName}, you're my favorite story to come home to.`,
    `If I had to start over, I'd find you again, ${receiverName}.`,
    `${receiverName}, the world is better with you in it.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

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

    // Try OpenRouter AI
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is missing");
      }

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

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://valentineproposal.com",
          "X-Title": "Valentine Proposal"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      
      if (text) {
        return NextResponse.json({ text, aiGenerated: true });
      }
      // empty response — fall through to fallback
      throw new Error("Empty AI response");
    } catch (err) {
      // API error or key missing — use fallback
      console.warn("AI Generation failed or not configured, using fallback:", err);
      const text = pickFallback(type, receiverName, senderName);
      return NextResponse.json({ text, aiGenerated: false });
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
