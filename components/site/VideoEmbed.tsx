"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ImageOrPattern } from "./ImageOrPattern";

const platformNames: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

/** The platform's own player for a post URL. Null if it isn't a single post. */
export function embedUrl(platform: string, url: string) {
  const match = (pattern: RegExp) => url.match(pattern)?.[1];

  switch (platform) {
    case "youtube": {
      const id = match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]+)/);
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
    }
    case "tiktok": {
      const id = match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
      return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
    }
    case "instagram": {
      const id = match(/instagram\.com\/(?:p|reel)\/([\w-]+)/);
      return id ? `https://www.instagram.com/p/${id}/embed` : null;
    }
    case "facebook":
      return /facebook\.com\/.+\/(videos|posts)\//.test(url)
        ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`
        : null;
    default:
      return null;
  }
}

export type VideoEmbedProps = {
  platform: string;
  url: string;
  title: string;
  keyword?: string | null;
  thumbnailUrl?: string | null;
  className?: string;
};

/**
 * Nothing from the platform loads until someone taps play, so a page stays light
 * and sets no third-party cookies. The link is the fallback if an embed fails.
 */
export function VideoEmbed({
  platform,
  url,
  title,
  keyword,
  thumbnailUrl,
  className,
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const platformName = platformNames[platform] ?? platform;
  const src = embedUrl(platform, url);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-line bg-surface",
        className,
      )}
    >
      {playing && src ? (
        <iframe
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
      ) : (
        <ImageOrPattern path={thumbnailUrl} className="aspect-video">
          <div className="absolute inset-0 flex items-center justify-center">
            {src ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play video: ${title}`}
                className="flex size-16 cursor-pointer items-center justify-center rounded-pill bg-surface text-blue"
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : null}
          </div>
        </ImageOrPattern>
      )}
      <div className="flex flex-col gap-1.5 p-space-4">
        <Badge tone="blue" className="self-start">
          {platformName}
        </Badge>
        <h3 className="text-body font-bold">{title}</h3>
        {keyword && (
          <p className="text-body-sm text-ink-muted">WhatsApp &quot;{keyword}&quot;</p>
        )}
        <a href={url} className="inline-flex min-h-11 items-center text-label">
          Watch on {platformName} →
        </a>
      </div>
    </div>
  );
}
