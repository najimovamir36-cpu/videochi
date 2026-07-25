import { createId } from "@/lib/utils";
import { prisma } from "@/server/db/client";
import { ensureSeeded } from "@/server/db/seed";
import type { ContactInput } from "@/lib/validations/contact";

export interface ContactReceipt {
  id: string;
  receivedAt: string;
  /** Business-hours SLA promised back to the user. */
  responseWindowHours: number;
}

/**
 * Persists inbound contact requests. When a mail transport is added, this is
 * the only place that needs to change.
 */
export const contactService = {
  async submit(input: ContactInput): Promise<ContactReceipt> {
    await ensureSeeded();

    const id = createId("msg");
    const record = await prisma.contactMessage.create({
      data: {
        id,
        name: input.name,
        email: input.email,
        company: input.company ?? "",
        topic: input.topic,
        message: input.message,
      },
    });
    const receivedAt = record.receivedAt.toISOString();

    const responseWindowHours = input.topic === "Technical support" ? 4 : 24;
    return { id, receivedAt, responseWindowHours };
  },
};
