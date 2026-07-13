"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { CapsuleCard } from "@/components/dashboard/capsule-card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CapsuleListItem } from "@/types";

export default function DashboardPage() {
  const [capsules, setCapsules] = useState<CapsuleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCapsules() {
      try {
        const response = await fetch("/api/capsule");
        if (response.ok) {
          const data = await response.json();
          setCapsules(data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCapsules();
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Capsules</h1>
            <p className="text-muted-foreground">
              Capture your passion today. Meet your future self tomorrow.
            </p>
          </div>
          <Link
            href="/capsule/new"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            <Plus className="h-4 w-4" />
            Create Capsule
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full" />
            ))}
          </div>
        ) : capsules.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-xl font-medium">No capsules yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start by capturing a moment of passion and sealing it for your future self.
            </p>
            <Link href="/capsule/new" className={cn(buttonVariants(), "mt-6")}>
              Create your first capsule
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
