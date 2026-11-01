import type { NextRequest } from "next/server";
import { staffFor } from "@/lib/auth/session";
import { csvRow } from "@/lib/csv";
import { getLeadsForExport } from "@/lib/portal/data";
import { parseLeadFilters } from "@/lib/portal/filters";
import { createClient } from "@/lib/supabase/server";

const batchSize = 500;

const columns = [
  "Reference", "Name", "WhatsApp", "Service", "Owner", "Status", "Steps completed",
  "Steps total", "Partial", "Overdue", "Received", "First reply", "Closed reason",
  "Source page", "Referrer", "UTM source", "UTM medium", "UTM campaign", "Heard from",
];

export async function GET(request: NextRequest) {
  const staff = await staffFor(["admin"]);
  if (!staff) return new Response("Forbidden", { status: 403 });

  const filters = parseLeadFilters(
    Object.fromEntries(request.nextUrl.searchParams),
    staff.role,
  );

  // Logged before the data leaves, so a failed log means no export.
  const supabase = await createClient();
  const { error } = await supabase.rpc("log_export", {
    p_table: "leads",
    p_filters: { ...filters, page: undefined },
  });
  if (error) return new Response("Could not export", { status: 500 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(csvRow(columns)));

        for (let from = 0; ; from += batchSize) {
          const rows = await getLeadsForExport(filters, staff.id, from, batchSize);

          for (const lead of rows) {
            controller.enqueue(
              encoder.encode(
                csvRow([
                  lead.ref, lead.full_name, lead.whatsapp, lead.service_name,
                  lead.owner_name, lead.status, lead.steps_completed, lead.steps_total,
                  lead.is_partial ? "Yes" : "No", lead.overdue ? "Yes" : "No",
                  lead.created_at, lead.first_reply_at, lead.closed_reason,
                  lead.source_page, lead.referrer, lead.utm_source, lead.utm_medium,
                  lead.utm_campaign, lead.heard_from,
                ]),
              ),
            );
          }

          if (rows.length < batchSize) break;
        }

        controller.close();
      } catch (cause) {
        controller.error(cause);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="elc-leads.csv"',
      "Cache-Control": "no-store",
    },
  });
}
