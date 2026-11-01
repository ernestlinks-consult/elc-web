import { afterEach, beforeEach, expect, test, vi } from "vitest";

const settings = vi.hoisted(() => ({
  contacts: {
    phones: [{ display: "+233 11 111 1111", tel: "+233111111111" }],
    hotline: { display: "032 000 0000", tel: "+233320000000" },
    whatsapp_number: "+233111111111",
    whatsapp_default_message: "HI",
    whatsapp_channel_url: "https://example.test/channel",
    email: "test@example.test",
  },
  hours: { office: "From the database", ceo_consultations: "Mondays" },
  reply_promise: "Soon",
  booking_url: "https://example.test/book",
  offices: [{ name: "Database office", address: "Kumasi", map_url: "https://example.test/map" }],
  socials: [{ label: "TikTok", url: "https://example.test/tiktok" }],
  live_note: { note: "Database LIVE", url: "https://example.test/live", host_rotation: "Rotating" },
}));

const content = vi.hoisted(() => ({
  getSettings: vi.fn(),
  getServices: vi.fn(),
  getLiveSchedule: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/content/settings", () => ({
  getSettings: content.getSettings,
  getLiveSchedule: content.getLiveSchedule,
}));
vi.mock("@/lib/content/services", () => ({
  getServices: content.getServices,
}));

const { getSiteShell } = await import("@/lib/content/shell");

const slot = { startsAt: "12:00", endsAt: "14:00", hostName: null };

beforeEach(() => {
  content.getSettings.mockResolvedValue(settings);
  content.getLiveSchedule.mockResolvedValue([
    { ...slot, weekday: 1, topic: null },
    { ...slot, weekday: 2, topic: null },
  ]);
  content.getServices.mockResolvedValue([
    { key: "passport", name: "Passports", slug: "passports", shortDescription: "New", whatsappKeyword: "PASSPORT" },
    { key: "birth", name: "Birth", slug: "birth-certificates", shortDescription: "Birth", whatsappKeyword: "BIRTH CERT" },
  ]);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

test("builds the shell from database values", async () => {
  const shell = await getSiteShell();

  expect(shell.hours.office).toBe("From the database");
  expect(shell.phones[0].tel).toBe("+233111111111");
  expect(shell.offices[0]).toEqual({
    name: "Database office",
    address: "Kumasi",
    mapUrl: "https://example.test/map",
  });
  expect(shell.whatsappHref).toBe("https://wa.me/233111111111?text=HI");
  expect(shell.live).toMatchObject({ note: "Database LIVE", startsAt: "12:00", endsAt: "14:00" });
});

test("empty LIVE topics stay null, so none render", async () => {
  expect((await getSiteShell()).live.topics).toBeNull();
});

test("birth certificates get no menu link of their own", async () => {
  const shell = await getSiteShell();
  const menu = shell.nav.main.find((item) => item.type === "menu");

  expect(menu?.type === "menu" && menu.links.map((link) => link.href)).toEqual([
    "/services/passports",
  ]);
});

test("in development a database failure warns and falls back", async () => {
  vi.stubEnv("NODE_ENV", "development");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  content.getSettings.mockRejectedValue(new Error("connection refused"));

  const shell = await getSiteShell();

  expect(shell.hours.office).toBe("Mon–Fri, 8:00–17:00");
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining("database unavailable"),
    "connection refused",
  );
});

test("in production a database failure stops loudly", async () => {
  vi.stubEnv("NODE_ENV", "production");
  content.getServices.mockRejectedValue(new Error("connection refused"));

  await expect(getSiteShell()).rejects.toThrow("connection refused");
});
