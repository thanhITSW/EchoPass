"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_SECONDS = 60;

export function VoiceRecorder({
  onRecordingChange,
}: {
  onRecordingChange: (blob: Blob | null) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingChange(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access is required to record voice.");
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setSeconds(0);
    onRecordingChange(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Voice note (optional, up to 60s)</p>
        <span className="text-sm text-muted-foreground">{seconds}s / {MAX_SECONDS}s</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {!isRecording ? (
          <Button type="button" variant="outline" onClick={startRecording} className="gap-2">
            <Mic className="h-4 w-4" />
            Record
          </Button>
        ) : (
          <Button type="button" variant="destructive" onClick={stopRecording} className="gap-2">
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}
        {audioUrl && (
          <>
            <Link
              href={audioUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <Play className="h-4 w-4" />
              Preview
            </Link>
            <Button type="button" variant="ghost" onClick={clearRecording} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
