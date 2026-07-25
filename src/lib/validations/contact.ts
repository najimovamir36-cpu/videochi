import { z } from "zod";

export const CONTACT_TOPICS = [
  "Sales & pricing",
  "Technical support",
  "Partnerships",
  "Press & media",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(64, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  company: z.string().trim().max(80, "Company name is too long").optional().or(z.literal("")),
  topic: z.enum(CONTACT_TOPICS, { errorMap: () => ({ message: "Pick a topic" }) }),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters")
    .max(2000, "Keep it under 2000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];
