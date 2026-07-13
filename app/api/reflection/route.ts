import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCapsuleOpen } from "@/lib/capsule";
import { analyzeReflection } from "@/lib/gemini";

const schema = z.object({
  capsuleId: z.string().min(1),
  reflection: z.string().min(10).max(5000),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { capsuleId, reflection } = schema.parse(body);

    const capsule = await prisma.capsule.findFirst({
      where: { id: capsuleId, userId: user.id },
      include: {
        reflections: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!capsule) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (!isCapsuleOpen(capsule.openDate)) {
      return NextResponse.json(
        { error: "Capsule is still locked", code: "LOCKED" },
        { status: 403 }
      );
    }

    const analysis = await analyzeReflection({
      title: capsule.title,
      category: capsule.category,
      goal: capsule.goal,
      reflection,
      priorReflections: capsule.reflections.map((item) => item.reflection),
    });

    const saved = await prisma.reflection.create({
      data: {
        capsuleId,
        reflection,
        analysis: analysis as unknown as Prisma.InputJsonValue,
      },
    });

    await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: "OPENED" },
    });

    return NextResponse.json({
      id: saved.id,
      reflection: saved.reflection,
      analysis,
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    console.error("Reflection error:", error);
    return NextResponse.json(
      { error: "Reflection analysis failed", code: "REFLECTION_FAILED" },
      { status: 500 }
    );
  }
}
