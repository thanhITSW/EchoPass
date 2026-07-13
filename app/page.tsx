"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <span className="text-lg font-semibold">EchoPass</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Preserve passion. Reconnect with your future self.
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Capture your passion today.
            <span className="block text-primary">Meet your future self tomorrow.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            EchoPass turns your goals, voice, and emotions into a personalized time capsule.
            When you reopen it, AI helps your past and future selves have a meaningful conversation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Get started
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 grid w-full gap-4 sm:grid-cols-3"
        >
          {[
            {
              title: "Capture",
              description: "Write your goal, add a photo, or record your voice in the moment.",
            },
            {
              title: "Transform",
              description: "AI crafts a future letter, emotion map, and voice message for you.",
            },
            {
              title: "Reflect",
              description: "Reopen later and compare where you started with where you are now.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-6 text-left">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
