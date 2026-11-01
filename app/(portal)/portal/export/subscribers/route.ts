import { staffFor } from "@/lib/auth/session";
import { csvRow } from "@/lib/csv";
import { getSubscribersForExport } from "@/lib/portal/data";
import { createClient } from "@/lib/supabase/server";

const batchSize = 500;

export async function GET() {
  const staff = await staffFor(["admin", "front_desk"]);
  if (!staff) return new Response("Forbidden", { status: 403 });

  const supabase = await createClient();
  const { error } = await supabase.rpc("log_export", {
    p_table: "subscribers",
    p_filters: {},
  });
  if (error) return new Response("Could not export", { status: 500 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(csvRow(["WhatsApp", "List", "Consented", "Unsubscribed"])),
        );

        for (let from = 0; ; from += batchSize) {
          const rows = await getSubscribersForExport(from, batchSize);

          for (const row of rows) {
            controller.enqueue(
              encoder.encode(
                csvRow([row.whatsapp, row.list, row.consent_at, row.unsubscribed_at]),
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
      "Content-Disposition": 'attachment; filename="elc-subscribers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
