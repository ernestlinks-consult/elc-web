import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site";

export const metadata: Metadata = {
  title: "Site shell",
  robots: { index: false, follow: false },
};

export default function ShellPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="container flex flex-col gap-space-4 py-space-7">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services/passports" },
          { label: "Site shell" },
        ]}
      />
      <h1 className="text-h1">Site shell</h1>
      <p className="text-lead text-ink-muted">
        A temporary inner page for checking the shell. Development only.
      </p>
    </div>
  );
}
