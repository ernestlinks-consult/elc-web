"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { subscribeToAlerts } from "@/app/(site)/actions";
import { Button, Field } from "@/components/ui";
import { alertsSchema, type AlertsInput } from "@/lib/forms/alerts";
import { saveFailedMessage } from "@/lib/leads/results";
import { Honeypot } from "./Honeypot";

export type AlertsSignupProps = {
  privacyHref: string;
  /** A page and the footer can both show this form, so they need different names. */
  heading?: string;
};

type Values = AlertsInput & { website?: string };

export function AlertsSignup({
  privacyHref,
  heading = "Get Scholarship Hunt alerts",
}: AlertsSignupProps) {
  const headingId = useId();
  const consentErrorId = useId();
  const [subscribed, setSubscribed] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(alertsSchema) as unknown as Resolver<Values>,
    defaultValues: { whatsapp: "", consent: false, website: "" },
  });

  async function onSubmit() {
    setFailure(null);

    try {
      const result = await subscribeToAlerts(getValues());

      if (result.status === "ok") {
        setSubscribed(true);
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
      aria-labelledby={headingId}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-w-0 flex-col gap-2.5 phone:col-span-2"
    >
      <Honeypot {...register("website")} />
      <h2 id={headingId} className="text-eyebrow text-on-blue">
        {heading}
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
      <Button
        type="submit"
        variant="red"
        className="self-start"
        loading={isSubmitting}
        loadingText="Saving…"
      >
        Subscribe
      </Button>
      {failure && (
        <p role="alert" className="font-bold text-on-blue">
          {failure}
        </p>
      )}
      {subscribed && (
        <p role="status" className="font-bold text-on-blue">
          You’re on the list. Reply STOP anytime to leave it.
        </p>
      )}
    </form>
  );
}
