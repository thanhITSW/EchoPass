import type { CapsuleDetail, ReflectionResult } from "@/types";
import type { Prisma } from "@/lib/generated/prisma/client";

type CapsuleWithRelations = Prisma.CapsuleGetPayload<{
  include: {
    analysis: true;
    reflections: true;
  };
}>;

export function isCapsuleOpen(openDate: Date) {
  return openDate.getTime() <= Date.now();
}

export function formatCapsuleDetail(
  capsule: CapsuleWithRelations
): CapsuleDetail {
  const open = isCapsuleOpen(capsule.openDate);

  const analysis = capsule.analysis
    ? {
        summary: capsule.analysis.summary,
        emotion: capsule.analysis.emotion,
        keywords: capsule.analysis.keywords,
        ...(open
          ? {
              futureLetter: capsule.analysis.futureLetter,
              advice: capsule.analysis.advice,
              obstacles: capsule.analysis.obstacles,
              audioUrl: capsule.analysis.audioUrl,
            }
          : {}),
      }
    : null;

  return {
    id: capsule.id,
    title: capsule.title,
    category: capsule.category,
    goal: capsule.goal,
    imageUrl: capsule.imageUrl,
    voiceUrl: capsule.voiceUrl,
    status: capsule.status,
    openDate: capsule.openDate.toISOString(),
    createdAt: capsule.createdAt.toISOString(),
    isOpen: open,
    analysis,
    reflections: open
      ? capsule.reflections.map((reflection) => ({
          id: reflection.id,
          reflection: reflection.reflection,
          analysis: reflection.analysis as unknown as ReflectionResult,
          createdAt: reflection.createdAt.toISOString(),
        }))
      : [],
  };
}
