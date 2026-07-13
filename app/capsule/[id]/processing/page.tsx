"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { LoadingCapsule } from "@/components/ui/loading-capsule";
import { Button } from "@/components/ui/button";

export default function ProcessingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const runAnalysis = async () => {
    setRetrying(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsuleId: params.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "AI processing failed");
      }

      router.replace(`/capsule/${params.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        {!error ? (
          <LoadingCapsule />
        ) : (
          <div className="space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={runAnalysis} disabled={retrying}>
              {retrying ? "Retrying..." : "Retry AI Request"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
