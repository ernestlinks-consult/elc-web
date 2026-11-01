import { Button } from "@/components/ui";
import { CheckIcon } from "@/components/ui/icons";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export type ThankYouProps = {
  whatsappNumber: string;
  /** Null for the generic screen, shown when there is no valid session. */
  ref_?: string | null;
  ownerFirstName?: string | null;
  replyPromise?: string | null;
  nextSteps?: string[];
  headingLevel?: "h1" | "h2";
};

export function ThankYou({
  whatsappNumber,
  ref_: reference,
  ownerFirstName,
  replyPromise,
  nextSteps = [],
  headingLevel: Heading = "h2",
}: ThankYouProps) {
  const who = ownerFirstName ?? "We";
  const when = replyPromise ? ` ${replyPromise}` : "";
  const Subheading = Heading === "h1" ? "h2" : "h3";

  return (
    <div role="status" className="flex flex-col items-start gap-4.5 p-8 phone:px-8 phone:py-12">
      <div className="flex size-16 items-center justify-center rounded-pill bg-blue text-on-blue">
        <CheckIcon width={32} height={32} strokeWidth={2.6} />
      </div>
      <Heading className="text-h2">Thank you. You’re on our list.</Heading>
      <p className="max-w-155 text-lead text-ink-muted">
        {who} will message you on WhatsApp{when}.
        {reference && (
          <>
            {" "}
            Your reference is{" "}
            <strong className="whitespace-nowrap text-ink">{reference}</strong>.
          </>
        )}
      </p>
      {nextSteps.length > 0 && (
        <div className="flex max-w-160 flex-col gap-2.5 rounded-lg bg-blue-tint px-5.5 py-5">
          <Subheading className="text-body font-bold">
            What happens next
          </Subheading>
          <ol className="list-decimal pl-5">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          href={buildWhatsAppLink(whatsappNumber, {
            message: reference ?? "HELLO",
          })}
        >
          Message us now
        </Button>
        <Button href="/start" variant="secondary">
          Start another service
        </Button>
      </div>
    </div>
  );
}
