import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentPreview } from "./ComponentPreview";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

export default function ComponentsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ComponentPreview />;
}
