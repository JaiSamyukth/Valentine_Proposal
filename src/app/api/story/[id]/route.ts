import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedFromId } from "@/lib/story-config";

/**
 * GET /api/story/[id] — retrieve a story config + seed by ID.
 * This is called by the receiver when they open /story/:id
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const story = await db.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: story.id,
      config: JSON.parse(story.config),
      seed: story.seed,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load story: " + (e as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/story/[id] — update an existing story config.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const config = body.config;
    if (!config) {
      return NextResponse.json({ error: "config required" }, { status: 400 });
    }
    const existing = await db.story.findUnique({ where: { id } });
    if (!existing) {
      // create if doesn't exist
      const seed = seedFromId(id);
      await db.story.create({
        data: { id, config: JSON.stringify(config), seed },
      });
    } else {
      await db.story.update({
        where: { id },
        data: { config: JSON.stringify(config) },
      });
    }
    return NextResponse.json({ id, ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update story: " + (e as Error).message },
      { status: 500 }
    );
  }
}
