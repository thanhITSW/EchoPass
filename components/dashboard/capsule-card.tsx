"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CapsuleListItem } from "@/types";

const statusLabels = {
  PROCESSING: "Processing",
  READY: "Ready",
  OPENED: "Opened",
} as const;

export function CapsuleCard({ capsule }: { capsule: CapsuleListItem }) {
  return (
    <Link href={`/capsule/${capsule.id}`}>
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg">{capsule.title}</CardTitle>
            {capsule.isOpen ? (
              <Unlock className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{capsule.category}</Badge>
            <Badge variant="outline">{statusLabels[capsule.status]}</Badge>
            {capsule.emotion && <Badge>{capsule.emotion}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Created {format(new Date(capsule.createdAt), "MMM d, yyyy")}</p>
          <p>Opens {format(new Date(capsule.openDate), "MMM d, yyyy")}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
