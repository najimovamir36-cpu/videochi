import { BrainCircuit, Download, UploadCloud, Wand2, type LucideIcon } from "lucide-react";

export interface WorkflowStep {
  id: string;
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
  duration: string;
  details: string[];
}

export const workflowSteps: WorkflowStep[] = [
  {
    id: "upload",
    index: "01",
    title: "Upload",
    description:
      "Drag in an MP4, MOV, AVI, MKV or WEBM file up to 8 GB — or paste a YouTube link and we pull the source for you.",
    icon: UploadCloud,
    duration: "Seconds",
    details: ["Resumable multipart transfer", "8 GB per file", "YouTube, Drive and URL import"],
  },
  {
    id: "analysis",
    index: "02",
    title: "AI Analysis",
    description:
      "We transcribe the audio, diarize speakers, read the emotional arc and score every candidate moment for shareability.",
    icon: BrainCircuit,
    duration: "~4 min per hour",
    details: ["Word-level transcript", "Speaker diarization", "Virality scoring 0–100"],
  },
  {
    id: "generate",
    index: "03",
    title: "Generate",
    description:
      "Clips are cut, reframed to vertical with face tracking, captioned in your brand style and titled with hooks that earn the scroll.",
    icon: Wand2,
    duration: "~30s per clip",
    details: ["Subject-aware reframe", "Animated captions", "AI titles and hashtags"],
  },
  {
    id: "download",
    index: "04",
    title: "Download",
    description:
      "Review the ranked set, tweak anything in the editor, then export up to 4K or publish straight to your connected channels.",
    icon: Download,
    duration: "Instant",
    details: ["Up to 2160p export", "Platform-tuned bitrates", "Bulk download as ZIP"],
  },
];
