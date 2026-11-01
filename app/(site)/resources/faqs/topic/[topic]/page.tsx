import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqsPage } from "@/components/site/ListPages";
import { groupFaqs } from "@/lib/content/faq-groups";
import { getAllFaqs } from "@/lib/content/listings";
import { getSiteShell } from "@/lib/content/shell";
import { faqTopics, isFaqTopic } from "@/lib/content/taxonomy";
import { pageMetadata } from "@/lib/site-metadata";

// /resources/faqs?topic=visa arrives here through proxy.ts.

type PageProps = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return Object.keys(faqTopics).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  if (!isFaqTopic(topic)) return {};

  return pageMetadata({
    title: `${faqTopics[topic]} questions | ErnestLinks Consult`,
    description: `Answers to common questions about ${faqTopics[topic].toLowerCase()}.`,
    path: `/resources/faqs?topic=${topic}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { topic } = await params;
  if (!isFaqTopic(topic)) notFound();

  const [faqs, shell] = await Promise.all([getAllFaqs(), getSiteShell()]);
  const allGroups = groupFaqs(faqs);

  return (
    <FaqsPage
      topic={topic}
      groups={allGroups.filter((group) => group.topic === topic)}
      allGroups={allGroups}
      whatsappHref={shell.whatsappHref}
    />
  );
}
