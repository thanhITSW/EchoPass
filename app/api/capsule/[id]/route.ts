import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCapsuleDetail } from "@/lib/capsule";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const capsule = await prisma.capsule.findFirst({
    where: { id, userId: user.id },
    include: {
      analysis: true,
      reflections: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!capsule) {
    return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(formatCapsuleDetail(capsule));
}
