import type { Phone } from "@/lib/site-config";

export type LaterPanelProps = {
  later: string[];
  /** Null while ELC's reply-time promise is a placeholder. */
  replyPromise: string | null;
  whatsappHref: string;
  phone: Phone;
};

const cardClasses =
  "flex flex-col gap-3 rounded-xl border border-line bg-surface p-6.5";

const linkClasses = "inline-flex min-h-11 items-center font-extrabold";

export function LaterPanel({
  later,
  replyPromise,
  whatsappHref,
  phone,
}: LaterPanelProps) {
  const promises = [
    replyPromise
      ? `A real person replies ${replyPromise}.`
      : "A real person replies to every form.",
    "You pay nothing until you decide to go ahead.",
    "We only ever take payment to ErnestLinks Consult’s official MoMo.",
    "Your details are used only for your application.",
  ];

  return (
    <aside
      aria-label="Why it’s safe"
      className="flex min-w-0 flex-[1_1_300px] flex-col gap-space-4"
    >
      <div className="flex flex-col gap-3.5 rounded-xl bg-blue p-6.5 text-on-blue">
        <h2 className="text-h4">No pressure, no payment to start</h2>
        <ul className="flex flex-col gap-3 text-body-sm text-on-blue-muted">
          {promises.map((promise) => (
            <li key={promise} className="flex gap-2.5">
              <span aria-hidden="true" className="font-black text-on-blue">
                ✓
              </span>
              {promise}
            </li>
          ))}
        </ul>
      </div>

      <div className={cardClasses}>
        <h2 className="text-h4">We’ll collect these later, in person or securely</h2>
        <ul className="list-disc pl-5 text-body-sm text-ink-muted">
          {later.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-caption font-normal text-ink-muted">
          We never ask for ID numbers or document copies on this website.
        </p>
      </div>

      <div className={cardClasses}>
        <h2 className="text-body font-bold">Prefer to talk?</h2>
        <a href={whatsappHref} className={linkClasses}>
          WhatsApp {phone.display}
        </a>
        <a href={`tel:${phone.tel}`} className={linkClasses}>
          Call {phone.display}
        </a>
      </div>
    </aside>
  );
}
