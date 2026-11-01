import { normalizePhone } from "@/lib/forms/phone";
import type { StaffRole } from "@/lib/auth/access";
import { seesAllLeads } from "@/lib/auth/access";

export const leadStatuses = ["new", "contacted", "started", "paid", "closed"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  started: "Started",
  paid: "Paid",
  closed: "Closed",
};

export const pageSize = 25;

export type LeadFilters = {
  status: LeadStatus | "all";
  service: string;
  owner: string;
  q: string;
  page: number;
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

export const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function parsePage(value: string | string[] | undefined) {
  const page = Number(first(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function parseLeadFilters(params: Params, role: StaffRole): LeadFilters {
  const status = first(params.status);
  const owner = first(params.owner);

  return {
    status: leadStatuses.includes(status as LeadStatus)
      ? (status as LeadStatus)
      : "all",
    service: first(params.service) || "all",
    owner:
      owner === "all" || owner === "mine" || owner === "unassigned" || isUuid(owner)
        ? owner
        : seesAllLeads(role)
          ? "all"
          : "mine",
    q: first(params.q).trim().slice(0, 100),
    page: parsePage(params.page),
  };
}

/** A PostgREST or() filter for name, reference and phone. */
export function searchFilter(query: string) {
  const term = query.replace(/[,()*%\\:"]/g, " ").trim();
  if (!term) return null;

  const conditions = [
    `full_name.ilike."*${term}*"`,
    `ref.ilike."*${term}*"`,
  ];

  // 024 000 0000 and +233 24 000 0000 both find the stored +233240000000. Only a
  // search with no letters is a phone: the digits in a reference are not.
  if (!/[a-z]/i.test(term)) {
    const digits = normalizePhone(term)?.slice(1) ?? term.replace(/\D/g, "");
    if (digits.length >= 3) conditions.push(`whatsapp.ilike."*${digits}*"`);
  }

  return conditions.join(",");
}

export function filterParams(filters: LeadFilters, changes: Partial<LeadFilters>) {
  const merged = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();

  if (merged.status !== "all") params.set("status", merged.status);
  if (merged.service !== "all") params.set("service", merged.service);
  params.set("owner", merged.owner);
  if (merged.q) params.set("q", merged.q);
  if (merged.page > 1) params.set("page", String(merged.page));

  return params;
}
