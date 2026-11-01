import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScholarshipsPage } from "@/components/site/ListPages";
import { getScholarships } from "@/lib/content/listings";
import { getSiteShell } from "@/lib/content/shell";
import { isScholarshipStatus, scholarshipStatuses } from "@/lib/content/taxonomy";
import { pageMetadata } from "@/lib/site-metadata";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// /resources/scholarships?status=open arrives here through proxy.ts.

type PageProps = { params: Promise<{ status: string }> };

export function generateStaticParams() {
  return Object.keys(scholarshipStatuses).map((status) => ({ status }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { status } = await params;
  if (!isScholarshipStatus(status)) return {};

  return pageMetadata({
    title: `${scholarshipStatuses[status]} scholarships | Scholarship Hunt`,
    description: `${scholarshipStatuses[status]} scholarships, each checked against the funder’s official page.`,
    path: `/resources/scholarships?status=${status}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { status } = await params;
  if (!isScholarshipStatus(status)) notFound();

  const [scholarships, shell] = await Promise.all([getScholarships(), getSiteShell()]);

  return (
    <ScholarshipsPage
      status={status}
      scholarships={scholarships}
      helpHref={buildWhatsAppLink(shell.whatsappNumber, { keyword: "SCHOLAR" })}
    />
  );
}
