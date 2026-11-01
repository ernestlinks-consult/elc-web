import type { Metadata } from "next";
import { ContactPage } from "@/components/site/ContentPages";
import { publicValue } from "@/lib/content/placeholder";
import { getPrices } from "@/lib/content/prices";
import { getSettings } from "@/lib/content/settings";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact us | ErnestLinks Consult",
  description:
    "WhatsApp, call, email or walk into our offices in Kumasi. Start online, or send us a message.",
  path: "/contact",
});

export default async function Page() {
  const [shell, settings, prices] = await Promise.all([
    getSiteShell(),
    getSettings(),
    getPrices(),
  ]);

  return (
    <ContactPage
      whatsappHref={shell.whatsappHref}
      phones={shell.phones}
      hotline={shell.hotline}
      email={shell.email || null}
      offices={shell.offices}
      officeHours={shell.hours.office}
      replyPromise={publicValue(settings.reply_promise)}
      liveUrl={shell.live.url}
      liveNote={shell.live.note}
      bookingUrl={shell.bookingUrl}
      ceoHours={shell.hours.ceoConsultations}
      consultations={[prices.consultation_30, prices.consultation_60].filter(Boolean)}
      privacyHref="/privacy"
    />
  );
}
