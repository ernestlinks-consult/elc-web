import "server-only";
import { getSiteConfig, type SiteConfig } from "@/lib/site-config";
import { buildSiteConfig } from "@/lib/site-structure";
import { getServices } from "./services";
import { getLiveSchedule, getSettings } from "./settings";

async function loadFromDatabase(): Promise<SiteConfig> {
  const [settings, services, schedule] = await Promise.all([
    getSettings(),
    getServices(),
    getLiveSchedule(),
  ]);
  const { contacts, hours, live_note: live } = settings;
  const topics = schedule.flatMap((slot) => slot.topic ?? []);

  return buildSiteConfig({
    phones: contacts.phones,
    hotline: contacts.hotline,
    whatsappNumber: contacts.whatsapp_number,
    whatsappDefaultMessage: contacts.whatsapp_default_message,
    whatsappChannelUrl: contacts.whatsapp_channel_url,
    email: contacts.email,
    hours: { office: hours.office, ceoConsultations: hours.ceo_consultations },
    live: {
      note: live.note,
      url: live.url,
      hostRotation: live.host_rotation,
      startsAt: schedule[0]?.startsAt ?? null,
      endsAt: schedule[0]?.endsAt ?? null,
      timeZone: "Africa/Accra",
      topics: topics.length > 0 ? topics : null,
    },
    bookingUrl: settings.booking_url,
    offices: settings.offices.map((office) => ({
      name: office.name,
      address: office.address,
      mapUrl: office.map_url,
    })),
    socials: settings.socials,
    services,
  });
}

/**
 * Everything the public layout needs. In production a database failure stops
 * the build or request, so stale built-in details can never go live quietly.
 */
export async function getSiteShell(): Promise<SiteConfig> {
  try {
    return await loadFromDatabase();
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;

    console.warn(
      "Site shell: database unavailable, using lib/site-config.ts.",
      error instanceof Error ? error.message : error,
    );
    return getSiteConfig();
  }
}
