import type { Metadata } from "next";
import { VideosPage } from "@/components/site/ListPages";
import { getAllVideos } from "@/lib/content/listings";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Watch ELC: videos | ErnestLinks Consult",
  description: "Our latest videos from TikTok, Instagram, Facebook and YouTube, played right here.",
  path: "/resources/videos",
});

export default async function Page() {
  const [videos, shell] = await Promise.all([getAllVideos(), getSiteShell()]);

  return (
    <VideosPage platform="all" videos={videos} socials={shell.socials} liveNote={shell.live.note} />
  );
}
