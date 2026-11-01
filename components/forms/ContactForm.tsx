"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { sendContactMessage } from "@/app/(site)/actions";
import { Button, Field, Select } from "@/components/ui";
import {
  contactSchema,
  contactTopics,
  type ContactInput,
} from "@/lib/forms/contact";
import { saveFailedMessage } from "@/lib/leads/results";
import { Honeypot } from "./Honeypot";

export type ContactFormProps = {
  privacyHref: string;
};

type Values = ContactInput & { website?: string };

export function ContactForm({ privacyHref }: ContactFormProps) {
  const consentErrorId = useId();
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    getValues,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(contactSchema) as unknown as Resolver<Values>,
    defaultValues: {
      full_name: "",
      whatsapp: "",
      email: "",
      topic: "",
      message: "",
      consent: false,
      website: "",
    },
  });

  async function onSubmit() {
    setFailure(null);

    try {
      const result = await sendContactMessage(getValues());

      if (result.status === "ok") {
        setSent(true);
        reset();
      } else if (result.status === "invalid") {
        Object.entries(result.errors).forEach(([key, message]) =>
          setError(key as keyof Values, { message }),
        );
      } else {
        setFailure(result.message);
      }
    } catch {
      setFailure(saveFailedMessage);
    }
  }

  return (
    <form
      noValidate
      aria-label="Send us a message"
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4"
    >
      <Honeypot {...register("website")} />
      <Field
        label="Full name"
        required
        autoComplete="name"
        error={errors.full_name?.message}
        {...register("full_name")}
      />
      <Field
        label="WhatsApp number"
        type="tel"
        required
        autoComplete="tel"
        error={errors.whatsapp?.message}
        {...register("whatsapp")}
      />
      <Field
        label="Email"
        type="email"
        optional
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Controller
        control={control}
        name="topic"
        render={({ field }) => (
          <Select
            ref={field.ref}
            label="Topic"
            required
            placeholder="Choose…"
            options={contactTopics.map((topic) => ({
              value: topic,
              label: topic,
            }))}
            value={field.value || undefined}
            onValueChange={field.onChange}
            error={errors.topic?.message}
          />
        )}
      />
      <Field
        multiline
        rows={5}
        label="Message"
        required
        className="col-span-full"
        error={errors.message?.message}
        {...register("message")}
      />
      <div className="col-span-full flex flex-col gap-1">
        <label className="flex min-h-11 items-start gap-3">
          <input
            type="checkbox"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? consentErrorId : undefined}
            className="mt-0.5 size-5.5 shrink-0 accent-blue"
            {...register("consent")}
          />
          <span>
            I agree that ErnestLinks Consult may contact me about this message.
          </span>
        </label>
        <Link
          href={privacyHref}
          className="inline-flex min-h-11 items-center self-start pl-8.5"
        >
          Privacy notice
        </Link>
        {errors.consent && (
          <span
            id={consentErrorId}
            role="alert"
            className="text-body-sm font-bold text-red-text"
          >
            {errors.consent.message}
          </span>
        )}
      </div>
      <div className="col-span-full flex flex-col items-start gap-3">
        <Button type="submit" loading={isSubmitting} loadingText="Sending…">
          Send message
        </Button>
        {failure && (
          <p role="alert" className="font-bold text-red-text">
            {failure}
          </p>
        )}
        {sent && (
          <p role="status" className="font-bold text-success">
            Thanks. Your message has reached our team.
          </p>
        )}
      </div>
    </form>
  );
}
