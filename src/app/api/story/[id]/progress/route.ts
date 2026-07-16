import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/story/[id]/progress
 * Body: { phase, scene, yesPressed?, completed? }
 *
 * Called by the receiver's browser periodically to report how far they've
 * gotten. Creates a StoryView row on first call, updates it on subsequent
 * calls. This is how the sender knows whether the link was opened / completed.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { phase, scene, yesPressed, completed, dateAccepted } = body as {
      phase: string;
      scene?: number;
      yesPressed?: boolean;
      completed?: boolean;
      dateAccepted?: boolean;
    };

    // Verify the story exists
    const story = await db.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Find an existing view for this story (use the most recent one from
    // the last 30 minutes as the same "session").
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    let view = await db.storyView.findFirst({
      where: {
        storyId: id,
        lastSeenAt: { gte: thirtyMinAgo },
      },
      orderBy: { lastSeenAt: "desc" },
    });

    const userAgent = req.headers.get("user-agent") || undefined;

    if (!view) {
      // Create a new view session
      view = await db.storyView.create({
        data: {
          storyId: id,
          currentPhase: phase,
          currentScene: scene ?? 0,
          yesPressed: yesPressed ?? false,
          dateAccepted: dateAccepted ?? false,
          completedAt: completed ? new Date() : null,
          userAgent,
        },
      });
    } else {
      // Update existing view — only advance, never regress
      const shouldMarkComplete = completed || phase === "done";
      const newPhase = phaseRank(phase) > phaseRank(view.currentPhase)
        ? phase
        : view.currentPhase;
      const newScene = Math.max(view.currentScene, scene ?? view.currentScene);

      view = await db.storyView.update({
        where: { id: view.id },
        data: {
          currentPhase: newPhase,
          currentScene: newScene,
          yesPressed: yesPressed || view.yesPressed,
          dateAccepted: dateAccepted || view.dateAccepted,
          completedAt: shouldMarkComplete
            ? new Date()
            : view.completedAt,
        },
      });
    }

    return NextResponse.json({ ok: true, viewId: view.id });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to record progress: " + (e as Error).message },
      { status: 500 }
    );
  }
}

function phaseRank(phase: string): number {
  const ranks: Record<string, number> = {
    opening: 0,
    journey: 1,
    question: 2,
    finale: 3,
    done: 4,
  };
  return ranks[phase] ?? 0;
}
