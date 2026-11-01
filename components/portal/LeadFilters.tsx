"use client";

import { useRouter } from "next/navigation";
import { useRef, type FormEvent } from "react";
import { Button, Field, Select } from "@/components/ui";
import { filterParams, type LeadFilters } from "@/lib/portal/filters";

export type LeadFiltersProps = {
  filters: LeadFilters;
  services: { key: string; name: string }[];
  staff: { id: string; name: string }[];
  canSeeAll: boolean;
};

export function LeadFilterBar({
  filters,
  services,
  staff,
  canSeeAll,
}: LeadFiltersProps) {
  const router = useRouter();
  const search = useRef<HTMLInputElement>(null);

  const go = (changes: Partial<LeadFilters>) =>
    router.push(`/portal/leads?${filterParams(filters, changes)}`);

  function submit(event: FormEvent) {
    event.preventDefault();
    go({ q: search.current?.value.trim() ?? "" });
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Filter leads"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] items-end gap-space-3"
    >
      <Field
        ref={search}
        label="Search"
        name="q"
        type="search"
        placeholder="Name, phone or reference"
        defaultValue={filters.q}
        key={filters.q}
      />
      <Select
        label="Service"
        value={filters.service}
        onValueChange={(service) => go({ service })}
        options={[
          { value: "all", label: "All services" },
          ...services.map(({ key, name }) => ({ value: key, label: name })),
        ]}
      />
      {canSeeAll ? (
        <Select
          label="Owner"
          value={filters.owner}
          onValueChange={(owner) => go({ owner })}
          options={[
            { value: "all", label: "Everyone" },
            { value: "mine", label: "Mine" },
            { value: "unassigned", label: "Unassigned" },
            ...staff.map(({ id, name }) => ({ value: id, label: name })),
          ]}
        />
      ) : null}
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
