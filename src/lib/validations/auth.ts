import { z } from "zod";

export const passphraseSchema = z.object({
  passphrase: z.string().min(1, "Enter the passphrase"),
});

export type PassphraseInput = z.infer<typeof passphraseSchema>;
