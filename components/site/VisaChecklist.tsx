"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";

export const readinessItems = [
  ["A valid passport", "Valid well beyond your planned stay."],
  ["An offer or admission letter", "For example a CAS (UK), I-20 (USA) or letter of acceptance (Canada)."],
  ["Proof of funds", "Tuition plus living costs, in your name or your sponsor’s."],
  ["Academic documents", "Transcripts and certificates the school accepted you on."],
  ["English test result or waiver", "IELTS, TOEFL or the school’s written waiver."],
  ["A clear plan for after your studies", "How the course fits your career, and your ties to home."],
] as const;

export function readinessVerdict(done: number) {
  if (done === readinessItems.length) return "You look ready. Let’s check the details.";
  if (done >= 4) return "Nearly there. We can help with the rest.";
  if (done >= 1) return "A good start. We’ll help you build the rest.";
  return "Tick what you already have.";
}

const noSubscribe = () => () => {};

/** Without JavaScript this is a plain list; the live count appears once it can work. */
export function VisaChecklist({ startHref }: { startHref: string }) {
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [ticked, setTicked] = useState<number[]>([]);

  function toggle(index: number) {
    setTicked((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-space-5">
      <ul className="flex min-w-0 flex-[2_1_380px] flex-col gap-space-2">
        {readinessItems.map(([title, detail], index) => (
          <li key={title}>
            <label className="flex cursor-pointer items-start gap-3.5 rounded-md border border-line bg-surface p-space-4 has-[:checked]:bg-blue-tint">
              <input
                type="checkbox"
                checked={ticked.includes(index)}
                onChange={() => toggle(index)}
                className="mt-0.5 size-5.5 shrink-0 accent-blue"
              />
              <span className="flex flex-col">
                <strong>{title}</strong>
                <span className="text-body-sm text-ink-muted">{detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-space-3 rounded-lg bg-blue p-space-5 text-on-blue">
        {hydrated && (
          <div aria-live="polite" className="flex flex-col gap-1">
            <span className="text-on-blue-muted">You have</span>
            <strong data-testid="readiness-count" className="text-h2">
              {ticked.length} of {readinessItems.length}
            </strong>
            <span>{readinessVerdict(ticked.length)}</span>
          </div>
        )}
        <Button href={startHref} variant="on-blue">
          Start your visa online
        </Button>
      </div>
    </div>
  );
}
