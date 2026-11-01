import type { Metadata } from "next";
import { AboutPage } from "@/components/site/ContentPages";
import { getSiteShell } from "@/lib/content/shell";
import { getTeam } from "@/lib/content/staff";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "About us | ErnestLinks Consult",
  description:
    "A Kumasi consultancy helping students, young professionals and families reach opportunities abroad, with clear steps and honest advice.",
  path: "/about",
});

export default async function Page() {
  const [team, shell] = await Promise.all([getTeam(), getSiteShell()]);

  return <AboutPage team={team} offices={shell.offices} officeHours={shell.hours.office} />;
}
