import type { Metadata } from "next";
import { HomeContent } from "@/components/site/HomeContent";
import {
  getDrives,
  getLatestPosts,
  getScholarships,
  getTestimonials,
  getVideos,
} from "@/lib/content/listings";
import { publicValue } from "@/lib/content/placeholder";
import { getPrices } from "@/lib/content/prices";
import { getSettings } from "@/lib/content/settings";
import { getSiteShell } from "@/lib/content/shell";
import { getTeam } from "@/lib/content/staff";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "ErnestLinks Consult: passports, study, visas and travel from Kumasi",
  description:
    "Passports, exams, school and visa applications, work abroad and travel, handled step by step by a Kumasi team you can reach on WhatsApp.",
  path: "/",
});

export default async function Home() {
  const [
    shell,
    settings,
    prices,
    drives,
    testimonials,
    posts,
    scholarships,
    videos,
    team,
  ] = await Promise.all([
    getSiteShell(),
    getSettings(),
    getPrices(),
    getDrives(),
    getTestimonials(),
    getLatestPosts(1),
    getScholarships(),
    getVideos("home"),
    getTeam(),
  ]);

  return (
    <HomeContent
      data={{
        services: shell.services,
        prices,
        drives,
        testimonials,
        posts,
        scholarships,
        video: videos[0] ?? null,
        team,
        liveNote: shell.live.note,
        liveUrl: shell.live.url,
        hostRotation: shell.live.hostRotation,
        ceoHours: shell.hours.ceoConsultations,
        bookingUrl: shell.bookingUrl,
        replyPromise: publicValue(settings.reply_promise),
        whatsappHref: shell.whatsappHref,
        whatsappDisplay: shell.phones[0].display,
        privacyHref: "/privacy",
      }}
    />
  );
}
