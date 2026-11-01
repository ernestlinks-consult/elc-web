import Link from "next/link";
import type { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Button } from "@/components/ui";
import { CheckIcon } from "@/components/ui/icons";
import { publicValue } from "@/lib/content/placeholder";
import type { Faq, Opening, Programme, Trip, Video } from "@/lib/content/listings";
import type { Service } from "@/lib/site-config";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "./Breadcrumbs";
import { ImageOrPattern } from "./ImageOrPattern";
import { VideoEmbed } from "./VideoEmbed";

// Shared pieces of the home and service pages. All of them take plain props, so a
// section with nothing to show can be left out by its page.

const zone = "Africa/Accra";

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function monthYear(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function Section({
  id,
  tone = "white",
  children,
}: {
  id?: string;
  tone?: "white" | "tint" | "blue";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24",
        tone === "tint" && "bg-blue-tint",
        tone === "blue" && "bg-blue text-on-blue",
      )}
    >
      <div className="container flex flex-col gap-space-5 py-14 phone:py-18">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  onBlue,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  onBlue?: boolean;
}) {
  return (
    <div className="flex max-w-180 flex-col gap-space-2">
      {eyebrow && (
        <p className={cn("text-eyebrow", onBlue ? "text-on-blue-muted" : "text-red-text")}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-h2">{title}</h2>
      {intro && (
        <p className={cn("text-lead", onBlue ? "text-on-blue-muted" : "text-ink-muted")}>
          {intro}
        </p>
      )}
    </div>
  );
}

export const cardGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-space-4";

export function InfoCard({
  title,
  children,
  eyebrow,
  tone = "light",
}: {
  title: string;
  children?: ReactNode;
  eyebrow?: string;
  tone?: "light" | "tint";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-space-2 rounded-lg p-space-5",
        tone === "light" ? "border border-line bg-surface" : "bg-blue-tint",
      )}
    >
      {eyebrow && <span className="text-eyebrow text-red-text">{eyebrow}</span>}
      <h3 className="text-h4">{title}</h3>
      {children && <div className="text-ink-muted">{children}</div>}
    </div>
  );
}

export function Steps({ items }: { items: [title: string, text: ReactNode][] }) {
  return (
    <ol className={cardGrid}>
      {items.map(([title, text], index) => (
        <li key={title} className="flex min-w-0 flex-col gap-space-1 rounded-lg bg-surface p-space-4">
          <span className="text-eyebrow text-red-text">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-h4">{title}</h3>
          <p className="text-ink-muted">{text}</p>
        </li>
      ))}
    </ol>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-space-2">
      {items.map((item) => (
        <li key={item} className="flex gap-space-2">
          <CheckIcon className="mt-1 shrink-0 text-blue" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type ServiceHeroProps = {
  title: string;
  lead: string;
  crumb: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  trust: ReactNode;
};

export function ServiceHero({ title, lead, crumb, primary, secondary, trust }: ServiceHeroProps) {
  return (
    <section className="bg-blue text-on-blue">
      <div className="container flex flex-col gap-space-4 py-12 phone:py-16">
        <Breadcrumbs
          onBlue
          items={[
            { label: "Home", href: "/" },
            { label: crumb },
          ]}
        />
        <h1 className="max-w-200 text-h1">{title}</h1>
        <p className="max-w-160 text-lead text-on-blue-muted">{lead}</p>
        <div className="flex flex-wrap gap-space-3">
          <Button href={primary.href} variant="on-blue" size="lg">
            {primary.label}
          </Button>
          <Button href={secondary.href} variant="outline-on-blue" size="lg">
            {secondary.label}
          </Button>
        </div>
        <p className="text-body-sm text-on-blue-muted [&_a]:text-on-blue">{trust}</p>
      </div>
    </section>
  );
}

export function PromisePanel({
  title = "Our promise",
  items,
  note,
  action,
}: {
  title?: string;
  items: string[];
  note?: string;
  action?: ReactNode;
}) {
  return (
    <Section tone="blue">
      <h2 className="text-h2">{title}</h2>
      <ul className="flex flex-col gap-space-2 text-lead">
        {items.map((item) => (
          <li key={item} className="flex gap-space-2">
            <CheckIcon className="mt-1.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {note && <p className="text-on-blue-muted">{note}</p>}
      {action}
    </Section>
  );
}

const relatedLinks: Record<string, string[]> = {
  passport: ["school", "visa", "travel"],
  school: ["visa", "exams", "passport"],
  visa: ["school", "work", "travel"],
  work: ["visa", "exams", "passport"],
  exams: ["school", "work", "visa"],
  travel: ["visa", "passport", "school"],
};

export function RelatedServices({
  current,
  services,
}: {
  current: string;
  services: Service[];
}) {
  const related = (relatedLinks[current] ?? [])
    .map((key) => services.find((service) => service.key === key))
    .filter((service) => service !== undefined);

  return (
    <Section tone="tint">
      <h2 className="text-h3">Related services</h2>
      <ul className={cardGrid}>
        {related.map((service) => (
          <li key={service.key}>
            <Link
              href={`/services/${service.slug}`}
              className="flex h-full flex-col gap-1 rounded-lg border border-line bg-surface p-space-4 text-ink no-underline"
            >
              <strong className="text-h4">{service.name}</strong>
              <span className="text-ink-muted">{service.shortDescription}</span>
              <span className="pt-space-1 font-bold text-blue">See how it works →</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ServiceFaqs({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <Section>
      <h2 className="text-h2">Questions</h2>
      <Accordion type="single" collapsible headingLevel={3}>
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

export function VideoGrid({ title, videos }: { title: string; videos: Video[] }) {
  if (videos.length === 0) return null;

  return (
    <Section tone="tint">
      <h2 className="text-h2">{title}</h2>
      <div className={cardGrid}>
        {videos.map((video) => (
          <VideoEmbed
            key={video.id}
            platform={video.platform}
            url={video.url}
            title={video.title}
            keyword={video.keyword}
            thumbnailUrl={video.thumbnail_url}
          />
        ))}
      </div>
    </Section>
  );
}

export function ProgrammeCard({
  programme,
  whatsappLink,
}: {
  programme: Programme;
  whatsappLink: (keyword: string) => string;
}) {
  const eyebrow = [programme.country, programme.city, programme.level, programme.duration_text]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-w-0 flex-col gap-space-2 rounded-lg border border-line bg-surface p-space-5">
      <span className="text-eyebrow text-red-text">{eyebrow}</span>
      <h3 className="text-h4">{programme.title}</h3>
      {programme.tuition_text && <p className="text-ink-muted">{programme.tuition_text}</p>}
      {programme.correct_as_of && (
        <p className="text-body-sm text-ink-muted">
          Correct as of {shortDate(programme.correct_as_of)}
        </p>
      )}
      {programme.keyword && (
        <a href={whatsappLink(programme.keyword)} className="mt-auto inline-flex min-h-11 items-center font-bold">
          WhatsApp &quot;{programme.keyword}&quot;
        </a>
      )}
    </div>
  );
}

export function OpeningCard({
  opening,
  whatsappLink,
}: {
  opening: Opening;
  whatsappLink: (keyword: string) => string;
}) {
  const requirements = publicValue(opening.requirements);
  const costs = publicValue(opening.candidate_costs);

  return (
    <div className="flex min-w-0 flex-col gap-space-2 rounded-lg border border-line bg-surface p-space-5">
      <span className="text-eyebrow text-red-text">
        {[opening.country, opening.sector, "Job openings"].filter(Boolean).join(" · ")}
      </span>
      <h3 className="text-h4">{opening.title}</h3>
      {requirements && <p className="text-ink-muted">{requirements}</p>}
      {costs && <p className="text-ink-muted">What you pay: {costs}</p>}
      {opening.correct_as_of && (
        <p className="text-body-sm text-ink-muted">
          Correct as of {shortDate(opening.correct_as_of)}
        </p>
      )}
      {opening.keyword && (
        <a href={whatsappLink(opening.keyword)} className="mt-auto inline-flex min-h-11 items-center font-bold">
          WhatsApp &quot;{opening.keyword}&quot;
        </a>
      )}
    </div>
  );
}

function tripDates(trip: Trip) {
  if (!trip.starts_on) return null;
  return trip.ends_on
    ? `${shortDate(trip.starts_on)} to ${shortDate(trip.ends_on)}`
    : shortDate(trip.starts_on);
}

export function TripCard({ trip }: { trip: Trip }) {
  const details = [
    tripDates(trip),
    trip.price_from_ghs !== null
      ? `From GH¢${trip.price_from_ghs.toLocaleString("en-GH")}`
      : null,
    trip.seats_left !== null ? `${trip.seats_left} seats left` : null,
  ].filter(Boolean);

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <ImageOrPattern path={trip.photo_path} alt={trip.title} className="h-40" />
      <div className="flex flex-col gap-1 p-space-4">
        <h3 className="text-h4">{trip.title}</h3>
        <p className="text-ink-muted">{trip.destination}</p>
        {details.length > 0 && <p className="text-body-sm text-ink-muted">{details.join(" · ")}</p>}
      </div>
    </div>
  );
}

export function FeatureBadge({ children }: { children: ReactNode }) {
  return <Badge tone="red">{children}</Badge>;
}
