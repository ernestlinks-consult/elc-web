import type { Metadata } from "next";
import { FaqsPage } from "@/components/site/ListPages";
import { groupFaqs } from "@/lib/content/faq-groups";
import { getAllFaqs } from "@/lib/content/listings";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Questions people ask us | ErnestLinks Consult",
  description: "Answers on prices, timelines, payments and what to expect, by service.",
  path: "/resources/faqs",
});

export default async function Page() {
  const [faqs, shell] = await Promise.all([getAllFaqs(), getSiteShell()]);
  const groups = groupFaqs(faqs);

  return (
    <FaqsPage topic="all" groups={groups} allGroups={groups} whatsappHref={shell.whatsappHref} />
  );
}
