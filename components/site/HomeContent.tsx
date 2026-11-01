import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { Badge, Button } from "@/components/ui";
import { CheckIcon } from "@/components/ui/icons";
import type {
  Drive,
  Post,
  Scholarship,
  Testimonial,
  Video,
} from "@/lib/content/listings";
import type { PublicPrice } from "@/lib/content/prices";
import type { TeamMember } from "@/lib/content/staff";
import type { Service } from "@/lib/site-config";
import { ImageOrPattern } from "./ImageOrPattern";
import { VideoEmbed } from "./VideoEmbed";
import {
  cardGrid,
  CheckList,
  monthYear,
  Section,
  SectionHeading,
} from "./parts";

export type HomeData = {
  services: Service[];
  prices: Record<string, PublicPrice>;
  drives: Drive[];
  testimonials: Testimonial[];
  posts: Post[];
  scholarships: Scholarship[];
  video: Video | null;
  team: TeamMember[];
  liveNote: string;
  liveUrl: string;
  hostRotation: string;
  ceoHours: string;
  bookingUrl: string;
  replyPromise: string | null;
  whatsappHref: string;
  whatsappDisplay: string;
  privacyHref: string;
};

const cardCopy: Record<string, { text: string; action: string }> = {
  passport: {
    text: "New, renewal and express passports, biometric birth certificates, and passport drives for associations.",
    action: "See packages →",
  },
  school: {
    text: "Choosing a programme, applying, comparing offers and finding funding in the UK, Canada, USA, Germany, Malta and Ireland.",
    action: "See how it works →",
  },
  visa: {
    text: "Study, work and tourist visas: forms, financial documents, VFS appointments and interview practice.",
    action: "Check your readiness →",
  },
  work: {
    text: "Openings and bridging programmes we have checked. No job guarantees, ever.",
    action: "See current openings →",
  },
  exams: {
    text: "Registration and tuition for IELTS, TOEFL, SAT, GRE and GMAT.",
    action: "Registration & tuition →",
  },
  travel: {
    text: "Flights, hotels, conferences and tourist trips.",
    action: "Plan a trip →",
  },
};

function Hero({
  data: { prices, drives, liveNote, liveUrl, replyPromise, whatsappHref },
}: {
  data: HomeData;
}) {
  const standard = prices.passport_standard;
  const trust = [
    "No payment to start",
    replyPromise ? `A real person replies ${replyPromise}` : null,
    "Takes under a minute",
  ].filter((item) => item !== null);

  return (
    <section>
      <div className="container flex flex-wrap items-center gap-10 py-12 phone:py-16">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-space-4">
          <p className="text-eyebrow text-red-text">
            Kumasi · KNUST Ayeduase Gate &amp; Kotei
          </p>
          <h1 className="text-display">Making opportunities accessible.</h1>
          <p className="text-lead text-ink-muted">
            Passports, exams, school and visa applications, work abroad and
            travel, handled step by step by a Kumasi team you can reach on
            WhatsApp.
          </p>
          <div className="flex flex-wrap gap-space-3">
            <Button href="/start" size="lg">
              Start your application online
            </Button>
            <Button href={whatsappHref} variant="secondary" size="lg">
              Chat on WhatsApp
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-space-4 gap-y-1 text-body-sm text-ink-muted">
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-1">
                <CheckIcon width={16} height={16} className="text-blue" />
                {item}
              </li>
            ))}
          </ul>
          <a href={liveUrl} className="inline-flex min-h-11 items-center gap-space-2 font-bold">
            <Badge tone="red">Live</Badge>
            {liveNote}
          </a>
        </div>

        <ImageOrPattern className="aspect-4/3 min-w-0 flex-[1_1_380px] rounded-xl" priority>
          {standard && (
            <div className="absolute top-5 right-5 flex flex-col rounded-md bg-surface px-space-4 py-3 text-ink shadow-menu">
              <span className="text-body-sm text-ink-muted">Standard passport</span>
              <strong className="text-h3">{standard.amount}</strong>
              {standard.timeText && (
                <span className="text-body-sm text-ink-muted">{standard.timeText}</span>
              )}
            </div>
          )}
          {drives.length > 0 && (
            <div className="absolute bottom-5 left-5 rounded-md bg-surface px-space-4 py-3 font-bold text-ink shadow-menu">
              {drives.length} passport {drives.length === 1 ? "drive" : "drives"}
            </div>
          )}
        </ImageOrPattern>
      </div>
    </section>
  );
}

function ServiceCards({ services, prices }: Pick<HomeData, "services" | "prices">) {
  const cards = services.filter((service) => cardCopy[service.key]);

  return (
    <Section tone="tint" id="services">
      <SectionHeading eyebrow="What we do" title="Six services. One team. One WhatsApp number." />
      <ul className={cardGrid}>
        {cards.map((service) => {
          const copy = cardCopy[service.key];
          const action =
            service.key === "passport" && prices.passport_standard
              ? `From ${prices.passport_standard.amount} →`
              : copy.action;

          return (
            <li key={service.key}>
              <Link
                href={`/services/${service.slug}`}
                className="flex h-full flex-col gap-space-2 rounded-lg border border-line bg-surface p-space-5 text-ink no-underline"
              >
                <strong className="text-h4">{service.name}</strong>
                <span className="text-ink-muted">{copy.text}</span>
                <span className="mt-auto pt-space-1 font-bold text-blue">{action}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function Advice({
  data: { prices, liveNote, liveUrl, hostRotation, ceoHours, bookingUrl },
}: {
  data: HomeData;
}) {
  const consultations = [prices.consultation_30, prices.consultation_60].filter(Boolean);

  return (
    <Section>
      <SectionHeading eyebrow="Get advice" title="Start free on our LIVE. Go deeper with our CEO." />
      <div className={cardGrid}>
        <div className="flex min-w-0 flex-col gap-space-3 rounded-lg bg-blue p-space-5 text-on-blue">
          <span className="text-eyebrow text-on-blue-muted">Free · LIVE</span>
          <h3 className="text-h3">{liveNote}</h3>
          <p className="text-on-blue-muted">
            {hostRotation} answers your questions live and shares updates on
            deadlines, passports and opportunities.
          </p>
          <Button href={liveUrl} variant="on-blue" className="mt-auto self-start">
            Follow @_ernestlinksconsult
          </Button>
        </div>
        <div className="flex min-w-0 flex-col gap-space-3 rounded-lg border border-line bg-surface p-space-5">
          <span className="text-eyebrow text-red-text">One-on-one</span>
          <h3 className="text-h3">A private consultation with our CEO</h3>
          <p className="text-ink-muted">
            For a full plan on your case: your documents, options, timeline and
            next steps.
          </p>
          {consultations.length > 0 && (
            <dl className="flex flex-col gap-1">
              {consultations.map((price) => (
                <div key={price.key} className="flex justify-between gap-space-3">
                  <dt>{price.timeText}</dt>
                  <dd className="font-bold">{price.amount}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-body-sm text-ink-muted">
            {ceoHours}. Pay by MoMo after you pick a slot.
          </p>
          <Button href={bookingUrl} variant="secondary" className="mt-auto self-start">
            Book a slot
          </Button>
        </div>
      </div>
    </Section>
  );
}

const standardFeatures = [
  "Forms and registration",
  "Document check",
  "Vetting and biometric booking",
  "Status tracking to collection",
];

const expressFeatures = [
  "Everything in Standard",
  "Express processing channel",
  "Priority appointments",
  "A dedicated consultant",
];

function Packages({ prices, whatsappHref }: Pick<HomeData, "prices" | "whatsappHref">) {
  const packages = [
    { price: prices.passport_standard, name: "Standard", features: standardFeatures },
    { price: prices.passport_express, name: "Express", features: expressFeatures },
  ].filter(({ price }) => price);

  if (packages.length === 0) return null;

  return (
    <Section tone="tint">
      <SectionHeading
        eyebrow="Passports"
        title="Your passport, without the queue stress."
        intro="We fill your forms, check your documents, book vetting and biometrics, and follow up until collection."
      />
      <div className={cardGrid}>
        {packages.map(({ price, name, features }) => (
          <div
            key={name}
            className="flex min-w-0 flex-col gap-space-3 rounded-lg border border-line bg-surface p-space-5"
          >
            <h3 className="text-h4">{name}</h3>
            <strong className="text-h2">{price.amount}</strong>
            {price.timeText && <p className="text-ink-muted">{price.timeText}</p>}
            <CheckList items={features} />
            <div className="mt-auto flex flex-wrap items-center gap-space-3 pt-space-2">
              <Button href="/start?service=passport">Start online</Button>
              <a href={whatsappHref} className="inline-flex min-h-11 items-center">
                or WhatsApp us
              </a>
            </div>
          </div>
        ))}
      </div>
      <Link href="/services/passports#bring" className="inline-flex min-h-11 items-center font-bold">
        What to bring and how it works →
      </Link>
    </Section>
  );
}

function TrackRecord({ drives, testimonials, whatsappHref }: Pick<HomeData, "drives" | "testimonials" | "whatsappHref">) {
  if (drives.length === 0 && testimonials.length === 0) return null;

  return (
    <Section id="track-record">
      <SectionHeading eyebrow="Track record" title="Trusted by KNUST colleges and associations." />
      {drives.length > 0 && (
        <>
          <ul className={cardGrid}>
            {drives.slice(0, 4).map((drive) => {
              const details = [
                drive.drive_date ? monthYear(drive.drive_date) : null,
                drive.applicants_count !== null
                  ? `${drive.applicants_count} applicants`
                  : null,
              ].filter(Boolean);

              return (
                <li key={drive.id} className="overflow-hidden rounded-lg border border-line">
                  <ImageOrPattern path={drive.photo_path} alt={drive.host_name} className="h-36" />
                  <div className="flex flex-col gap-1 p-space-4">
                    <h3 className="text-h4">{drive.host_name}</h3>
                    {details.length > 0 && (
                      <p className="text-body-sm text-ink-muted">{details.join(" · ")}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <a href={whatsappHref} className="inline-flex min-h-11 items-center font-bold">
            Host a passport drive for your association →
          </a>
        </>
      )}
      {testimonials.length > 0 && (
        <div className={cardGrid} data-testid="testimonials">
          {testimonials.slice(0, 2).map((item) => (
            <figure key={item.id} className="flex min-w-0 flex-col gap-space-3 rounded-lg bg-blue-tint p-space-5">
              <blockquote className="text-lead">“{item.quote}”</blockquote>
              <figcaption className="text-body-sm text-ink-muted">
                {[item.display_name, item.year].filter(Boolean).join(" · ")}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}

function ResourceCard({ eyebrow, title, text, href }: { eyebrow: string; title: string; text: string; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full flex-col gap-1 rounded-lg border border-line bg-surface p-space-4 text-ink no-underline"
      >
        <span className="text-eyebrow text-red-text">{eyebrow}</span>
        <strong className="text-h4">{title}</strong>
        <span className="text-ink-muted">{text}</span>
      </Link>
    </li>
  );
}

function Resources({ posts, scholarships, video }: Pick<HomeData, "posts" | "scholarships" | "video">) {
  const open = scholarships.filter((item) => item.status === "open").length;
  const [post] = posts;

  if (!post && open === 0 && !video) return null;

  return (
    <Section tone="tint" id="resources">
      <SectionHeading eyebrow="Blog & resources" title="Learn before you spend." />
      <ul className={cardGrid}>
        {post && (
          <ResourceCard
            eyebrow="Blog"
            title={post.title}
            text={post.summary ?? "Guides, updates and student stories."}
            href={`/resources/blog/${post.slug}`}
          />
        )}
        {open > 0 && (
          <ResourceCard
            eyebrow="Scholarship Hunt"
            title={`${open} open ${open === 1 ? "scholarship" : "scholarships"}`}
            text="Checked before we post them."
            href="/resources/scholarships"
          />
        )}
      </ul>
      {video && (
        <div className="max-w-120">
          <VideoEmbed
            platform={video.platform}
            url={video.url}
            title={video.title}
            keyword={video.keyword}
            thumbnailUrl={video.thumbnail_url}
          />
        </div>
      )}
      <Link href="/resources" className="inline-flex min-h-11 items-center font-bold">
        All resources →
      </Link>
    </Section>
  );
}

function AboutTeam({ team }: Pick<HomeData, "team">) {
  return (
    <Section id="about">
      <SectionHeading
        eyebrow="About us"
        title="Making impact through education and travels."
        intro="ErnestLinks Consult began by helping KNUST students through passport and visa processes. Today we guide students, professionals and families from Kumasi to opportunities around the world, with clear steps and honest advice."
      />
      <Link href="/about" className="inline-flex min-h-11 items-center font-bold">
        More about us and our team →
      </Link>
      {team.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-space-4">
          {team.map((member) => (
            <li key={member.id} className="flex flex-col gap-1">
              <ImageOrPattern
                path={member.photoPath}
                alt={member.fullName}
                className="aspect-4/5 rounded-lg"
                sizes="200px"
              />
              <strong>{member.fullName}</strong>
              <span className="text-body-sm text-ink-muted">{member.title}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Contact({ whatsappDisplay, privacyHref }: Pick<HomeData, "whatsappDisplay" | "privacyHref">) {
  return (
    <Section tone="tint" id="contact">
      <SectionHeading
        eyebrow="Contact"
        title="Send us a message."
        intro={`Prefer WhatsApp? Message ${whatsappDisplay}.`}
      />
      <p>
        Office details and directions are on our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
      <div className="max-w-180 rounded-lg bg-surface p-space-5">
        <ContactForm privacyHref={privacyHref} />
      </div>
    </Section>
  );
}

export function HomeContent({ data }: { data: HomeData }) {
  return (
    <>
      <Hero data={data} />
      <ServiceCards services={data.services} prices={data.prices} />
      <Advice data={data} />
      <Packages prices={data.prices} whatsappHref={data.whatsappHref} />
      <TrackRecord
        drives={data.drives}
        testimonials={data.testimonials}
        whatsappHref={data.whatsappHref}
      />
      <Resources posts={data.posts} scholarships={data.scholarships} video={data.video} />
      <AboutTeam team={data.team} />
      <Contact whatsappDisplay={data.whatsappDisplay} privacyHref={data.privacyHref} />
    </>
  );
}
