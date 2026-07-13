"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMonths, addYears } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoiceRecorder } from "@/components/capsule/voice-recorder";
import { PASSION_CATEGORIES } from "@/types";

type OpenDatePreset = "1month" | "6months" | "1year" | "custom";

function getOpenDate(preset: OpenDatePreset, customDate: string) {
  const now = new Date();
  switch (preset) {
    case "1month":
      return addMonths(now, 1);
    case "6months":
      return addMonths(now, 6);
    case "1year":
      return addYears(now, 1);
    case "custom":
      return new Date(customDate);
    default:
      return addMonths(now, 1);
  }
}

export function CreateCapsuleForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [voice, setVoice] = useState<Blob | null>(null);
  const [preset, setPreset] = useState<OpenDatePreset>("6months");
  const [customDate, setCustomDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !category || goal.length < 10) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (preset === "custom" && !customDate) {
      toast.error("Please choose a custom open date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("goal", goal);
      formData.append("openDate", getOpenDate(preset, customDate).toISOString());

      if (image) {
        formData.append("image", image);
      }

      if (voice) {
        formData.append("voice", voice, "voice.webm");
      }

      const response = await fetch("/api/capsule", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create capsule");
      }

      const { id } = await response.json();
      router.push(`/capsule/${id}/processing`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Become a Senior Backend Engineer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Passion Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value ?? "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {PASSION_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">Goal Description</Label>
        <Textarea
          id="goal"
          rows={6}
          placeholder="I want to become a Senior Backend Engineer in the next two years..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Upload Image (optional)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
      </div>

      <VoiceRecorder onRecordingChange={setVoice} />

      <div className="space-y-3">
        <Label>Open Date</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: "1month", label: "1 Month" },
            { value: "6months", label: "6 Months" },
            { value: "1year", label: "1 Year" },
            { value: "custom", label: "Custom Date" },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preset === option.value ? "default" : "outline"}
              onClick={() => setPreset(option.value as OpenDatePreset)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {preset === "custom" && (
          <Input
            type="date"
            value={customDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Capsule"}
      </Button>
    </form>
  );
}
