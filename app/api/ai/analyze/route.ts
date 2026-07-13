import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeGoal } from "@/lib/gemini";
import { generateSpeech } from "@/lib/elevenlabs";

const schema = z.object({
  capsuleId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { capsuleId } = schema.parse(body);

    const capsule = await prisma.capsule.findFirst({
      where: { id: capsuleId, userId: user.id },
    });

    if (!capsule) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const analysis = await analyzeGoal({
      title: capsule.title,
      category: capsule.category,
      goal: capsule.goal,
    });

    const saved = await prisma.aIAnalysis.upsert({
      where: { capsuleId },
      update: {
        summary: analysis.summary,
        emotion: analysis.emotion,
        keywords: analysis.keywords,
        futureLetter: analysis.futureLetter,
        advice: analysis.advice,
        obstacles: analysis.obstacles,
      },
      create: {
        capsuleId,
        summary: analysis.summary,
        emotion: analysis.emotion,
        keywords: analysis.keywords,
        futureLetter: analysis.futureLetter,
        advice: analysis.advice,
        obstacles: analysis.obstacles,
      },
    });

    let audioUrl: string | null = null;
    if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID) {
      try {
        audioUrl = await generateSpeech({
          userId: user.id,
          capsuleId,
          text: analysis.futureLetter,
        });
        await prisma.aIAnalysis.update({
          where: { id: saved.id },
          data: { audioUrl },
        });
      } catch (error) {
        console.error("Voice generation failed:", error);
      }
    }

    await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: "READY" },
    });

    return NextResponse.json({
      ...analysis,
      audioUrl,
      status: "READY",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    console.error("Analyze error:", error);

    const message = error instanceof Error ? error.message : "AI analysis failed";

    return NextResponse.json(
      { error: message, code: "ANALYZE_FAILED" },
      { status: 500 }
    );
  }
}
