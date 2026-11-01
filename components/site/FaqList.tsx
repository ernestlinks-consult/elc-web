"use client";

import { useState, useSyncExternalStore } from "react";
import { Field } from "@/components/ui";
import { ChevronDownIcon } from "@/components/ui/icons";
import { matchesFaq, type FaqGroup } from "@/lib/content/faq-groups";

const noSubscribe = () => () => {};

/**
 * Native details, not the Radix Accordion: Radix removes closed answers from the
 * page, and these must be in the HTML and open without JavaScript. Search hides
 * rows; the box only appears once it can work.
 */
export function FaqList({ groups }: { groups: FaqGroup[] }) {
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [search, setSearch] = useState("");

  const shown = groups
    .map((group) => ({
      ...group,
      faqs: group.faqs.filter((faq) => matchesFaq(faq, search)),
    }))
    .filter((group) => group.faqs.length > 0);

  return (
    <div className="flex max-w-200 flex-col gap-space-5">
      {hydrated && (
        <div role="search">
          <Field
            label="Search the FAQs"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}
      {shown.length === 0 && (
        <p role="status">No questions match that. Try another word, or message us.</p>
      )}
      {shown.map((group) => (
        <section key={group.topic} className="flex flex-col gap-space-2">
          <h2 className="text-h3">{group.title}</h2>
          <ul className="flex flex-col">
            {group.faqs.map((faq) => (
              <li key={faq.id} className="border-b border-line">
                <details className="group">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-space-3 py-space-3 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-body font-bold">{faq.question}</h3>
                    <ChevronDownIcon className="shrink-0 text-blue group-open:rotate-180" />
                  </summary>
                  <p className="pb-space-4 text-ink-muted">{faq.answer}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
