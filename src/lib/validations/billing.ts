import { z } from "zod";

/** Validates a request to start a checkout for a paid plan. */
export const checkoutSchema = z.object({
  plan: z.enum(["creator", "studio"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
