"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/forms/form-field";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { useZodForm } from "@/hooks/use-zod-form";
import { api } from "@/lib/api-client";
import { CONTACT_TOPICS, contactSchema, type ContactInput } from "@/lib/validations/contact";
import type { ContactReceipt } from "@/server/services/contact-service";

const INITIAL_VALUES: ContactInput = {
  name: "",
  email: "",
  company: "",
  topic: "Sales & pricing",
  message: "",
};

/** Contact form wired to `POST /api/contact` with shared Zod validation. */
export function ContactForm() {
  const [receipt, setReceipt] = useState<ContactReceipt | null>(null);

  const form = useZodForm<ContactInput, ContactInput>({
    schema: contactSchema,
    initialValues: INITIAL_VALUES,
    onSubmit: async (values) => {
      const result = await api.post<ContactReceipt>(routes.api.contact, values);
      setReceipt(result);
      form.reset();
      toast.success("Message sent", {
        description: `We reply within ${result.responseWindowHours} business hours.`,
      });
    },
  });

  if (receipt) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/20 bg-success/[0.06] px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-success/15 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-semibold">Message received</h3>
          <p className="mx-auto max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
            Reference <span className="font-mono text-foreground">{receipt.id}</span>. Our team
            replies within {receipt.responseWindowHours} business hours.
          </p>
        </div>
        <Button variant="outline" onClick={() => setReceipt(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="name" label="Full name" error={form.errors.name}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Alex Rivera"
            invalid={Boolean(form.errors.name)}
            {...form.fieldProps("name")}
          />
        </FormField>

        <FormField id="email" label="Work email" error={form.errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="alex@company.com"
            invalid={Boolean(form.errors.email)}
            {...form.fieldProps("email")}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="company" label="Company" hint="Optional" error={form.errors.company}>
          <Input
            id="company"
            autoComplete="organization"
            placeholder="Northwind Studio"
            invalid={Boolean(form.errors.company)}
            {...form.fieldProps("company")}
          />
        </FormField>

        <FormField id="topic" label="Topic" error={form.errors.topic}>
          <Select
            value={form.values.topic}
            onValueChange={(value) => form.setValue("topic", value as ContactInput["topic"])}
          >
            <SelectTrigger id="topic" invalid={Boolean(form.errors.topic)}>
              <SelectValue placeholder="Pick a topic" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_TOPICS.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        id="message"
        label="How can we help?"
        hint={`${form.values.message.length}/2000`}
        error={form.errors.message}
      >
        <Textarea
          id="message"
          rows={6}
          maxLength={2000}
          placeholder="Tell us about your content volume, the platforms you publish to, and what you are trying to automate."
          invalid={Boolean(form.errors.message)}
          {...form.fieldProps("message")}
        />
      </FormField>

      <FormError message={form.formError} />

      <Button type="submit" variant="gradient" size="lg" loading={form.isSubmitting} icon={<Send />}>
        Send message
      </Button>

      <p className="text-center text-[12px] text-muted-foreground">
        By submitting this form you agree to our{" "}
        <a href={routes.privacy} className="text-foreground underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
