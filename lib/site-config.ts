import { buildWhatsAppLink } from "./whatsapp";

// Temporary data source for the site shell. Step 4 replaces getSiteConfig()
// with Supabase reads (settings, services, live_schedule). Components get this
// data as props from app/(site)/layout.tsx and never import this file.
// A null value is never rendered.

export type Phone = {
  display: string;
  /** E.164, used for tel: links. */
  tel: string;
};

export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavMenu = {
  type: "menu";
  key: string;
  label: string;
  /** URL prefix that marks this menu as the current section. */
  section: string;
  links: NavLink[];
};

export type NavItem = ({ type: "link" } & NavLink) | NavMenu;

export type FooterGroup = {
  title: string;
  links: NavLink[];
};

export type Office = {
  name: string;
  address: string;
  mapUrl: string;
};

export type Social = {
  label: string;
  url: string;
};

export type Service = {
  /** Matches services.key in the data model. */
  key: string;
  name: string;
  slug: string;
  shortDescription: string;
  whatsappKeyword: string;
};

export type LiveInfo = {
  note: string;
  url: string;
  /** Who presents; the host changes each weekday. */
  hostRotation: string;
  /** 24-hour local times, in timeZone. */
  startsAt: string;
  endsAt: string;
  timeZone: string;
  /** Per-weekday topics. Null until ELC sets them. */
  topics: string[] | null;
};

export type SiteConfig = {
  /** Main line (calls and WhatsApp) first, then the second line. */
  phones: Phone[];
  hotline: Phone;
  /** Number, with country code, that receives WhatsApp messages. */
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  whatsappHref: string;
  whatsappChannelUrl: string;
  email: string;
  hours: {
    office: string;
    ceoConsultations: string;
  };
  live: LiveInfo;
  bookingUrl: string;
  startHref: string;
  offices: Office[];
  socials: Social[];
  services: Service[];
  nav: {
    main: NavItem[];
    footer: FooterGroup[];
    legal: NavLink[];
  };
  brand: {
    name: string;
    tagline: string;
    summary: string;
    noGuarantee: string;
  };
};

const whatsappNumber = "+233537783166";
const whatsappDefaultMessage = "HELLO";
const bookingUrl = "https://ernest-links-frontend.vercel.app/book";
const startHref = "/start";
const whatsappChannelUrl =
  "https://whatsapp.com/channel/0029VastSo8DTkK2lkyUSY0g";
const tiktokUrl = "https://www.tiktok.com/@_ernestlinksconsult";

const services: Service[] = [
  {
    key: "passport",
    name: "Passports & birth certificates",
    slug: "passports",
    shortDescription: "New, renewal, express, mass drives",
    whatsappKeyword: "PASSPORT",
  },
  {
    key: "school",
    name: "School applications",
    slug: "school-applications",
    shortDescription: "Choosing, applying, offers, funding",
    whatsappKeyword: "STUDY",
  },
  {
    key: "visa",
    name: "Visa applications",
    slug: "visa-applications",
    shortDescription: "Study, work and tourist visas",
    whatsappKeyword: "VISA",
  },
  {
    key: "work",
    name: "Work abroad",
    slug: "work-abroad",
    shortDescription: "Verified openings and bridging programmes",
    whatsappKeyword: "WORK",
  },
  {
    key: "exams",
    name: "Proficiency exams",
    slug: "exams",
    shortDescription: "Registration and tuition",
    whatsappKeyword: "EXAMS",
  },
  {
    key: "travel",
    name: "Travel & tours",
    slug: "travel",
    shortDescription: "Flights, hotels, conferences",
    whatsappKeyword: "TRAVEL",
  },
];

const serviceHref = (slug: string) => `/services/${slug}`;

const whatsappKeywordLink = (keyword: string) =>
  buildWhatsAppLink(whatsappNumber, { keyword });

const siteConfig: SiteConfig = {
  phones: [
    { display: "+233 53 778 3166", tel: "+233537783166" },
    { display: "+233 20 401 0168", tel: "+233204010168" },
  ],
  hotline: { display: "032 229 1161", tel: "+233322291161" },
  whatsappNumber,
  whatsappDefaultMessage,
  whatsappHref: buildWhatsAppLink(whatsappNumber, {
    message: whatsappDefaultMessage,
  }),
  whatsappChannelUrl,
  email: "office@ernestlinksconsult.com",
  hours: {
    office: "Mon–Fri, 8:00–17:00",
    ceoConsultations: "CEO consultations Mon & Wed, 10:30–14:30",
  },
  live: {
    note: "Weekdays, 12–2pm on TikTok LIVE",
    url: tiktokUrl,
    hostRotation: "A different host each weekday",
    startsAt: "12:00",
    endsAt: "14:00",
    timeZone: "Africa/Accra",
    topics: null,
  },
  bookingUrl,
  startHref,
  offices: [
    {
      name: "Ayeduase, KNUST Engineering Gate office",
      address: "Ayeduase Gate, Kumasi",
      mapUrl: "https://share.google/aOoUoDOERXanDgkHx",
    },
    {
      name: "Kotei Astro Turf office",
      address: "Kotei Astro Turf, next to Unik Pub, Kumasi",
      mapUrl: "https://share.google/kju8X4z7czM9tZf0y",
    },
  ],
  socials: [
    { label: "TikTok", url: tiktokUrl },
    { label: "Instagram", url: "https://www.instagram.com/_ernestlinksconsult/" },
    {
      label: "Facebook",
      url: "https://web.facebook.com/profile.php?id=61576608208326",
    },
    { label: "YouTube", url: "https://www.youtube.com/@ErnestLinksConsult" },
    { label: "X", url: "https://x.com/Ernestlinkscons" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/ernestlinksconsult/",
    },
  ],
  services,
  nav: {
    main: [
      { type: "link", label: "Home", href: "/" },
      {
        type: "menu",
        key: "services",
        label: "Services",
        section: "/services",
        links: services.map((service) => ({
          label: service.name,
          href: serviceHref(service.slug),
          description: service.shortDescription,
        })),
      },
      {
        type: "menu",
        key: "resources",
        label: "Blog & Resources",
        section: "/resources",
        links: [
          {
            label: "Blog",
            href: "/resources/blog",
            description: "Guides, updates and student stories",
          },
          {
            label: "Scholarship Hunt",
            href: "/resources/scholarships",
            description: "Verified opportunities and deadlines",
          },
          {
            label: "Videos",
            href: "/resources/videos",
            description: "Our TikTok, Instagram and YouTube posts",
          },
          {
            label: "FAQs",
            href: "/resources/faqs",
            description: "Answers by service",
          },
        ],
      },
      { type: "link", label: "About", href: "/about" },
      { type: "link", label: "Contact", href: "/contact" },
    ],
    footer: [
      {
        title: "Services",
        links: [
          { label: "Passports", href: serviceHref("passports") },
          { label: "Birth certificates", href: `${serviceHref("passports")}#birth` },
          { label: "School applications", href: serviceHref("school-applications") },
          { label: "Visa applications", href: serviceHref("visa-applications") },
          { label: "Work abroad", href: serviceHref("work-abroad") },
          { label: "Proficiency exams", href: serviceHref("exams") },
          { label: "Travel & tours", href: serviceHref("travel") },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "All resources", href: "/resources" },
          { label: "Blog", href: "/resources/blog" },
          { label: "Scholarship Hunt", href: "/resources/scholarships" },
          { label: "Videos", href: "/resources/videos" },
          { label: "FAQs", href: "/resources/faqs" },
          { label: "WhatsApp channel", href: whatsappChannelUrl },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About us", href: "/about" },
          { label: "Our team", href: "/about#team" },
          { label: "Host a passport drive", href: whatsappKeywordLink("DRIVE") },
          { label: "Partner with us", href: whatsappKeywordLink("PARTNER") },
          { label: "Internships & NSS", href: whatsappKeywordLink("INTERNSHIP") },
          { label: "Book the CEO", href: bookingUrl },
          { label: "Contact us", href: "/contact" },
          { label: "Start online", href: startHref },
        ],
      },
    ],
    legal: [
      { label: "Privacy notice", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Payments & refunds", href: "/payments" },
    ],
  },
  brand: {
    name: "ErnestLinks Consult",
    tagline: "Making Impact Through Education and Travels.",
    summary:
      "A Kumasi consultancy helping students and young professionals with passports, exams, school and visa applications, work abroad and travel.",
    noGuarantee:
      "We do not guarantee admissions, visas or jobs. Schools, embassies and employers make those decisions. Immigration rules change; we confirm current rules for each case.",
  },
};

// Async on purpose: the Supabase version will have the same signature.
export async function getSiteConfig(): Promise<SiteConfig> {
  return siteConfig;
}
