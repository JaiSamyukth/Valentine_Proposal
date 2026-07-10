import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateStoryId, seedFromId } from "@/lib/story-config";

/**
 * POST /api/story — create a new story, returns { id, seed }
 * Body: { config: StoryConfig }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = body.config;
    if (!config || !config.senderName || !config.receiverName) {
      return NextResponse.json(
        { error: "senderName and receiverName are required" },
        { status: 400 }
      );
    }
    const id = generateStoryId();
    const seed = seedFromId(id);
    await db.story.create({
      data: {
        id,
        config: JSON.stringify(config),
        seed,
      },
    });
    return NextResponse.json({ id, seed });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create story: " + (e as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/story — list all story IDs (for the builder's "my stories")
 */
export async function GET() {
  try {
    const stories = await db.story.findMany({
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ stories });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to list stories: " + (e as Error).message },
      { status: 500 }
    );
  }
}
