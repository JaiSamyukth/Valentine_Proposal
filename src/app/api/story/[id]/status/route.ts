import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/story/[id]/status
 * Returns the sender's view into how receivers have interacted with this link:
 *   - totalViews: how many times the link was opened
 *   - completions: how many reached the end
 *   - latestView: the most recent view session (phase, scene, timestamps)
 *
 * This lets the sender know whether the receiver even tried the link, and
 * how far they got.
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

    const views = await db.storyView.findMany({
      where: { storyId: id },
      orderBy: { openedAt: "desc" },
    });

    const totalViews = views.length;
    const completions = views.filter((v) => v.completedAt !== null).length;
    const latestView = views[0] || null;

    return NextResponse.json({
      totalViews,
      completions,
      dateAccepted: views.some((v) => v.dateAccepted),
      latestView: latestView
        ? {
            openedAt: latestView.openedAt,
            lastSeenAt: latestView.lastSeenAt,
            completedAt: latestView.completedAt,
            currentPhase: latestView.currentPhase,
            currentScene: latestView.currentScene,
            yesPressed: latestView.yesPressed,
            dateAccepted: latestView.dateAccepted,
          }
        : null,
      allViews: views.map((v) => ({
        openedAt: v.openedAt,
        lastSeenAt: v.lastSeenAt,
        completedAt: v.completedAt,
        currentPhase: v.currentPhase,
        currentScene: v.currentScene,
        yesPressed: v.yesPressed,
        dateAccepted: v.dateAccepted,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load status: " + (e as Error).message },
      { status: 500 }
    );
  }
}
