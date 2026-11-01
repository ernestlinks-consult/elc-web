import { describe, expect, it } from "vitest";
import { groupFaqs, matchesFaq, type FaqRow } from "@/lib/content/faq-groups";

const faq = (id: string, service_key: string | null, question = "Q", answer = "A"): FaqRow => ({
  id,
  service_key,
  question,
  answer,
});

describe("groupFaqs", () => {
  it("groups by service with General last", () => {
    const groups = groupFaqs([faq("1", null), faq("2", "visa"), faq("3", "passport")]);

    expect(groups.map(({ topic }) => topic)).toEqual(["passport", "visa", "general"]);
  });

  it("leaves out empty groups", () => {
    expect(groupFaqs([faq("1", "visa")])).toHaveLength(1);
    expect(groupFaqs([])).toEqual([]);
  });

  it("treats an unknown service as General", () => {
    expect(groupFaqs([faq("1", "other")])[0].topic).toBe("general");
  });

  it("keeps the order it was given within a group", () => {
    const [group] = groupFaqs([faq("2", "visa"), faq("1", "visa")]);

    expect(group.faqs.map(({ id }) => id)).toEqual(["2", "1"]);
  });
});

describe("matchesFaq", () => {
  const row = faq("1", "visa", "How long does a passport take?", "About one month.");

  it("searches the question and answer, ignoring case", () => {
    expect(matchesFaq(row, "PASSPORT")).toBe(true);
    expect(matchesFaq(row, "month")).toBe(true);
    expect(matchesFaq(row, "embassy")).toBe(false);
  });

  it("needs every word, in any order", () => {
    expect(matchesFaq(row, "month passport")).toBe(true);
    expect(matchesFaq(row, "month embassy")).toBe(false);
  });

  it("matches everything when the search is empty", () => {
    expect(matchesFaq(row, "")).toBe(true);
    expect(matchesFaq(row, "   ")).toBe(true);
  });
});
