import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  isUuid,
  leadStatuses,
  pageSize,
  searchFilter,
  type LeadFilters,
} from "./filters";
import { startOfToday } from "./time";

// Every query uses the signed-in person's session, so RLS decides what they see.

type Client = Awaited<ReturnType<typeof createClient>>;

function leadsQuery(
  supabase: Client,
  filters: LeadFilters,
  staffId: string,
  options: { count?: "exact"; head?: boolean } = {},
) {
  let query = supabase.from("leads_inbox").select("*", options);

  if (filters.service !== "all") query = query.eq("service_key", filters.service);
  if (filters.owner === "mine") query = query.eq("owner_id", staffId);
  else if (filters.owner === "unassigned") query = query.is("owner_id", null);
  else if (filters.owner !== "all") query = query.eq("owner_id", filters.owner);

  const search = searchFilter(filters.q);
  if (search) query = query.or(search);

  return query;
}

export async function getInbox(filters: LeadFilters, staffId: string) {
  const supabase = await createClient();

  let rows = leadsQuery(supabase, filters, staffId, { count: "exact" });
  if (filters.status !== "all") rows = rows.eq("status", filters.status);

  const from = (filters.page - 1) * pageSize;
  const [{ data, count, error }, ...counts] = await Promise.all([
    rows.order("created_at", { ascending: false }).range(from, from + pageSize - 1),
    leadsQuery(supabase, filters, staffId, { count: "exact", head: true }),
    ...leadStatuses.map((status) =>
      leadsQuery(supabase, filters, staffId, { count: "exact", head: true }).eq(
        "status",
        status,
      ),
    ),
  ]);

  if (error) throw new Error(`Could not load leads: ${error.message}`);

  const [all, ...byStatus] = counts.map((result) => result.count ?? 0);

  return {
    leads: data,
    total: count ?? 0,
    counts: {
      all,
      ...Object.fromEntries(leadStatuses.map((status, index) => [status, byStatus[index]])),
    } as Record<LeadFilters["status"], number>,
  };
}

/** One page at a time, for the CSV export. */
export async function getLeadsForExport(
  filters: LeadFilters,
  staffId: string,
  from: number,
  size: number,
) {
  const supabase = await createClient();

  let query = leadsQuery(supabase, filters, staffId);
  if (filters.status !== "all") query = query.eq("status", filters.status);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + size - 1);

  if (error) throw new Error(`Could not export leads: ${error.message}`);
  return data;
}

export async function getStaffOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, full_name, email")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(`Could not load staff: ${error.message}`);
  return data.map(({ id, full_name }) => ({ id, name: full_name }));
}

export async function getServiceOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("key, name")
    .order("sort_order");

  if (error) throw new Error(`Could not load services: ${error.message}`);
  return data;
}

export async function getLeadDetail(id: string) {
  if (!isUuid(id)) return null;

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads_inbox")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lead) return null;

  const [steps, events, notifications] = await Promise.all([
    supabase
      .from("lead_steps")
      .select("step_index, step_key, version, answers")
      .eq("lead_id", id),
    supabase
      .from("lead_events")
      .select("id, type, data, created_at, staff:actor_id (full_name)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("id, channel, template, status, attempts, last_error, sent_at, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    lead,
    steps: steps.data ?? [],
    events: events.data ?? [],
    notifications: notifications.data ?? [],
  };
}

export type LeadDetail = NonNullable<Awaited<ReturnType<typeof getLeadDetail>>>;

export async function getDashboard(now: Date) {
  const supabase = await createClient();
  const inbox = () =>
    supabase.from("leads_inbox").select("*", { count: "exact", head: true });

  const [today, waiting, overdue, newest] = await Promise.all([
    inbox().gte("created_at", startOfToday(now)),
    inbox().eq("status", "new"),
    inbox().eq("overdue", true),
    supabase
      .from("leads_inbox")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (newest.error) throw new Error(`Could not load the dashboard: ${newest.error.message}`);

  return {
    newToday: today.count ?? 0,
    waiting: waiting.count ?? 0,
    overdue: overdue.count ?? 0,
    newest: newest.data,
  };
}

export async function getMessages(status: "new" | "handled", page: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const counted = (value: string) =>
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("status", value);

  const [{ data, error }, newCount, handledCount] = await Promise.all([
    supabase
      .from("messages")
      .select("*, staff:assigned_to (full_name)")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1),
    counted("new"),
    counted("handled"),
  ]);

  if (error) throw new Error(`Could not load messages: ${error.message}`);

  return {
    messages: data,
    counts: { new: newCount.count ?? 0, handled: handledCount.count ?? 0 },
  };
}

export async function getSubscribers(
  filter: "active" | "unsubscribed",
  page: number,
) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;

  const base = supabase
    .from("subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });
  const { data, count, error } = await (filter === "active"
    ? base.is("unsubscribed_at", null)
    : base.not("unsubscribed_at", "is", null)
  ).range(from, from + pageSize - 1);

  if (error) throw new Error(`Could not load subscribers: ${error.message}`);
  return { subscribers: data, total: count ?? 0 };
}

export async function getSubscribersForExport(from: number, size: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("whatsapp, list, consent_at, unsubscribed_at")
    .order("created_at", { ascending: false })
    .range(from, from + size - 1);

  if (error) throw new Error(`Could not export subscribers: ${error.message}`);
  return data;
}
