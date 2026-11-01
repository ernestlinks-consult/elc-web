import type { Metadata } from "next";
import { LegalPage } from "@/components/site/ContentPages";
import { getLegalHtml } from "@/lib/content/legal";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy notice | ErnestLinks Consult",
  description: "How ErnestLinks Consult handles your personal data.",
  path: "/privacy",
});

export default async function Page() {
  const [html, shell] = await Promise.all([getLegalHtml("privacy"), getSiteShell()]);

  return <LegalPage title="Privacy notice" html={html} whatsappHref={shell.whatsappHref} />;
}
