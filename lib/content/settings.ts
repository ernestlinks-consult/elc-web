import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { cacheTags, contentCacheLife } from "./cache";

const phoneSchema = z.object({ display: z.string(), tel: z.string() });

// settings.value is free-form jsonb, so its shape is checked on the way out.
const publicSettingsSchema = z.object({
  contacts: z.object({
    phones: z.array(phoneSchema).min(1),
    hotline: phoneSchema,
    whatsapp_number: z.string(),
    whatsapp_default_message: z.string(),
    whatsapp_channel_url: z.string(),
    email: z.string(),
  }),
  hours: z.object({ office: z.string(), ceo_consultations: z.string() }),
  reply_promise: z.string(),
  booking_url: z.string(),
  offices: z.array(
    z.object({ name: z.string(), address: z.string(), map_url: z.string() }),
  ),
  socials: z.array(z.object({ label: z.string(), url: z.string() })),
  live_note: z.object({
    note: z.string(),
    url: z.string(),
    host_rotation: z.string(),
  }),
});

export type PublicSettings = z.infer<typeof publicSettingsSchema>;

export async function getSettings(): Promise<PublicSettings> {
  "use cache";
  cacheTag(cacheTags.settings);
  cacheLife(contentCacheLife);

  const { data, error } = await createPublicClient()
    .from("settings_public")
    .select("key, value");

  if (error) throw new Error(`Could not load settings: ${error.message}`);

  return publicSettingsSchema.parse(
    Object.fromEntries(data.map(({ key, value }) => [key, value])),
  );
}

export type LiveSlot = {
  weekday: number;
  topic: string | null;
  startsAt: string;
  endsAt: string;
  hostName: string | null;
};

export async function getLiveSchedule(): Promise<LiveSlot[]> {
  "use cache";
  cacheTag(cacheTags.settings);
  cacheLife(contentCacheLife);

  const { data, error } = await createPublicClient()
    .from("live_schedule_public")
    .select("weekday, topic, starts_at_time, ends_at_time, host_name")
    .order("weekday");

  if (error) throw new Error(`Could not load LIVE schedule: ${error.message}`);

  return data.map((slot) => ({
    weekday: slot.weekday!,
    topic: slot.topic,
    startsAt: slot.starts_at_time!.slice(0, 5),
    endsAt: slot.ends_at_time!.slice(0, 5),
    hostName: slot.host_name,
  }));
}
