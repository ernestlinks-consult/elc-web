"use client";

import { useState, type MouseEvent } from "react";

const linkClasses = "inline-flex min-h-11 items-center font-bold";

/** Copy link is a real link, so without JavaScript it still leads to the page. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  async function copy(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <nav aria-label="Share this article" className="flex flex-wrap items-center gap-x-space-4">
      <span className="font-bold">Share</span>
      <a className={linkClasses} href={`https://wa.me/?text=${text}%20${encodedUrl}`}>
        WhatsApp
      </a>
      <a className={linkClasses} href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}>
        Facebook
      </a>
      <a className={linkClasses} href={`https://x.com/intent/post?url=${encodedUrl}&text=${text}`}>
        X
      </a>
      <a className={linkClasses} href={url} onClick={copy}>
        Copy link
      </a>
      <span role="status" className="text-body-sm text-ink-muted">
        {copied ? "Link copied" : ""}
      </span>
    </nav>
  );
}
