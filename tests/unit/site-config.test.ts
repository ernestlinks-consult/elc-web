import { expect, test } from "vitest";
import { getSiteConfig } from "@/lib/site-config";

test("lists the main line first, then the second line and the hotline", async () => {
  const { phones, hotline, whatsappNumber } = await getSiteConfig();

  expect(phones).toEqual([
    { display: "+233 53 778 3166", tel: "+233537783166" },
    { display: "+233 20 401 0168", tel: "+233204010168" },
  ]);
  expect(hotline).toEqual({ display: "032 229 1161", tel: "+233322291161" });
  expect(whatsappNumber).toBe(phones[0].tel);
});

test("has the confirmed LIVE slot and no topics yet", async () => {
  const { live } = await getSiteConfig();

  expect(live).toMatchObject({
    note: "Weekdays, 12–2pm on TikTok LIVE",
    startsAt: "12:00",
    endsAt: "14:00",
    timeZone: "Africa/Accra",
    topics: null,
  });
});
