"use client";

import { motion } from "framer-motion";

export function LoadingCapsule({ message = "Sealing your passion into a time capsule..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <motion.div
        className="relative h-24 w-24 rounded-full border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5"
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-3 rounded-full border border-primary/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.4), transparent)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <p className="max-w-sm text-center text-muted-foreground">{message}</p>
    </div>
  );
}
