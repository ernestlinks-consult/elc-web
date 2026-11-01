import type { Metadata } from "next";
import { LegalPage } from "@/components/site/ContentPages";
import { getLegalHtml } from "@/lib/content/legal";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service | ErnestLinks Consult",
  description: "The terms for using ErnestLinks Consult’s website and services.",
  path: "/terms",
});

export default async function Page() {
  const [html, shell] = await Promise.all([getLegalHtml("terms"), getSiteShell()]);

  return <LegalPage title="Terms of service" html={html} whatsappHref={shell.whatsappHref} />;
}
