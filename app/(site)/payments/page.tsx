import type { Metadata } from "next";
import { LegalPage } from "@/components/site/ContentPages";
import { getLegalHtml } from "@/lib/content/legal";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Payments & refunds | ErnestLinks Consult",
  description: "How to pay ErnestLinks Consult, and our refund policy.",
  path: "/payments",
});

export default async function Page() {
  const [html, shell] = await Promise.all([getLegalHtml("payments"), getSiteShell()]);

  return <LegalPage title="Payments & refunds" html={html} whatsappHref={shell.whatsappHref} />;
}
