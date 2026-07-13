import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCapsuleOpen } from "@/lib/capsule";
import type { CapsuleListItem } from "@/types";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const capsules = await prisma.capsule.findMany({
    where: { userId: user.id },
    include: { analysis: true },
    orderBy: { createdAt: "desc" },
  });

  const data: CapsuleListItem[] = capsules.map((capsule) => ({
    id: capsule.id,
    title: capsule.title,
    category: capsule.category,
    status: capsule.status,
    openDate: capsule.openDate.toISOString(),
    createdAt: capsule.createdAt.toISOString(),
    emotion: capsule.analysis?.emotion ?? null,
    isOpen: isCapsuleOpen(capsule.openDate),
  }));

  return NextResponse.json(data);
}

const createCapsuleSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1),
  goal: z.string().min(10).max(5000),
  openDate: z.string().datetime(),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const parsed = createCapsuleSchema.parse({
      title: formData.get("title"),
      category: formData.get("category"),
      goal: formData.get("goal"),
      openDate: formData.get("openDate"),
    });

    const image = formData.get("image");
    const voice = formData.get("voice");

    if (image instanceof File && image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 5MB", code: "IMAGE_TOO_LARGE" },
        { status: 400 }
      );
    }

    const capsule = await prisma.capsule.create({
      data: {
        userId: user.id,
        title: parsed.title,
        category: parsed.category,
        goal: parsed.goal,
        openDate: new Date(parsed.openDate),
        status: "PROCESSING",
      },
    });

    let imageUrl: string | undefined;
    let voiceUrl: string | undefined;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { buildMediaPath, uploadFile } = await import("@/lib/storage");

      if (image instanceof File && image.size > 0) {
        try {
          const ext = image.name.split(".").pop() || "jpg";
          const path = buildMediaPath(user.id, capsule.id, `image.${ext}`);
          imageUrl = await uploadFile(
            path,
            Buffer.from(await image.arrayBuffer()),
            image.type
          );
        } catch (error) {
          console.error("Image upload failed:", error);
        }
      }

      if (voice instanceof File && voice.size > 0) {
        try {
          const path = buildMediaPath(user.id, capsule.id, "voice.webm");
          voiceUrl = await uploadFile(
            path,
            Buffer.from(await voice.arrayBuffer()),
            voice.type || "audio/webm"
          );
        } catch (error) {
          console.error("Voice upload failed:", error);
        }
      }
    }

    if (imageUrl || voiceUrl) {
      await prisma.capsule.update({
        where: { id: capsule.id },
        data: { imageUrl, voiceUrl },
      });
    }

    return NextResponse.json({ id: capsule.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    console.error("Create capsule error:", error);
    return NextResponse.json(
      { error: "Failed to create capsule", code: "CREATE_FAILED" },
      { status: 500 }
    );
  }
}
