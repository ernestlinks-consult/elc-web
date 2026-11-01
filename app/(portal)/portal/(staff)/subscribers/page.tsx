import { UnsubscribeButton } from "@/components/portal/InboxActions";
import { ExportLink, PageHeader, Panel, TabLinks, TimeAgo } from "@/components/portal/bits";
import { Button, EmptyState, Pagination } from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { getSubscribers } from "@/lib/portal/data";
import { pageSize, parsePage } from "@/lib/portal/filters";

type PageProps = {
  searchParams: Promise<{ filter?: string; page?: string }>;
};

export default async function SubscribersPage({ searchParams }: PageProps) {
  await requireStaff(["admin", "front_desk"]);
  const params = await searchParams;
  const filter = params.filter === "unsubscribed" ? "unsubscribed" : "active";
  const page = parsePage(params.page);
  const now = new Date();

  const { subscribers, total } = await getSubscribers(filter, page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title="Subscribers"
        actions={
          <ExportLink href="/portal/export/subscribers" />
        }
      />
      <TabLinks
        label="Subscriber status"
        tabs={[
          { href: "/portal/subscribers", label: "Active", current: filter === "active" },
          { href: "/portal/subscribers?filter=unsubscribed", label: "Unsubscribed", current: filter === "unsubscribed" },
        ]}
      />
      {subscribers.length > 0 ? (
        <Panel>
          <ul className="flex flex-col divide-y divide-line">
            {subscribers.map((subscriber) => (
              <li
                key={subscriber.id}
                className="flex flex-wrap items-center justify-between gap-space-2 py-space-2"
              >
                <span className="flex flex-col">
                  <strong>{subscriber.whatsapp}</strong>
                  <span className="text-body-sm text-ink-muted">
                    Joined <TimeAgo value={subscriber.consent_at} now={now} />
                  </span>
                </span>
                {filter === "active" && (
                  <UnsubscribeButton
                    subscriberId={subscriber.id}
                    label={subscriber.whatsapp}
                  />
                )}
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <EmptyState
          message={
            filter === "active"
              ? "No subscribers yet. Sign-ups from the website footer appear here."
              : "Nobody has unsubscribed."
          }
          action={<Button href="/portal" variant="secondary">Back to dashboard</Button>}
        />
      )}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefForPage={(next) => `/portal/subscribers?filter=${filter}&page=${next}`}
        />
      )}
    </>
  );
}
