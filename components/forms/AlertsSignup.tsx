"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Field } from "@/components/ui";
import { alertsSchema, type AlertsValues } from "@/lib/forms/alerts";

export type AlertsSignupProps = {
  privacyHref: string;
};

export function AlertsSignup({ privacyHref }: AlertsSignupProps) {
  const headingId = useId();
  const consentErrorId = useId();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlertsValues>({
    resolver: zodResolver(alertsSchema),
    defaultValues: { whatsapp: "", consent: false },
  });

  // TODO(step 5): save to `subscribers` through a server action. Until then
  // nothing is stored or sent anywhere, and the message below says so.
  function onSubmit() {
    setSubmitted(true);
  }

  return (
    <form
      aria-labelledby={headingId}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-w-0 flex-col gap-2.5 phone:col-span-2"
    >
      <h2 id={headingId} className="text-eyebrow text-on-blue">
        Get Scholarship Hunt alerts
      </h2>
      <p>Verified opportunities on WhatsApp. One or two messages a week.</p>
      <Field
        label="WhatsApp number (for example 024 000 0000)"
        type="tel"
        autoComplete="tel"
        surface="deep"
        required
        error={errors.whatsapp?.message}
        {...register("whatsapp")}
      />
      <div className="flex flex-col gap-1">
        <label className="flex min-h-11 items-start gap-space-2 py-space-1 text-on-blue">
          <input
            type="checkbox"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? consentErrorId : undefined}
            className="mt-1 size-5 shrink-0 accent-surface"
            {...register("consent")}
          />
          <span>
            I agree that ErnestLinks Consult may send me Scholarship Hunt alerts
            on WhatsApp. I can stop them anytime by replying STOP.
          </span>
        </label>
        <Link
          href={privacyHref}
          className="inline-flex min-h-11 items-center self-start text-on-blue"
        >
          Privacy notice
        </Link>
        {errors.consent && (
          <span
            id={consentErrorId}
            role="alert"
            className="font-bold text-on-blue"
          >
            {errors.consent.message}
          </span>
        )}
      </div>
      <Button type="submit" variant="red" className="self-start">
        Subscribe
      </Button>
      {submitted && (
        <p role="status" className="font-bold text-on-blue">
          Alerts sign-up isn&apos;t open yet, so your number was not saved.
        </p>
      )}
    </form>
  );
}
