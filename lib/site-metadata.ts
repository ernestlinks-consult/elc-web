import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ernestlinksconsult.com";

const shareImage = {
  url: "/brand/og-default.png",
  width: 1200,
  height: 630,
  alt: "ErnestLinks Consult: Making Impact Through Education and Travels.",
};

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "ErnestLinks Consult",
      type: "website",
      locale: "en_GH",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage.url],
    },
  };
}
