import { Breadcrumbs } from "@/components/site";
import { getPriceLabels } from "@/lib/content/prices";
import { publicValue } from "@/lib/content/placeholder";
import { getSettings } from "@/lib/content/settings";
import { getSiteShell } from "@/lib/content/shell";
import { serviceForms, type ServiceKey } from "@/lib/forms";
import { LaterPanel } from "./LaterPanel";
import { ServiceTabs } from "./ServiceTabs";
import { StartOnlineForm } from "./StartOnlineForm";

export async function StartPage({ service }: { service: ServiceKey }) {
  const [shell, settings, priceLabels] = await Promise.all([
    getSiteShell(),
    getSettings(),
    getPriceLabels(),
  ]);
  const privacy = shell.nav.legal.find((link) => link.href === "/privacy");

  return (
    <div className="bg-blue-tint">
      <section className="border-b border-line bg-surface">
        <div className="container flex flex-col gap-3.5 pt-12 pb-7">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Start online" }]}
          />
          <h1 className="text-h1">Start your application online</h1>
          <p className="max-w-175 text-lead text-ink-muted">
            No call needed. Tell us the basics in under a minute and we’ll
            message you on WhatsApp. Add more details now, or stop after step 1.
          </p>
          <div className="pt-2">
            <ServiceTabs current={service} />
          </div>
        </div>
      </section>

      <section className="container flex flex-wrap items-start gap-7 pt-9 pb-18">
        <StartOnlineForm
          key={service}
          service={service}
          priceLabels={priceLabels}
          privacyHref={privacy?.href ?? "/privacy"}
          whatsappNumber={shell.whatsappNumber}
        />
        <LaterPanel
          later={serviceForms[service].later}
          replyPromise={publicValue(settings.reply_promise)}
          whatsappHref={shell.whatsappHref}
          phone={shell.phones[0]}
        />
      </section>
    </div>
  );
}
