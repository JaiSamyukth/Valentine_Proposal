import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/story/[id]/photo
 * Body: { dataUrl: "data:image/...;base64,..." }
 * Stores a photo (as base64 data URL) in the Story's config.photos array.
 * Returns { ok: true, photoUrl: dataUrl }
 *
 * We store photos as base64 data URLs directly in the config JSON.
 * This keeps everything self-contained (no external storage needed)
 * and works across devices when the receiver opens the link.
 */
const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB per photo

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { dataUrl } = body as { dataUrl: string };

    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image data URL" },
        { status: 400 }
      );
    }

    // Check size (base64 is ~1.33x the binary size)
    if (dataUrl.length > MAX_PHOTO_SIZE * 1.4) {
      return NextResponse.json(
        { error: "Image too large (max 2MB). Try a smaller image." },
        { status: 413 }
      );
    }

    const story = await db.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const config = JSON.parse(story.config);
    const photos: string[] = config.photos || [];
    if (photos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      );
    }

    photos.push(dataUrl);
    config.photos = photos;

    await db.story.update({
      where: { id },
      data: { config: JSON.stringify(config) },
    });

    return NextResponse.json({ ok: true, photoUrl: dataUrl });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to upload photo: " + (e as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/story/[id]/photo?index=N
 * Removes a photo by index from the story config.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const index = parseInt(url.searchParams.get("index") || "0");

    const story = await db.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const config = JSON.parse(story.config);
    const photos: string[] = config.photos || [];
    if (index < 0 || index >= photos.length) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }

    photos.splice(index, 1);
    config.photos = photos;

    await db.story.update({
      where: { id },
      data: { config: JSON.stringify(config) },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to delete photo: " + (e as Error).message },
      { status: 500 }
    );
  }
}
