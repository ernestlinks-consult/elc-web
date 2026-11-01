import type {
  FooterGroup,
  NavItem,
  NavLink,
  Service,
  SiteConfig,
} from "./site-config";
import { buildWhatsAppLink } from "./whatsapp";

// Site structure that never comes from the database: the navigation, the fixed
// brand copy, and how contact data becomes the shell's props. Both the database
// (lib/content/shell.ts) and the fallback (lib/site-config.ts) go through here.

const startHref = "/start";

// Birth certificates share the passports page, so they have no page of their own.
const hasOwnPage = (service: Service) => service.key !== "birth";

const serviceHref = (slug: string) => `/services/${slug}`;

type ShellData = Omit<
  SiteConfig,
  "whatsappHref" | "startHref" | "nav" | "brand"
>;

function buildNav({
  services,
  bookingUrl,
  whatsappNumber,
  whatsappChannelUrl,
}: ShellData): { main: NavItem[]; footer: FooterGroup[]; legal: NavLink[] } {
  const whatsappKeywordLink = (keyword: string) =>
    buildWhatsAppLink(whatsappNumber, { keyword });

  return {
    main: [
      { type: "link", label: "Home", href: "/" },
      {
        type: "menu",
        key: "services",
        label: "Services",
        section: "/services",
        links: services.filter(hasOwnPage).map((service) => ({
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
  };
}

const brand: SiteConfig["brand"] = {
  name: "ErnestLinks Consult",
  tagline: "Making Impact Through Education and Travels.",
  summary:
    "A Kumasi consultancy helping students and young professionals with passports, exams, school and visa applications, work abroad and travel.",
  noGuarantee:
    "We do not guarantee admissions, visas or jobs. Schools, embassies and employers make those decisions. Immigration rules change; we confirm current rules for each case.",
};

export function buildSiteConfig(data: ShellData): SiteConfig {
  return {
    ...data,
    whatsappHref: buildWhatsAppLink(data.whatsappNumber, {
      message: data.whatsappDefaultMessage,
    }),
    startHref,
    nav: buildNav(data),
    brand,
  };
}
