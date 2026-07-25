export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Solid colour used behind the initials when no avatar is set. */
  accent: string;
  metric: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "We used to pay an editor for 12 hours a week to cut our podcast. ClipMind does the same volume before I finish my coffee, and the clips it picks outperform the ones we chose by hand.",
    name: "Maya Chen",
    role: "Head of Content",
    company: "Northwind Studio",
    accent: "#7c5cff",
    metric: "12h → 20min per episode",
  },
  {
    id: "t2",
    quote:
      "The virality score is uncannily good. Our top three Reels this quarter were all ranked in the top five by the model before a human ever watched them.",
    name: "Daniel Okafor",
    role: "Founder",
    company: "Signal & Noise",
    accent: "#22d3ee",
    metric: "3.4× reach in 90 days",
  },
  {
    id: "t3",
    quote:
      "Auto reframe with face tracking is the feature I did not know I needed. Two-camera interviews come out looking like they were shot vertical.",
    name: "Priya Raman",
    role: "Creative Director",
    company: "Fieldnote Media",
    accent: "#ec4899",
    metric: "1,900 clips shipped",
  },
  {
    id: "t4",
    quote:
      "We publish in five languages. Translated captions used to be a two-day loop with an agency — now it is part of the same export.",
    name: "Lukas Bauer",
    role: "Growth Lead",
    company: "Hemisphere",
    accent: "#f59e0b",
    metric: "5 markets, one workflow",
  },
  {
    id: "t5",
    quote:
      "I run a one-person channel. ClipMind is the difference between posting twice a month and posting every weekday.",
    name: "Sofia Marino",
    role: "Creator",
    company: "The Long Game",
    accent: "#34d399",
    metric: "18 → 92 posts / quarter",
  },
  {
    id: "t6",
    quote:
      "Rendering speed is the quiet superpower. A webinar lands at 4pm and the whole clip set is in Slack before the team stands up.",
    name: "Tomás Herrera",
    role: "VP Marketing",
    company: "Loop Analytics",
    accent: "#38bdf8",
    metric: "under 6 min end to end",
  },
];

export interface SocialProof {
  label: string;
  /** Numeric target so the value can be animated accurately. */
  value: number;
  decimals: number;
  /** Appended after the animated number, e.g. `M`, `K`, `/5`, `+`. */
  suffix: string;
  /** Static rendering for contexts that do not animate. */
  display: string;
}

export const socialProof: SocialProof[] = [
  { label: "Clips generated", value: 14.2, decimals: 1, suffix: "M", display: "14.2M" },
  { label: "Hours processed", value: 620, decimals: 0, suffix: "K", display: "620K" },
  { label: "Average rating", value: 4.9, decimals: 1, suffix: "/5", display: "4.9/5" },
  { label: "Creator teams", value: 38_000, decimals: 0, suffix: "+", display: "38,000+" },
];

export const trustedBy: string[] = [
  "Northwind",
  "Signal & Noise",
  "Fieldnote",
  "Hemisphere",
  "Loop Analytics",
  "Bright Harbor",
  "Kalego",
  "Overtone",
];
