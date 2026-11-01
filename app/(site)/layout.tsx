import type { ReactNode } from "react";
import {
  Footer,
  Header,
  PhoneBar,
  SkipLink,
  TopBar,
} from "@/components/site";
import { getCurrentYear } from "@/lib/current-year";
import { getSiteConfig } from "@/lib/site-config";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [config, year] = await Promise.all([getSiteConfig(), getCurrentYear()]);

  return (
    <>
      <SkipLink />
      <TopBar
        phones={config.phones}
        hotline={config.hotline}
        hours={config.hours.office}
        live={config.live}
      />
      <Header
        nav={config.nav.main}
        whatsappHref={config.whatsappHref}
        startHref={config.startHref}
      />
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer config={config} year={year} />
      <PhoneBar
        startHref={config.startHref}
        whatsappHref={config.whatsappHref}
        call={config.phones[0]}
      />
    </>
  );
}
