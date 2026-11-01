import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { Button } from "@/components/ui";
import type { Office, Phone } from "@/lib/site-config";
import type { PublicPrice } from "@/lib/content/prices";
import type { TeamMember } from "@/lib/content/staff";
import { ImageOrPattern } from "./ImageOrPattern";
import { PageTitle, proseClasses } from "./content-parts";
import { cardGrid, InfoCard, Section, SectionHeading } from "./parts";

const home = { label: "Home", href: "/" };

const reasons = [
  ["Purpose", "To break down the barriers to international education and travel, so people can reach their full potential."],
  ["Vision", "To be the leading consultancy in international education and travel, known for transforming lives through global learning."],
  ["Mission", "To guide people through the complexities of education and travel abroad with expert advice and personal support."],
];

const values = [
  ["Integrity", "Honest advice, even when it isn’t what you hoped to hear. No guarantees we can’t keep."],
  ["Excellence", "Complete, accurate applications, checked before they leave our hands."],
  ["Client-centred", "Plans built around your goals, budget and timeline."],
  ["Inclusivity", "Free answers every weekday, so advice isn’t only for those who can pay."],
  ["Innovation", "Online forms, live sessions and clear tools that save you time."],
];

export function AboutPage({
  team,
  offices,
  officeHours,
}: {
  team: TeamMember[];
  offices: Office[];
  officeHours: string;
}) {
  return (
    <>
      <PageTitle
        crumbs={[home, { label: "About us" }]}
        title="Making impact through education and travels."
        lead="ErnestLinks Consult is a Kumasi consultancy that helps students, young professionals and families reach opportunities abroad, with clear steps and honest advice."
      />
      <Section>
        <SectionHeading eyebrow="Our story" title="It started at the KNUST gate." />
        <div className="flex max-w-180 flex-col gap-space-3">
          <p>
            ErnestLinks Consult began as a simple idea: make global education and
            travel reachable for everyone. We started by helping KNUST students
            through passport and visa processes.
          </p>
          <p>
            Today we run passport drives with KNUST colleges, guide students
            through school and visa applications, prepare people for proficiency
            exams, and plan travel. We work from two offices in Kumasi and answer
            questions live on TikTok every weekday.
          </p>
        </div>
      </Section>
      <Section tone="tint">
        <SectionHeading title="Why we exist" />
        <div className={cardGrid}>
          {reasons.map(([title, text]) => (
            <InfoCard key={title} title={title}>
              {text}
            </InfoCard>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeading title="Our values" />
        <div className={cardGrid}>
          {values.map(([title, text]) => (
            <InfoCard key={title} title={title} tone="tint">
              {text}
            </InfoCard>
          ))}
        </div>
      </Section>
      {team.length > 0 && (
        <Section tone="tint" id="team">
          <SectionHeading eyebrow="Our team" title="One team, one goal: getting you there." />
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-space-4">
            {team.map((member) => (
              <li key={member.id} className="flex flex-col gap-1">
                <ImageOrPattern
                  path={member.photoPath}
                  alt={member.fullName}
                  className="aspect-4/5 rounded-lg"
                  sizes="220px"
                />
                <strong>{member.fullName}</strong>
                <span className="text-body-sm text-ink-muted">{member.title}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Section>
        <SectionHeading title="Come and see us" />
        <ul className="flex flex-col gap-1">
          {offices.map((office) => (
            <li key={office.name}>
              <strong>{office.name}</strong>: {office.address}
            </li>
          ))}
        </ul>
        <p className="text-ink-muted">{officeHours}</p>
        <div className="flex flex-wrap gap-space-3">
          <Button href="/start">Start online</Button>
          <Button href="/contact" variant="secondary">
            Contact &amp; directions
          </Button>
        </div>
      </Section>
    </>
  );
}

export function ContactPage({
  whatsappHref,
  phones,
  hotline,
  email,
  offices,
  officeHours,
  replyPromise,
  liveUrl,
  liveNote,
  bookingUrl,
  ceoHours,
  consultations,
  privacyHref,
}: {
  whatsappHref: string;
  phones: Phone[];
  hotline: Phone;
  email: string | null;
  offices: Office[];
  officeHours: string;
  replyPromise: string | null;
  liveUrl: string;
  liveNote: string;
  bookingUrl: string;
  ceoHours: string;
  consultations: PublicPrice[];
  privacyHref: string;
}) {
  const [main, second] = phones;
  const channel =
    "flex flex-col gap-space-2 rounded-lg border border-line bg-blue-tint p-space-5 text-ink no-underline";

  return (
    <>
      <PageTitle
        crumbs={[home, { label: "Contact" }]}
        title="Talk to us, your way."
        lead={`Start online, message, call or walk in.${
          replyPromise ? ` A real person replies ${replyPromise}.` : ""
        }`}
      >
        <Button href="/start" className="self-start">
          Start online
        </Button>
      </PageTitle>

      <Section>
        <h2 className="text-h2">Ways to reach us</h2>
        <ul className={cardGrid}>
          <li>
            <a href={whatsappHref} className={channel}>
              <strong className="text-h4">WhatsApp</strong>
              <span className="text-ink-muted">{main.display}</span>
              <span className="font-bold text-blue">Send a message →</span>
            </a>
          </li>
          {second && (
            <li>
              <a href={`tel:${second.tel}`} className={channel}>
                <strong className="text-h4">Second line</strong>
                <span className="text-ink-muted">{second.display}</span>
                <span className="font-bold text-blue">Call now →</span>
              </a>
            </li>
          )}
          <li>
            <a href={`tel:${hotline.tel}`} className={channel}>
              <strong className="text-h4">Hotline</strong>
              <span className="text-ink-muted">{hotline.display}</span>
              <span className="font-bold text-blue">Call now →</span>
            </a>
          </li>
          {email && (
            <li>
              <a href={`mailto:${email}`} className={channel}>
                <strong className="text-h4">Email</strong>
                <span className="break-words text-ink-muted">{email}</span>
                <span className="font-bold text-blue">Write to us →</span>
              </a>
            </li>
          )}
        </ul>
      </Section>

      <Section tone="tint" id="offices">
        <h2 className="text-h2">Our offices in Kumasi</h2>
        <ul className={cardGrid}>
          {offices.map((office) => (
            <li key={office.name} className="flex flex-col gap-1 rounded-lg bg-surface p-space-5">
              <h3 className="text-h4">{office.name}</h3>
              <span className="text-ink-muted">{office.address}</span>
              <span className="text-ink-muted">{officeHours}</span>
              <a
                href={office.mapUrl}
                target="_blank"
                rel="noopener"
                aria-label={`Get directions to ${office.name} (opens in a new tab)`}
                className="inline-flex min-h-11 items-center font-bold"
              >
                Get directions
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="message">
        <div className="flex flex-wrap items-start gap-space-6">
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-space-3">
            <h2 className="text-h2">Send a general message</h2>
            <p className="text-ink-muted">
              For partnerships, passport drives, media or anything else. To start
              a service, the <a href="/start">Start online</a> form is faster.
            </p>
            <div className="flex flex-col gap-space-2 rounded-lg bg-blue-tint p-space-4">
              <h3 className="text-h4">Other ways to get help</h3>
              <p className="text-body-sm text-ink-muted">
                Free Q&amp;A: <a href={liveUrl}>{liveNote}</a>.
              </p>
              <p className="text-body-sm text-ink-muted">
                One-on-one with our CEO
                {consultations.length > 0 &&
                  `: ${consultations
                    .map((price) => `${price.amount} / ${price.timeText}`)
                    .join(" or ")}`}
                . {ceoHours}. <Link href={bookingUrl}>Book a slot</Link>
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-[2_1_380px]">
            <ContactForm privacyHref={privacyHref} />
          </div>
        </div>
      </Section>
    </>
  );
}

export function LegalPage({
  title,
  html,
  whatsappHref,
}: {
  title: string;
  /** Null until ELC supplies the text. */
  html: string | null;
  whatsappHref: string;
}) {
  return (
    <>
      <PageTitle crumbs={[home, { label: title }]} title={title} />
      <Section>
        {html ? (
          <div className={proseClasses} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="flex max-w-180 flex-col items-start gap-space-3">
            <p>
              We&apos;re finalising this page. If you need this information now,
              message us and we&apos;ll send it to you.
            </p>
            <Button href={whatsappHref}>WhatsApp us</Button>
          </div>
        )}
      </Section>
    </>
  );
}
