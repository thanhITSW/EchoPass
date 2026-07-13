import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      include: { analysis: true },
    });

    if (!capsule?.analysis) {
      return NextResponse.json(
        { error: "Analysis not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const audioUrl = await generateSpeech({
      userId: user.id,
      capsuleId,
      text: capsule.analysis.futureLetter,
    });

    await prisma.aIAnalysis.update({
      where: { capsuleId },
      data: { audioUrl },
    });

    return NextResponse.json({ audioUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    console.error("Voice generation error:", error);
    return NextResponse.json(
      { error: "Voice generation failed", code: "VOICE_FAILED" },
      { status: 500 }
    );
  }
}
