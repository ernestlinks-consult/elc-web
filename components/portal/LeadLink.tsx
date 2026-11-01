"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

/**
 * Opens the lead's own page, or the side panel on wide screens. It stays a real
 * link, so a new tab or a phone always gets the full page.
 */
export function LeadLink({ id, children }: { id: string; children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function openPanel(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (!window.matchMedia("(width >= 1280px)").matches) return;

    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("lead", id);
    router.push(`/portal/leads?${params}`, { scroll: false });
  }

  return (
    <Link
      href={`/portal/leads/${id}`}
      onClick={openPanel}
      className="inline-flex min-h-11 items-center font-bold"
    >
      {children}
    </Link>
  );
}
