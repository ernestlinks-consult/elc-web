import Link from "next/link";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import type {
  Drive,
  Faq,
  Opening,
  Programme,
  Trip,
  Video,
} from "@/lib/content/listings";
import type { PublicPrice } from "@/lib/content/prices";
import type { Service } from "@/lib/site-config";
import {
  cardGrid,
  CheckList,
  InfoCard,
  monthYear,
  OpeningCard,
  ProgrammeCard,
  PromisePanel,
  RelatedServices,
  Section,
  SectionHeading,
  ServiceFaqs,
  ServiceHero,
  Steps,
  TripCard,
  VideoGrid,
} from "./parts";
import { VisaChecklist } from "./VisaChecklist";

/** What every service page gets. */
export type ServiceBase = {
  services: Service[];
  keyword: string;
  whatsappLink: (keyword: string) => string;
  bookingUrl: string;
};

function Trust({ keyword, whatsappLink }: Pick<ServiceBase, "keyword" | "whatsappLink">) {
  return (
    <>
      No payment to start · Prefer to chat?{" "}
      <a href={whatsappLink(keyword)}>WhatsApp &quot;{keyword}&quot;</a>
    </>
  );
}

export function PassportsPage({
  services,
  keyword,
  whatsappLink,
  prices,
  whatToBring,
  drives,
  faqs,
  birthKeyword,
}: ServiceBase & {
  prices: Record<string, PublicPrice>;
  whatToBring: string[];
  drives: Drive[];
  faqs: Faq[];
  birthKeyword: string;
}) {
  const standard = prices.passport_standard;
  const express = prices.passport_express;
  const rows: [string, string | null | undefined, string | null | undefined][] = [
    ["Typical time to passport", standard?.timeText, express?.timeText],
    ["Forms and online registration", "Yes", "Yes"],
    ["Document check before you go", "Yes", "Yes"],
    ["Vetting and biometric booking", "Yes", "Priority slots"],
    ["Status updates to collection", "Yes", "Dedicated consultant"],
  ];

  return (
    <>
      <ServiceHero
        crumb="Passports"
        title="Your passport, done right the first time."
        lead="New passports, renewals, replacements and biometric birth certificates. We handle the forms and bookings and follow up until you collect."
        primary={{ label: "Start online", href: "/start?service=passport" }}
        secondary={{ label: "What to bring", href: "#bring" }}
        trust={<Trust keyword={keyword} whatsappLink={whatsappLink} />}
      />

      {(standard || express) && (
        <Section id="packages">
          <SectionHeading title="Choose your speed" />
          <Table caption="Passport packages" captionHidden>
            <TableHead>
              <TableRow>
                <TableHeaderCell scope="col">What you get</TableHeaderCell>
                {standard && <TableHeaderCell scope="col">Standard · {standard.amount}</TableHeaderCell>}
                {express && <TableHeaderCell scope="col">Express · {express.amount}</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(([label, standardValue, expressValue]) => (
                <TableRow key={label}>
                  <TableCell>{label}</TableCell>
                  {standard && <TableCell>{standardValue ?? "Ask us on WhatsApp"}</TableCell>}
                  {express && <TableCell>{expressValue ?? "Ask us on WhatsApp"}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap gap-space-3">
            <Button href="/start?service=passport">Start online</Button>
          </div>
          <p className="text-body-sm text-ink-muted">
            Final dates depend on the Passport Office. We tell you straight away
            if anything changes.
          </p>
        </Section>
      )}

      <Section tone="tint" id="how-it-works">
        <SectionHeading title="How it works" />
        <Steps
          items={[
            ["Message us", `WhatsApp ${keyword} or walk into either office.`],
            ["Send your documents", "We check them before anything is submitted."],
            ["We register you", "Forms, fees and your vetting booking."],
            ["Biometrics", "You attend; we tell you exactly what to take."],
            ["Collect", "We track it and tell you when it is ready."],
          ]}
        />
      </Section>

      {whatToBring.length > 0 && (
        <Section id="bring">
          <SectionHeading title="What to bring" />
          <CheckList items={whatToBring} />
          <p className="text-body-sm text-ink-muted">
            Requirements are subject to current rules. We confirm the full list
            for your case.
          </p>
        </Section>
      )}

      <Section tone="tint" id="birth">
        <SectionHeading
          title="Biometric birth certificates"
          intro="Many passport applications stall on the birth certificate. We help you get a new biometric certificate, or correct or replace one."
        />
        {prices.birth_certificate && <p className="font-bold">Price: {prices.birth_certificate.amount}</p>}
        <div className="flex flex-wrap gap-space-3">
          <Button href="/start?service=birth">Start online</Button>
          <Button href={whatsappLink(birthKeyword)} variant="secondary">
            WhatsApp &quot;{birthKeyword}&quot;
          </Button>
        </div>
      </Section>

      <Section tone="blue" id="drives">
        <SectionHeading
          onBlue
          eyebrow="For associations and departments"
          title="Bring a passport drive to your members."
          intro="We set up on campus, register everyone in one go and keep each member updated."
        />
        {drives.length > 0 && (
          <div>
            <h3 className="text-h4">Past drives</h3>
            <ul className="text-on-blue-muted">
              {drives.map((drive) => (
                <li key={drive.id}>
                  {drive.host_name}
                  {drive.drive_date ? ` · ${monthYear(drive.drive_date)}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button href={whatsappLink("DRIVE")} variant="on-blue" className="self-start">
          Plan a drive: WhatsApp &quot;DRIVE&quot;
        </Button>
      </Section>

      <ServiceFaqs faqs={faqs} />
      <RelatedServices current="passport" services={services} />
    </>
  );
}

export function SchoolPage({
  services,
  keyword,
  whatsappLink,
  bookingUrl,
  programmes,
  videos,
}: ServiceBase & { programmes: Programme[]; videos: Video[] }) {
  return (
    <>
      <ServiceHero
        crumb="School applications"
        title="From “where should I study?” to an offer letter."
        lead="We help you pick programmes that fit your grades and budget, build a strong application and compare your offers and funding."
        primary={{ label: "Start online", href: "/start?service=school" }}
        secondary={{ label: "Book a 1-on-1 with our CEO", href: bookingUrl }}
        trust={<Trust keyword={keyword} whatsappLink={whatsappLink} />}
      />

      <Section>
        <SectionHeading title="Where we apply" />
        <ul className="flex flex-wrap gap-space-2">
          {["United Kingdom", "Canada", "United States", "Germany", "Malta", "Ireland"].map((country) => (
            <li key={country} className="rounded-pill bg-blue-tint px-space-4 py-space-2 font-bold">
              {country}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="tint" id="journey">
        <SectionHeading eyebrow="The study abroad journey" title="Two stages. This page is stage one." />
        <div className={cardGrid}>
          <InfoCard eyebrow="Stage 1 · You are here" title="School application">
            Shortlist, documents, applications, offers and funding.
          </InfoCard>
          <InfoCard eyebrow="Stage 2" title="Visa application">
            Once you hold an offer: forms, finances, biometrics and interview.{" "}
            <Link href="/services/visa-applications">See visa help →</Link>
          </InfoCard>
        </div>
        <Steps
          items={[
            ["Talk to us", "Ask free on our weekday TikTok LIVE, or book a one-on-one with our CEO."],
            ["Shortlist", "Programmes that fit your grades, budget and career goals."],
            ["Documents kit", "Transcripts, statement of purpose, references, CV, passport, English test."],
            ["Apply", "We submit and follow up with each school."],
            ["Offers and funding", "Compare offers, deposits and scholarships you qualify for."],
          ]}
        />
      </Section>

      {programmes.length > 0 && (
        <Section id="programmes">
          <SectionHeading
            title="Programmes open now"
            intro="Tuition is paid to the school. Send the keyword on WhatsApp for full details."
          />
          <div className={cardGrid}>
            {programmes.map((programme) => (
              <ProgrammeCard key={programme.id} programme={programme} whatsappLink={whatsappLink} />
            ))}
          </div>
        </Section>
      )}

      <VideoGrid title="Watch and learn" videos={videos} />

      <Section>
        <SectionHeading title="What you pay at this stage" />
        <div className={cardGrid}>
          <InfoCard title="The school">
            Any application fee, then tuition and deposit once you accept an offer.
          </InfoCard>
          <InfoCard title="ErnestLinks Consult">
            Our application service fee, agreed in writing before we start.
          </InfoCard>
        </div>
      </Section>

      <PromisePanel
        items={[
          "We never guarantee admission.",
          "We tell you honestly where you stand.",
          "Every fee is explained before you pay.",
        ]}
      />

      <Section tone="tint">
        <div className={cardGrid}>
          <InfoCard eyebrow="Scholarship Hunt" title="Looking for funding?">
            <Link href="/resources/scholarships">See verified scholarships →</Link>
          </InfoCard>
          <InfoCard eyebrow="Next stage" title="Got an offer?">
            <Link href="/services/visa-applications">Start your visa application →</Link>
          </InfoCard>
        </div>
      </Section>

      <RelatedServices current="school" services={services} />
    </>
  );
}

export function VisaPage({
  services,
  keyword,
  whatsappLink,
  bookingUrl,
  faqs,
  videos,
}: ServiceBase & { faqs: Faq[]; videos: Video[] }) {
  return (
    <>
      <ServiceHero
        crumb="Visa applications"
        title="A complete, honest visa application. Nothing left to chance."
        lead="Study, work and visitor visas. We prepare your forms and financial documents, book your appointments and get you ready for the interview."
        primary={{ label: "Start online", href: "/start?service=visa" }}
        secondary={{ label: "Check your readiness", href: "#readiness" }}
        trust={<Trust keyword={keyword} whatsappLink={whatsappLink} />}
      />

      <Section>
        <SectionHeading title="Visas we help with" />
        <div className={cardGrid}>
          <InfoCard title="Student visas">
            UK, Canada, USA, Germany, Malta, Ireland. Usually after{" "}
            <Link href="/services/school-applications">your school application</Link>.
          </InfoCard>
          <InfoCard title="Work visas">
            For verified job offers and bridging programmes.{" "}
            <Link href="/services/work-abroad">See work abroad</Link>.
          </InfoCard>
          <InfoCard title="Visitor & tourist visas">Holidays, family visits and tours.</InfoCard>
          <InfoCard title="Conference visas">
            Invitation letters, itineraries and supporting documents.
          </InfoCard>
        </div>
      </Section>

      <Section tone="tint">
        <SectionHeading title="What we do for you" />
        <Steps
          items={[
            ["Eligibility check", "We check your case against the current rules before you pay any visa fee."],
            ["Forms", "Completed with you, line by line, so every answer matches your documents."],
            ["Financial documents", "Bank statements, sponsor letters and proof of funds reviewed for gaps."],
            ["Appointments", "Biometrics at VFS and embassy interview bookings."],
            ["Interview practice", "Mock interviews on the questions officers actually ask."],
            ["Tracking & departure", "We follow up until a decision, then help with flights and arrival."],
          ]}
        />
      </Section>

      <Section id="readiness">
        <SectionHeading
          eyebrow="Student visa readiness"
          title="How ready are you?"
          intro="Tick what you already have. Requirements differ by country and are subject to current rules; we confirm the full list for yours."
        />
        <VisaChecklist startHref="/start?service=visa" />
      </Section>

      <Section tone="tint">
        <SectionHeading title="Red flags we fix before you apply" />
        <CheckList
          items={[
            "Large, unexplained deposits in your bank statement",
            "Answers on the form that don’t match your documents",
            "A study plan that doesn’t connect to your past studies or work",
            "Missing proof of who is paying, and how",
          ]}
        />
        <p className="font-bold">We will not submit false or altered documents, for anyone.</p>
      </Section>

      <VideoGrid title="Watch and learn" videos={videos} />
      <ServiceFaqs faqs={faqs} />

      <PromisePanel
        items={[
          "We never guarantee a visa. The embassy decides.",
          "Immigration rules change; we check them for your case.",
          "Visa fees go to the government; our fee is agreed in writing.",
        ]}
        action={
          <Button href={bookingUrl} variant="on-blue" className="self-start">
            Talk it through with our CEO
          </Button>
        }
      />
      <RelatedServices current="visa" services={services} />
    </>
  );
}

export function WorkPage({
  services,
  keyword,
  whatsappLink,
  openings,
  bridging,
}: ServiceBase & { openings: Opening[]; bridging: Programme[] }) {
  return (
    <>
      <ServiceHero
        crumb="Work abroad"
        title="Work abroad, the honest way."
        lead="Openings and bridging programmes we have checked ourselves, with the paperwork done properly. We never sell jobs and never guarantee one."
        primary={{ label: "Start online", href: "/start?service=work" }}
        secondary={{ label: "How to spot a fake offer", href: "#fake-offers" }}
        trust={<Trust keyword={keyword} whatsappLink={whatsappLink} />}
      />

      <Section>
        <SectionHeading title="Two ways to work abroad with us" />
        <div className={cardGrid}>
          <InfoCard eyebrow="Route 1" title="Bridging programmes">
            Short courses that let qualified professionals, such as nurses, meet
            another country&apos;s registration rules, then work there. You study
            first, so it&apos;s a study visa at the start.
          </InfoCard>
          <InfoCard eyebrow="Route 2" title="Verified job openings">
            Roles from employers or licensed recruiters we have checked. You
            interview with the employer, then we prepare your work visa.
          </InfoCard>
        </div>
      </Section>

      <Section tone="tint" id="open-now">
        <SectionHeading
          title="Open now"
          intro="Send the keyword on WhatsApp, or start online, for full details."
        />
        <div className={cardGrid}>
          {bridging.map((programme) => (
            <ProgrammeCard key={programme.id} programme={programme} whatsappLink={whatsappLink} />
          ))}
          {openings.map((opening) => (
            <OpeningCard key={opening.id} opening={opening} whatsappLink={whatsappLink} />
          ))}
          <InfoCard title="Nothing for your field yet?">
            Start online and tell us your profession. We&apos;ll message you when
            a verified opening fits.{" "}
            <a href="/start?service=work">Join the waiting list →</a>
          </InfoCard>
        </div>
      </Section>

      <Section>
        <SectionHeading title="How it works" />
        <Steps
          items={[
            ["Profile check", "Your qualifications, licence, experience and English level."],
            ["Match", "A bridging programme or a verified opening that fits."],
            ["Apply & interview", "The school or employer decides. We prepare you."],
            ["Visa", <>The right visa for the route, subject to current rules. <Link href="/services/visa-applications">See visa help</Link></>],
            ["Travel", "Flights and arrival planning."],
          ]}
        />
      </Section>

      <Section tone="tint" id="fake-offers">
        <SectionHeading title="How to spot a fake job offer" />
        <CheckList
          items={[
            "You’re promised a job in exchange for a fee.",
            "There’s an offer letter but no interview with the employer.",
            "You’re told to travel on a visitor visa and “sort the work permit there”.",
            "Payment goes to a personal MoMo or bank account.",
            "The salary is far above what the role normally pays.",
          ]}
        />
        <p className="font-bold">
          Got an offer from someone else? Send it to us and we&apos;ll tell you
          honestly what we see.
        </p>
      </Section>

      <PromisePanel
        items={[
          "We never sell or guarantee jobs.",
          "Employers and schools make the decisions.",
          "Every fee is explained in writing first.",
        ]}
        action={
          <Button href="/start?service=work" variant="on-blue" className="self-start">
            Start online
          </Button>
        }
      />
      <RelatedServices current="work" services={services} />
    </>
  );
}

const tests = [
  ["IELTS Academic", "University study abroad", "English: listening, reading, writing, speaking"],
  ["IELTS General", "Work and migration", "Everyday and workplace English"],
  ["TOEFL", "University study, often the USA", "Academic English"],
  ["SAT", "Undergraduate admission, USA", "Reading, writing and maths"],
  ["GRE", "Many master’s and PhD programmes", "Verbal, quantitative and analytical writing"],
  ["GMAT", "Business school and MBAs", "Quantitative, verbal and data insights"],
];

export function ExamsPage({
  services,
  keyword,
  whatsappLink,
  prices,
  faqs,
}: ServiceBase & { prices: Record<string, PublicPrice>; faqs: Faq[] }) {
  const registration = prices.exam_registration;
  const tuition = prices.exam_tuition;

  return (
    <>
      <ServiceHero
        crumb="Proficiency exams"
        title="Register, prepare, and walk in ready."
        lead="We register you for IELTS, TOEFL, SAT, GRE or GMAT and teach you to the score your school needs."
        primary={{ label: "Start online", href: "/start?service=exams" }}
        secondary={{ label: "Which test do I need?", href: "#tests" }}
        trust={<Trust keyword={keyword} whatsappLink={whatsappLink} />}
      />

      <Section>
        <SectionHeading title="Registration, tuition, or both" />
        <div className={cardGrid}>
          <div className="flex min-w-0 flex-col gap-space-3 rounded-lg border border-line p-space-5">
            <h3 className="text-h3">Registration</h3>
            <CheckList
              items={[
                "We check which test your schools accept",
                "We book your date and centre",
                "We guide you through the test fee payment",
                "We send reminders and test-day tips",
              ]}
            />
            {registration && (
              <p className="font-bold">
                Service fee: {registration.amount} plus the official test fee
              </p>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-space-3 rounded-lg border border-line p-space-5">
            <h3 className="text-h3">Tuition</h3>
            <CheckList
              items={[
                "Classes at our office or online",
                "Practice tests under exam conditions",
                "Feedback on your writing and speaking",
              ]}
            />
            {tuition && <p className="font-bold">Course fee: {tuition.amount}</p>}
          </div>
        </div>
      </Section>

      <Section tone="tint" id="tests">
        <SectionHeading title="Which test do I need?" />
        <div className="rounded-lg bg-surface p-space-4">
          <Table caption="Which test each goal needs" captionHidden>
            <TableHead>
              <TableRow>
                <TableHeaderCell scope="col">Test</TableHeaderCell>
                <TableHeaderCell scope="col">Usually for</TableHeaderCell>
                <TableHeaderCell scope="col">What it tests</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map(([test, usedFor, covers]) => (
                <TableRow key={test}>
                  <TableCell>{test}</TableCell>
                  <TableCell>{usedFor}</TableCell>
                  <TableCell>{covers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>Some schools waive the English test. Check with us before you pay for one.</p>
      </Section>

      <ServiceFaqs faqs={faqs} />
      <RelatedServices current="exams" services={services} />
    </>
  );
}

export function TravelPage({
  services,
  keyword,
  whatsappLink,
  trips,
}: ServiceBase & { trips: Trip[] }) {
  return (
    <>
      <ServiceHero
        crumb="Travel & tours"
        title="Your trip, planned from Kumasi."
        lead="Flights, hotels, tours and conference trips. Tell us where and when; we send options and book what you choose."
        primary={{ label: "Request a quote", href: "/start?service=travel" }}
        secondary={{ label: `WhatsApp "${keyword}"`, href: whatsappLink(keyword) }}
        trust="No payment until you choose an option."
      />

      <Section>
        <SectionHeading title="What we book" />
        <div className={cardGrid}>
          <InfoCard title="Flights">One-way, return and multi-city, from Kumasi or Accra.</InfoCard>
          <InfoCard title="Hotels">Stays that match your budget and where you need to be.</InfoCard>
          <InfoCard title="Tours">Holiday, educational and summer trips, for individuals and groups.</InfoCard>
          <InfoCard title="Conference trips">Registration help, invitation letters, flights and hotel.</InfoCard>
          <InfoCard title="Tourist visas">
            Need a visa for the trip? We handle that too.{" "}
            <Link href="/services/visa-applications">Visa help →</Link>
          </InfoCard>
        </div>
      </Section>

      {trips.length > 0 && (
        <Section tone="tint" id="trips">
          <SectionHeading title="Upcoming group trips" />
          <div className={cardGrid}>
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </Section>
      )}

      <Section>
        <SectionHeading title="How booking works" />
        <Steps
          items={[
            ["Request a quote", "Route, dates, travellers and budget."],
            ["Get options", "On WhatsApp, with prices."],
            ["Choose and pay", "Only to our official MoMo or at the office."],
            ["Travel", "Tickets and vouchers sent to you, with support if plans change."],
          ]}
        />
      </Section>

      <RelatedServices current="travel" services={services} />
    </>
  );
}
