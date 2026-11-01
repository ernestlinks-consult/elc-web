import { MessageControls } from "@/components/portal/InboxActions";
import { PageHeader, Panel, TabLinks, TimeAgo } from "@/components/portal/bits";
import { Button, EmptyState, Pagination } from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { getMessages, getStaffOptions } from "@/lib/portal/data";
import { pageSize, parsePage } from "@/lib/portal/filters";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function MessagesPage({ searchParams }: PageProps) {
  await requireStaff(["admin", "front_desk"]);
  const params = await searchParams;
  const status = params.status === "handled" ? "handled" : "new";
  const page = parsePage(params.page);
  const now = new Date();

  const [{ messages, counts }, staff] = await Promise.all([
    getMessages(status, page),
    getStaffOptions(),
  ]);
  const totalPages = Math.max(1, Math.ceil(counts[status] / pageSize));

  return (
    <>
      <PageHeader title="Messages" />
      <TabLinks
        label="Message status"
        tabs={[
          { href: "/portal/messages", label: "New", count: counts.new, current: status === "new" },
          { href: "/portal/messages?status=handled", label: "Handled", count: counts.handled, current: status === "handled" },
        ]}
      />
      {messages.length > 0 ? (
        <ul className="flex flex-col gap-space-3">
          {messages.map((message) => (
            <li key={message.id}>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-space-2">
                  <div className="min-w-0">
                    <h2 className="text-h4 break-words">{message.full_name}</h2>
                    <p className="text-body-sm text-ink-muted">
                      {message.topic ?? "General question"} ·{" "}
                      <TimeAgo value={message.created_at} now={now} />
                      {message.email && ` · ${message.email}`}
                    </p>
                  </div>
                  <Button href={buildWhatsAppLink(message.whatsapp)} variant="secondary">
                    WhatsApp {message.whatsapp}
                  </Button>
                </div>
                <p className="break-words whitespace-pre-wrap">{message.body}</p>
                <MessageControls
                  messageId={message.id}
                  assignedTo={message.assigned_to}
                  handled={message.status === "handled"}
                  staff={staff}
                  label={message.full_name}
                />
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          message={status === "new" ? "No new messages." : "No handled messages yet."}
          action={<Button href="/portal/leads" variant="secondary">Open leads</Button>}
        />
      )}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefForPage={(next) => `/portal/messages?status=${status}&page=${next}`}
        />
      )}
    </>
  );
}
