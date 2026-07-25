import {
  Captions,
  Crop,
  Gauge,
  Languages,
  ScanFace,
  Sparkles,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind gradient used for the card's icon chip. */
  accent: string;
  meta: string;
}

export const features: Feature[] = [
  {
    id: "clip-detection",
    title: "AI Clip Detection",
    description:
      "Our model reads transcript, tone, pacing and audience retention signals to surface the moments most likely to travel — then ranks them with a virality score.",
    icon: Sparkles,
    accent: "from-violet-500/90 to-fuchsia-500/70",
    meta: "Ranked 0–100",
  },
  {
    id: "captions",
    title: "AI Captions",
    description:
      "Word-level timing with animated highlight styles, emoji emphasis and 99% transcription accuracy. Restyle every caption in one click.",
    icon: Captions,
    accent: "from-sky-500/90 to-cyan-400/70",
    meta: "Word-level sync",
  },
  {
    id: "auto-reframe",
    title: "Auto Reframe",
    description:
      "Landscape footage becomes 9:16, 1:1 or 4:5 with subject-aware cropping that keeps the action centred through cuts and camera moves.",
    icon: Crop,
    accent: "from-emerald-500/90 to-teal-400/70",
    meta: "4 aspect ratios",
  },
  {
    id: "export-4k",
    title: "4K Export",
    description:
      "Deliver pristine 2160p verticals with tuned bitrate ladders per platform, so nothing softens after TikTok, Reels or Shorts re-encodes.",
    icon: Video,
    accent: "from-amber-500/90 to-orange-400/70",
    meta: "Up to 2160p",
  },
  {
    id: "face-tracking",
    title: "Face Tracking",
    description:
      "Continuous face-lock keeps every speaker framed and steady, with smoothing that removes jitter without the drift of naive centre-crops.",
    icon: ScanFace,
    accent: "from-rose-500/90 to-pink-400/70",
    meta: "60 fps tracking",
  },
  {
    id: "speaker-detection",
    title: "Speaker Detection",
    description:
      "Diarization separates voices, labels each speaker and auto-cuts between them — panel discussions edit themselves.",
    icon: Users,
    accent: "from-indigo-500/90 to-blue-400/70",
    meta: "Up to 8 speakers",
  },
  {
    id: "fast-rendering",
    title: "Fast Rendering",
    description:
      "A distributed GPU pipeline renders a 60-second vertical clip in under 30 seconds, and processes a full hour of source in about 4 minutes.",
    icon: Gauge,
    accent: "from-lime-500/90 to-emerald-400/70",
    meta: "~30s per clip",
  },
  {
    id: "multi-language",
    title: "Multi Language",
    description:
      "Transcribe and caption in 32 languages, with translated subtitle tracks so one recording reaches every market you sell into.",
    icon: Languages,
    accent: "from-cyan-500/90 to-blue-400/70",
    meta: "32 languages",
  },
];
