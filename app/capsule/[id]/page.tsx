"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { LockedSection } from "@/components/capsule/locked-section";
import { ReflectionForm } from "@/components/capsule/reflection-form";
import { AudioPlayer } from "@/components/player/audio-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CapsuleDetail } from "@/types";

export default function CapsuleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [capsule, setCapsule] = useState<CapsuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function loadCapsule() {
      try {
        const response = await fetch(`/api/capsule/${params.id}`);
        if (!response.ok) {
          throw new Error("Capsule not found");
        }
        const data = await response.json();
        setCapsule(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load capsule");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadCapsule();
  }, [params.id, router]);

  const regenerateVoice = async () => {
    if (!capsule) return;
    setRegenerating(true);
    try {
      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsuleId: capsule.id }),
      });
      if (!response.ok) {
        throw new Error("Voice generation failed");
      }
      const { audioUrl } = await response.json();
      setCapsule((prev) =>
        prev && prev.analysis
          ? { ...prev, analysis: { ...prev.analysis, audioUrl } }
          : prev
      );
      toast.success("Voice regenerated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }

  if (!capsule) return null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">{capsule.title}</h1>
            <Badge variant="secondary">{capsule.category}</Badge>
            <Badge variant="outline">{capsule.status}</Badge>
            {capsule.analysis?.emotion && <Badge>{capsule.analysis.emotion}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Created {format(new Date(capsule.createdAt), "MMM d, yyyy")} · Opens{" "}
            {format(new Date(capsule.openDate), "MMM d, yyyy")}
          </p>
        </div>

        {capsule.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capsule.imageUrl}
            alt={capsule.title}
            className="max-h-80 w-full rounded-xl object-cover"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Original Goal</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap">{capsule.goal}</CardContent>
        </Card>

        {capsule.voiceUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Your voice note</CardTitle>
            </CardHeader>
            <CardContent>
              <audio controls src={capsule.voiceUrl} className="w-full" />
            </CardContent>
          </Card>
        )}

        {capsule.analysis ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>{capsule.analysis.summary}</CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {capsule.analysis.keywords.map((keyword) => (
                <Badge key={keyword} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>

            {capsule.isOpen ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Future Letter</CardTitle>
                  </CardHeader>
                  <CardContent className="whitespace-pre-wrap">
                    {capsule.analysis.futureLetter}
                  </CardContent>
                </Card>

                {capsule.analysis.audioUrl ? (
                  <AudioPlayer src={capsule.analysis.audioUrl} />
                ) : (
                  <Button onClick={regenerateVoice} disabled={regenerating}>
                    {regenerating ? "Generating voice..." : "Generate voice"}
                  </Button>
                )}

                {capsule.analysis.advice && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Advice</CardTitle>
                    </CardHeader>
                    <CardContent>{capsule.analysis.advice}</CardContent>
                  </Card>
                )}

                {capsule.analysis.obstacles && capsule.analysis.obstacles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Possible Obstacles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc space-y-1 pl-5">
                        {capsule.analysis.obstacles.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <ReflectionForm
                  capsuleId={capsule.id}
                  reflections={capsule.reflections}
                  onSubmitted={(reflection) =>
                    setCapsule((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: "OPENED",
                            reflections: [reflection, ...prev.reflections],
                          }
                        : prev
                    )
                  }
                />
              </>
            ) : (
              <LockedSection openDate={capsule.openDate} />
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              AI analysis is still processing.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
