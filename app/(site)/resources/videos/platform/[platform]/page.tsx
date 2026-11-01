import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VideosPage } from "@/components/site/ListPages";
import { getAllVideos } from "@/lib/content/listings";
import { getSiteShell } from "@/lib/content/shell";
import { isVideoPlatform, videoPlatforms } from "@/lib/content/taxonomy";
import { pageMetadata } from "@/lib/site-metadata";

// /resources/videos?platform=tiktok arrives here through proxy.ts.

type PageProps = { params: Promise<{ platform: string }> };

export function generateStaticParams() {
  return Object.keys(videoPlatforms).map((platform) => ({ platform }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { platform } = await params;
  if (!isVideoPlatform(platform)) return {};

  return pageMetadata({
    title: `${videoPlatforms[platform]} videos | Watch ELC`,
    description: `Our latest ${videoPlatforms[platform]} videos, played right here.`,
    path: `/resources/videos?platform=${platform}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { platform } = await params;
  if (!isVideoPlatform(platform)) notFound();

  const [videos, shell] = await Promise.all([getAllVideos(platform), getSiteShell()]);

  return (
    <VideosPage platform={platform} videos={videos} socials={shell.socials} liveNote={shell.live.note} />
  );
}
