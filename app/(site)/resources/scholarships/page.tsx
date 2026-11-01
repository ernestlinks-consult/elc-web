import type { Metadata } from "next";
import { ScholarshipsPage } from "@/components/site/ListPages";
import { getScholarships } from "@/lib/content/listings";
import { getSiteShell } from "@/lib/content/shell";
import { pageMetadata } from "@/lib/site-metadata";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Scholarship Hunt | ErnestLinks Consult",
  description:
    "Verified scholarships for final-year students, NSS personnel and graduates. We check every deadline and link before it goes up.",
  path: "/resources/scholarships",
});

export default async function Page() {
  const [scholarships, shell] = await Promise.all([getScholarships(), getSiteShell()]);

  return (
    <ScholarshipsPage
      status="all"
      scholarships={scholarships}
      helpHref={buildWhatsAppLink(shell.whatsappNumber, { keyword: "SCHOLAR" })}
    />
  );
}
