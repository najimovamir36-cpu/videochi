export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "What kind of videos work best?",
    answer:
      "Anything where people talk: podcasts, interviews, webinars, panels, course lessons, sales calls and livestream VODs. The model looks for narrative moments, so a 90-minute conversation typically yields 15–25 strong clips.",
  },
  {
    question: "How long does processing take?",
    answer:
      "About four minutes of processing per hour of source video, then roughly 30 seconds to render each vertical clip. A 60-minute podcast is usually fully exported in under six minutes on the Creator plan.",
  },
  {
    question: "Which formats and resolutions can I upload?",
    answer:
      "MP4, MOV, AVI, MKV and WEBM up to 8 GB per file, at any resolution up to 4K. Uploads are resumable, so a dropped connection continues from where it stopped rather than starting over.",
  },
  {
    question: "Can I edit the clips after they are generated?",
    answer:
      "Yes. Every clip opens in an editor where you can trim the in and out points, restyle captions, change the aspect ratio, swap the hook title and adjust the reframe path frame by frame.",
  },
  {
    question: "How accurate are the captions?",
    answer:
      "Around 99% on clean audio in English, with word-level timing. We support 32 languages for transcription and can generate translated subtitle tracks in the same export pass.",
  },
  {
    question: "Do you train models on my footage?",
    answer:
      "No. Your uploads are used only to produce your clips. They are encrypted at rest, never used for model training, and permanently deleted on request or automatically when your retention window ends.",
  },
  {
    question: "What happens when I run out of minutes?",
    answer:
      "Nothing breaks — your existing projects stay available and you can keep exporting anything already generated. New analysis pauses until the cycle resets, or you can top up minutes at any time.",
  },
  {
    question: "Can I cancel or change plans later?",
    answer:
      "Any time, from Billing in the dashboard. Upgrades apply immediately and are prorated; downgrades take effect at the end of the current period, and there is no cancellation fee.",
  },
];
