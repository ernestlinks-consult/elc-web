import { faqTopics, isFaqTopic, type FaqTopic } from "./taxonomy";

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  service_key: string | null;
};

export type FaqGroup = { topic: FaqTopic; title: string; faqs: FaqRow[] };

const topicOf = (faq: FaqRow): FaqTopic =>
  faq.service_key && isFaqTopic(faq.service_key) ? faq.service_key : "general";

/** By service, General last. Groups with nothing are left out. */
export function groupFaqs(faqs: FaqRow[]): FaqGroup[] {
  return (Object.keys(faqTopics) as FaqTopic[])
    .map((topic) => ({
      topic,
      title: faqTopics[topic],
      faqs: faqs.filter((faq) => topicOf(faq) === topic),
    }))
    .filter((group) => group.faqs.length > 0);
}

export function matchesFaq(faq: FaqRow, search: string) {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  const text = `${faq.question} ${faq.answer}`.toLowerCase();

  return terms.every((term) => text.includes(term));
}
