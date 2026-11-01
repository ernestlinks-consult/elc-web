import Image from "next/image";
import Link from "next/link";
import { AlertsSignup } from "@/components/forms/AlertsSignup";
import { Button } from "@/components/ui";
import type { SiteConfig } from "@/lib/site-config";

export type FooterProps = {
  config: Pick<
    SiteConfig,
    | "brand"
    | "bookingUrl"
    | "email"
    | "hotline"
    | "hours"
    | "live"
    | "nav"
    | "offices"
    | "phones"
    | "socials"
    | "startHref"
    | "whatsappHref"
  >;
  year: number;
};

// Links need a 44px target on phones even in a tight list.
const footerLinkClasses =
  "text-on-blue-muted no-underline max-phone:inline-flex max-phone:min-h-11 max-phone:items-center";
const contactLinkClasses =
  "text-on-blue no-underline max-phone:inline-flex max-phone:min-h-11 max-phone:items-center";

export function Footer({ config, year }: FooterProps) {
  const { brand, hours, nav, offices, phones, hotline, email, socials } =
    config;
  const privacy = nav.legal.find((link) => link.href === "/privacy");

  return (
    <footer className="bg-blue-deep text-body-sm text-on-blue-muted">
      <div className="bg-blue">
        <div className="container flex flex-wrap items-center justify-between gap-space-5 py-10">
          <div className="flex max-w-160 flex-col gap-1.5">
            <h2 className="text-h3 text-on-blue">Not sure where to start?</h2>
            <p className="text-body text-on-blue-muted">
              Ask free on our weekday TikTok LIVE, or message us and a real
              person will reply.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-3">
            <Button href={config.startHref} variant="on-blue">
              Start online
            </Button>
            <Button href={config.whatsappHref} variant="outline-on-blue">
              WhatsApp us
            </Button>
            <Button href={config.bookingUrl} variant="outline-on-blue">
              Book the CEO
            </Button>
            <a
              href={config.live.url}
              className="inline-flex min-h-11 items-center font-bold text-on-blue"
            >
              Join the LIVE
            </a>
          </div>
        </div>
      </div>

      <div className="container grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-x-space-6 gap-y-10 pt-14 pb-10">
        <div className="flex min-w-0 flex-col gap-space-4 phone:col-span-2">
          <Image
            src="/brand/web-elc-logo-vertical-stack-white.svg"
            alt={brand.name}
            width={190}
            height={107}
          />
          <p className="font-bold text-on-blue">{brand.tagline}</p>
          <p className="max-w-95">{brand.summary}</p>
          <ul className="flex flex-wrap gap-space-2">
            {socials.map((social) => (
              <li key={social.url}>
                <a
                  href={social.url}
                  className="inline-flex min-h-11 items-center rounded-pill border border-line-on-deep px-3.5 text-on-blue no-underline"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {nav.footer.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="pb-3 text-eyebrow text-on-blue">{group.title}</h2>
            <ul className="flex flex-col gap-2.5 max-phone:gap-0">
              {group.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/start") ? (
                    <a href={link.href} className={footerLinkClasses}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={footerLinkClasses}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="flex min-w-0 flex-col gap-2.5 phone:col-span-2">
          <h2 className="text-eyebrow text-on-blue">Visit or call</h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-space-4">
            {offices.map((office) => (
              <li key={office.name} className="flex flex-col gap-1">
                <strong className="font-bold text-on-blue">
                  {office.name}
                </strong>
                <span>{office.address}</span>
                <a
                  href={office.mapUrl}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Directions to ${office.name} (opens in a new tab)`}
                  className="self-start text-on-blue max-phone:inline-flex max-phone:min-h-11 max-phone:items-center"
                >
                  Directions
                </a>
              </li>
            ))}
          </ul>
          <p>
            {hours.office} · {hours.ceoConsultations}
          </p>
          <ul className="flex flex-wrap gap-x-space-4 gap-y-1">
            <li>
              <a href={`tel:${phones[0].tel}`} className={contactLinkClasses}>
                {phones[0].display} (call or WhatsApp)
              </a>
            </li>
            {phones.slice(1).map((phone) => (
              <li key={phone.tel}>
                <a href={`tel:${phone.tel}`} className={contactLinkClasses}>
                  {phone.display}
                </a>
              </li>
            ))}
            <li>
              <a href={`tel:${hotline.tel}`} className={contactLinkClasses}>
                Hotline {hotline.display}
              </a>
            </li>
            <li className="min-w-0 break-words">
              <a href={`mailto:${email}`} className={contactLinkClasses}>
                {email}
              </a>
            </li>
          </ul>
        </div>

        <AlertsSignup privacyHref={privacy?.href ?? "/privacy"} />
      </div>

      <div className="border-t border-line-on-deep">
        <div className="container flex flex-wrap justify-between gap-x-space-5 gap-y-3 pt-5.5 pb-3">
          <span>
            © {year} {brand.name}. All rights reserved.
          </span>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 max-phone:gap-y-0">
              {nav.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="container pb-7 text-caption font-normal">
          {brand.noGuarantee}
        </p>
      </div>
    </footer>
  );
}
