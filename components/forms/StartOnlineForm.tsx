"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useForm, type Control, type Resolver } from "react-hook-form";
import {
  finishLater,
  recordFormOpen,
  submitStep,
} from "@/app/(site)/start/actions";
import { Button, Stepper } from "@/components/ui";
import { serviceForms, type ServiceKey } from "@/lib/forms";
import { isInputField, type ServiceForm, type Step } from "@/lib/forms/types";
import {
  saveFailedMessage,
  type Attribution,
  type StepResult,
  type StepValues,
} from "@/lib/leads/results";
import { Honeypot } from "./Honeypot";
import { SavedBanner } from "./SavedBanner";
import { fieldId, StepRenderer } from "./StepRenderer";
import { ThankYou } from "./ThankYou";

export type StartOnlineFormProps = {
  service: ServiceKey;
  priceLabels: Record<string, string>;
  privacyHref: string;
  whatsappNumber: string;
};

const attributionKey = "elc-attribution";

/** First load of the visit wins, so moving between tabs keeps the real source. */
function readAttribution(): Attribution {
  const stored = sessionStorage.getItem(attributionKey);
  if (stored) return JSON.parse(stored) as Attribution;

  const query = new URLSearchParams(location.search);
  let referrer: URL | null = null;
  try {
    referrer = document.referrer ? new URL(document.referrer) : null;
  } catch {
    referrer = null;
  }
  const internal = referrer?.origin === location.origin;

  const attribution: Attribution = {
    source_page: internal ? referrer!.pathname : location.pathname,
    referrer: referrer && !internal ? referrer.href : undefined,
    utm_source: query.get("utm_source") ?? undefined,
    utm_medium: query.get("utm_medium") ?? undefined,
    utm_campaign: query.get("utm_campaign") ?? undefined,
  };
  sessionStorage.setItem(attributionKey, JSON.stringify(attribution));
  return attribution;
}

function defaultsFor(step: Step, saved?: StepValues): StepValues {
  const defaults: StepValues = {};

  for (const field of step.fields.filter(isInputField)) {
    if (field.kind === "checkboxes") defaults[field.key] = [];
    else if (field.kind === "tick") defaults[field.key] = false;
    else defaults[field.key] = "";
  }

  return { ...defaults, ...saved };
}

const doneUrl = (ref: string | null) =>
  ref ? `/start/done?ref=${encodeURIComponent(ref)}` : "/start/done";

function ErrorSummary({
  stepKey,
  errors,
  labels,
}: {
  stepKey: string;
  errors: Record<string, string>;
  labels: Record<string, string>;
}) {
  const keys = Object.keys(errors);
  if (keys.length < 2) return null;

  return (
    <div
      role="alert"
      className="flex flex-col gap-space-2 rounded-md bg-red-tint px-space-4 py-3.5"
    >
      <h3 className="text-body font-bold">Please check {keys.length} answers</h3>
      <ul className="list-disc pl-5 text-body-sm">
        {keys.map((key) => (
          <li key={key}>
            <a href={`#${fieldId(stepKey, key)}`}>{labels[key] ?? key}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type StepFormProps = Omit<StartOnlineFormProps, "service"> & {
  form: ServiceForm;
  stepIndex: number;
  initial?: StepValues;
  attribution: Attribution;
  sessionId: string;
  showSaved: boolean;
  onSaved: (values: StepValues) => void;
  onBack: (values: StepValues) => void;
};

function StepForm({
  form,
  stepIndex,
  initial,
  attribution,
  sessionId,
  showSaved,
  onSaved,
  onBack,
  priceLabels,
  privacyHref,
  whatsappNumber,
}: StepFormProps) {
  const router = useRouter();
  const step = form.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === form.steps.length - 1;

  // Only runs when the browser posts the form itself, without JavaScript.
  const [posted, postAction] = useActionState<StepResult, FormData>(
    submitStep,
    { status: "idle" },
  );

  const methods = useForm<StepValues>({
    resolver: zodResolver(step.schema as never) as Resolver<StepValues>,
    defaultValues: defaultsFor(
      step,
      posted.status === "invalid" || posted.status === "error"
        ? posted.values
        : initial,
    ),
  });
  const honeypot = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    posted.status === "error" ? posted.message : null,
  );

  const { errors: clientErrors } = methods.formState;
  const serverErrors = posted.status === "invalid" ? posted.errors : undefined;
  const errors: Record<string, string> = { ...serverErrors };
  for (const [key, error] of Object.entries(clientErrors)) {
    errors[key] = String(error?.message);
  }
  const labels = Object.fromEntries(
    step.fields.filter(isInputField).map((field) => [field.key, field.label]),
  );

  async function save() {
    setMessage(null);
    setSaving(true);
    const values = methods.getValues();

    try {
      const result = await submitStep(
        { status: "idle" },
        {
          service: form.service,
          stepIndex,
          values,
          attribution,
          sessionId,
          website: honeypot.current?.value,
        },
      );

      if (result.status === "saved") {
        onSaved(values);
      } else if (result.status === "finished") {
        router.push(doneUrl(result.ref));
      } else if (result.status === "invalid") {
        Object.entries(result.errors).forEach(([key, text], index) =>
          methods.setError(key, { message: text }, { shouldFocus: index === 0 }),
        );
      } else if (result.status === "error") {
        setMessage(result.message);
      }
    } catch {
      setMessage(saveFailedMessage);
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    setMessage(null);
    setSaving(true);

    try {
      const { ref } = await finishLater();
      router.push(doneUrl(ref));
    } catch {
      setMessage(saveFailedMessage);
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void methods.handleSubmit(save)(event);
  }

  if (posted.status === "finished") {
    return (
      <ThankYou
        whatsappNumber={whatsappNumber}
        ref_={posted.ref}
        ownerFirstName={posted.thankYou?.ownerFirstName}
        replyPromise={posted.thankYou?.replyPromise}
        nextSteps={posted.thankYou?.nextSteps}
      />
    );
  }

  return (
    <>
      <div className="border-b border-line px-7 py-6">
        <Stepper
          title={form.name}
          note={form.timeHint}
          steps={form.steps.map((item) => item.title)}
          current={stepIndex}
          className="max-w-none"
        />
      </div>

      <form
        action={postAction}
        onSubmit={handleSubmit}
        noValidate
        aria-label={`${form.name}: ${step.title}`}
        className="flex flex-col gap-5.5 p-7"
      >
        <input type="hidden" name="service" value={form.service} />
        <input type="hidden" name="step_index" value={stepIndex} />
        {Object.entries(attribution).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value ?? ""} />
        ))}
        <Honeypot ref={honeypot} />

        {showSaved && <SavedBanner />}

        <div className="flex flex-col gap-1.5">
          <h2 className="text-h3">{step.title}</h2>
          {step.intro && <p className="text-ink-muted">{step.intro}</p>}
        </div>

        <ErrorSummary stepKey={step.key} errors={errors} labels={labels} />

        <StepRenderer
          stepKey={step.key}
          fields={step.fields}
          control={methods.control as unknown as Control}
          serverErrors={serverErrors}
          priceLabels={priceLabels}
          privacyHref={privacyHref}
        />

        {message && (
          <p role="alert" className="font-bold text-red-text">
            {message}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5.5">
          {isFirst ? (
            <span className="text-body-sm text-ink-muted">
              Takes about 30 seconds.
            </span>
          ) : (
            <Button
              variant="secondary"
              onClick={() => onBack(methods.getValues())}
            >
              Back
            </Button>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {!isFirst && !isLast && (
              <Button variant="ghost" onClick={() => void finish()}>
                Finish later, just contact me
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              loading={saving}
              loadingText="Saving…"
            >
              {isFirst
                ? "Save and continue"
                : isLast
                  ? "Send my application"
                  : "Continue"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

export function StartOnlineForm({ service, ...rest }: StartOnlineFormProps) {
  const form = serviceForms[service];
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StepValues>>({});
  const [saved, setSaved] = useState(false);
  const [visit, setVisit] = useState<{
    attribution: Attribution;
    sessionId: string;
  }>({ attribution: {}, sessionId: "" });

  useEffect(() => {
    const sessionId = crypto.randomUUID();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage and the URL exist only in the browser
    setVisit({ attribution: readAttribution(), sessionId });
    void recordFormOpen(service, sessionId).catch(() => {});
  }, [service]);

  function keep(values: StepValues) {
    setAnswers((current) => ({ ...current, [stepIndex]: values }));
  }

  return (
    <div className="min-w-0 flex-[999_1_600px] overflow-hidden rounded-xl border border-line bg-surface">
      <StepForm
        {...rest}
        key={stepIndex}
        form={form}
        stepIndex={stepIndex}
        initial={answers[stepIndex]}
        attribution={visit.attribution}
        sessionId={visit.sessionId}
        showSaved={saved && stepIndex > 0}
        onSaved={(values) => {
          keep(values);
          setSaved(true);
          setStepIndex(stepIndex + 1);
        }}
        onBack={(values) => {
          keep(values);
          setStepIndex(stepIndex - 1);
        }}
      />
    </div>
  );
}
