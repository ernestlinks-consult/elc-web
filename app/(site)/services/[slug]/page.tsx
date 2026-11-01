import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ExamsPage,
  PassportsPage,
  SchoolPage,
  TravelPage,
  VisaPage,
  WorkPage,
  type ServiceBase,
} from "@/components/site/ServicePages";
import {
  getDrives,
  getFaqs,
  getOpenings,
  getProgrammes,
  getTrips,
  getVideos,
} from "@/lib/content/listings";
import { isPlaceholder } from "@/lib/content/placeholder";
import { getPrices } from "@/lib/content/prices";
import { getSettings } from "@/lib/content/settings";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type PageProps = { params: Promise<{ slug: string }> };

const pages = {
  passports: {
    key: "passport",
    title: "Passports and birth certificates in Kumasi",
    description:
      "New passports, renewals, replacements and biometric birth certificates. We handle the forms and bookings and follow up until you collect.",
  },
  "school-applications": {
    key: "school",
    title: "School applications abroad",
    description:
      "Pick programmes that fit your grades and budget, build a strong application and compare your offers and funding. Admission is always the school’s decision.",
  },
  "visa-applications": {
    key: "visa",
    title: "Visa applications",
    description:
      "Study, work and visitor visas: forms, financial documents, appointments and interview practice. The embassy decides, and rules are subject to change.",
  },
  "work-abroad": {
    key: "work",
    title: "Work abroad, the honest way",
    description:
      "Openings and bridging programmes we have checked ourselves. We never sell jobs and never guarantee one.",
  },
  exams: {
    key: "exams",
    title: "IELTS, TOEFL, SAT, GRE and GMAT",
    description:
      "Registration and tuition for IELTS, TOEFL, SAT, GRE and GMAT, and help choosing the test your school accepts.",
  },
  travel: {
    key: "travel",
    title: "Travel and tours from Kumasi",
    description:
      "Flights, hotels, tours and conference trips. Tell us where and when; we send options and book what you choose.",
  },
} as const;

type Slug = keyof typeof pages;

const isSlug = (slug: string): slug is Slug => slug in pages;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};

  const { title, description } = pages[slug];
  return pageMetadata({
    title: `${title} | ErnestLinks Consult`,
    description,
    path: `/services/${slug}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const shell = await getSiteShell();
  const keywordFor = (key: string) =>
    shell.services.find((service) => service.key === key)?.whatsappKeyword ?? "HELLO";
  const base: ServiceBase = {
    services: shell.services,
    keyword: keywordFor(pages[slug].key),
    whatsappLink: (keyword) => buildWhatsAppLink(shell.whatsappNumber, { keyword }),
    bookingUrl: shell.bookingUrl,
  };

  switch (slug) {
    case "passports": {
      const [prices, settings, drives, faqs] = await Promise.all([
        getPrices(),
        getSettings(),
        getDrives(),
        getFaqs("passport"),
      ]);
      return (
        <PassportsPage
          {...base}
          prices={prices}
          whatToBring={settings.passport_what_to_bring.filter((item) => !isPlaceholder(item))}
          drives={drives}
          faqs={faqs}
          birthKeyword={keywordFor("birth")}
        />
      );
    }
    case "school-applications": {
      const [programmes, videos] = await Promise.all([
        getProgrammes("study"),
        getVideos("school"),
      ]);
      return <SchoolPage {...base} programmes={programmes} videos={videos} />;
    }
    case "visa-applications": {
      const [faqs, videos] = await Promise.all([getFaqs("visa"), getVideos("visa")]);
      return <VisaPage {...base} faqs={faqs} videos={videos} />;
    }
    case "work-abroad": {
      const [openings, bridging] = await Promise.all([
        getOpenings(),
        getProgrammes("bridging"),
      ]);
      return <WorkPage {...base} openings={openings} bridging={bridging} />;
    }
    case "exams": {
      const [prices, faqs] = await Promise.all([getPrices(), getFaqs("exams")]);
      return <ExamsPage {...base} prices={prices} faqs={faqs} />;
    }
    case "travel":
      return <TravelPage {...base} trips={await getTrips()} />;
  }
}
