"use client";

import { motion } from "framer-motion";
import { Captions, Cpu, Flame, ScanFace, Waves } from "lucide-react";

import { VideoThumbnail } from "@/components/shared/video-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DETECTED_MOMENTS = [
  { at: "04:12", label: "Why most founders quit at month 9", score: 96 },
  { at: "18:40", label: "The hiring mistake nobody admits", score: 91 },
  { at: "37:05", label: "How we cut burn by 40%", score: 88 },
  { at: "52:31", label: "The one metric that mattered", score: 84 },
];

const CLIP_CARDS = [
  { color: "#7c5cff", score: 96, duration: 42 },
  { color: "#22d3ee", score: 91, duration: 58 },
  { color: "#ec4899", score: 88, duration: 36 },
];

/** Waveform bars with deterministic heights so SSR and CSR match. */
const WAVEFORM = Array.from({ length: 72 }, (_, index) => {
  const wave = Math.sin(index * 0.55) * 0.5 + Math.sin(index * 0.19) * 0.35;
  return 26 + Math.abs(wave) * 62;
});

/** The hero product mock: a floating studio window with live-looking analysis. */
export function HeroShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.35, ease: EASE_PREMIUM }}
      className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
    >
      <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(124,92,255,0.35),transparent_70%)] blur-2xl" />

      <div className="glass-strong edge-light noise relative overflow-hidden rounded-3xl p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)] sm:rounded-[26px] sm:p-2.5">
        {/* Window chrome */}
        <div className="flex items-center gap-3 px-3 pb-2.5 pt-1.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[11px] text-muted-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_1px_hsl(var(--success)/0.7)]" />
            app.clipmind.ai/projects/founder-mindset-142
          </div>
        </div>

        <div className="grid gap-2.5 rounded-2xl bg-black/40 p-2.5 lg:grid-cols-[1.35fr_1fr]">
          {/* Source + timeline */}
          <div className="flex flex-col gap-2.5">
            <div className="relative overflow-hidden rounded-xl border border-white/[0.07]">
              {/* Duration is shown in the transcript panel, so it is omitted
                  here to keep the progress overlay unobstructed. */}
              <VideoThumbnail color="#7c5cff" aspect="video" className="rounded-none border-0" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="border-white/10 bg-black/70">
                  <ScanFace />
                  Face lock
                </Badge>
                <Badge variant="secondary" className="border-white/10 bg-black/70">
                  <Captions />
                  2 speakers
                </Badge>
              </div>
              <div className="absolute inset-x-3 bottom-3 flex items-center gap-2.5">
                <Badge variant="default" className="border-white/10 bg-black/70">
                  <Cpu />
                  Analyzing
                </Badge>
                <Progress value={72} animated className="h-1.5 flex-1 bg-white/15" />
                <span className="text-[11px] tabular text-white/80">72%</span>
              </div>
            </div>

            {/* Waveform with detected moment markers */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  <Waves className="size-3" />
                  Transcript energy
                </span>
                <span className="text-[11px] tabular text-muted-foreground">02:03:32</span>
              </div>

              <div className="flex h-16 items-end gap-[2px]">
                {WAVEFORM.map((height, index) => {
                  const isHot = [8, 9, 10, 26, 27, 44, 45, 46, 61].includes(index);
                  return (
                    <motion.span
                      key={index}
                      initial={{ height: 4, opacity: 0 }}
                      animate={{ height: `${height}%`, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.7 + index * 0.008,
                        ease: EASE_PREMIUM,
                      }}
                      className={cn(
                        "w-full rounded-full",
                        isHot ? "bg-brand-gradient" : "bg-white/25",
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detected moments + generated clips */}
          <div className="flex flex-col gap-2.5">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  <Flame className="size-3 text-primary" />
                  Viral moments
                </span>
                <span className="text-[11px] tabular text-muted-foreground">18 found</span>
              </div>

              <ul className="space-y-1.5">
                {DETECTED_MOMENTS.map((moment, index) => (
                  <motion.li
                    key={moment.at}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.11, ease: EASE_PREMIUM }}
                    className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.025] px-2.5 py-2 transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
                  >
                    <span className="text-[10.5px] tabular text-muted-foreground">{moment.at}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-foreground/85">
                      {moment.label}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular",
                        moment.score >= 90
                          ? "bg-primary/18 text-primary"
                          : "bg-white/[0.07] text-muted-foreground",
                      )}
                    >
                      {moment.score}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {CLIP_CARDS.map((clip, index) => (
                <motion.div
                  key={clip.color}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.25 + index * 0.12, ease: EASE_PREMIUM }}
                  className="relative"
                >
                  <VideoThumbnail color={clip.color} aspect="vertical" duration={clip.duration} />
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tabular text-white">
                    {clip.score}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating accolades */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.5, ease: EASE_PREMIUM }}
        className="glass-strong absolute -left-3 bottom-14 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-lifted lg:flex"
      >
        <span className="grid size-8 place-items-center rounded-xl bg-success/15 text-success">
          <Captions className="size-4" />
        </span>
        <div>
          <p className="text-[12px] font-medium leading-tight">Captions rendered</p>
          <p className="text-[11px] text-muted-foreground">99.2% accuracy · EN</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.65, ease: EASE_PREMIUM }}
        className="glass-strong absolute -right-4 top-24 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-lifted lg:flex"
      >
        <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
          <Flame className="size-4" />
        </span>
        <div>
          <p className="text-[12px] font-medium leading-tight">18 clips ready</p>
          <p className="text-[11px] text-muted-foreground">in 4 min 12 s</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
