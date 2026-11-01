import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StartPage } from "@/components/forms/StartPage";
import { isServiceKey, serviceForms, serviceKeys } from "@/lib/forms";

type PageProps = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return serviceKeys.map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { service } = await params;

  return {
    title: isServiceKey(service)
      ? `Start online: ${serviceForms[service].name}`
      : "Start online",
    alternates: { canonical: `/start?service=${service}` },
  };
}

export default async function Page({ params }: PageProps) {
  const { service } = await params;
  if (!isServiceKey(service)) notFound();

  return <StartPage service={service} />;
}
