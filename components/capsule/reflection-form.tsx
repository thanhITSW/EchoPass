"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CapsuleDetail, ReflectionResult } from "@/types";
import { format } from "date-fns";

export function ReflectionForm({
  capsuleId,
  reflections,
  onSubmitted,
}: {
  capsuleId: string;
  reflections: CapsuleDetail["reflections"];
  onSubmitted: (reflection: CapsuleDetail["reflections"][0]) => void;
}) {
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (reflection.length < 10) {
      toast.error("Please write at least a few sentences about your journey.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsuleId, reflection }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit reflection");
      }

      const data = await response.json();
      onSubmitted(data);
      setReflection("");
      toast.success("Reflection saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">What happened since then?</h3>
          <Textarea
            rows={5}
            placeholder="Share your journey, wins, setbacks, and where you are now..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Reflecting..." : "Submit Reflection"}
        </Button>
      </form>

      {reflections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Past reflections</h3>
          {reflections.map((item) => (
            <ReflectionCard key={item.id} reflection={item.reflection} analysis={item.analysis} createdAt={item.createdAt} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReflectionCard({
  reflection,
  analysis,
  createdAt,
}: {
  reflection: string;
  analysis: ReflectionResult;
  createdAt: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {format(new Date(createdAt), "MMMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">{reflection}</p>
        <div>
          <p className="font-medium">Growth</p>
          <p>{analysis.growth}</p>
        </div>
        <div>
          <p className="font-medium">Achievements</p>
          <ul className="list-disc pl-5">
            {analysis.achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Missed goals</p>
          <ul className="list-disc pl-5">
            {analysis.missedGoals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Suggestions</p>
          <ul className="list-disc pl-5">
            {analysis.suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="italic">{analysis.encouragement}</p>
      </CardContent>
    </Card>
  );
}
