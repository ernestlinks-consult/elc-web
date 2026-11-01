import { LeadFilterBar } from "@/components/portal/LeadFilters";
import { LeadPanel } from "@/components/portal/LeadPanel";
import { LeadsTable } from "@/components/portal/LeadsTable";
import { ExportLink, PageHeader, Panel, TabLinks } from "@/components/portal/bits";
import { Button, EmptyState, Pagination } from "@/components/ui";
import { seesAllLeads } from "@/lib/auth/access";
import { requireStaff } from "@/lib/auth/session";
import {
  getInbox,
  getLeadDetail,
  getServiceOptions,
  getStaffOptions,
} from "@/lib/portal/data";
import {
  filterParams,
  leadStatuses,
  pageSize,
  parseLeadFilters,
  statusLabels,
} from "@/lib/portal/filters";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: PageProps) {
  const staff = await requireStaff();
  const params = await searchParams;
  const filters = parseLeadFilters(params, staff.role);
  const now = new Date();

  const [{ leads, total, counts }, services, owners, panelLead] = await Promise.all([
    getInbox(filters, staff.id),
    getServiceOptions(),
    getStaffOptions(),
    typeof params.lead === "string" ? getLeadDetail(params.lead) : null,
  ]);

  const tabs = (["new", ...leadStatuses.slice(1), "all"] as const).map((status) => ({
    href: `/portal/leads?${filterParams(filters, { status })}`,
    label: status === "all" ? "All" : statusLabels[status],
    count: counts[status],
    current: filters.status === status,
  }));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title="Leads"
        actions={
          staff.role === "admin" ? (
            <ExportLink href={`/portal/export/leads?${filterParams(filters, {})}`} />
          ) : undefined
        }
      />
      <TabLinks label="Lead status" tabs={tabs} />
      <LeadFilterBar
        filters={filters}
        services={services}
        staff={owners}
        canSeeAll={seesAllLeads(staff.role)}
      />
      <div className="flex items-start gap-space-3">
        <div className="flex min-w-0 flex-1 flex-col gap-space-3">
          {leads.length > 0 ? (
            <Panel>
              <LeadsTable leads={leads} now={now} caption="Leads" />
            </Panel>
          ) : (
            <EmptyState
              message="No leads match these filters."
              action={<Button href="/portal/leads?owner=all" variant="secondary">Clear filters</Button>}
            />
          )}
          {totalPages > 1 && (
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              hrefForPage={(page) =>
                `/portal/leads?${filterParams(filters, { page })}`
              }
            />
          )}
        </div>
        {panelLead && (
          <aside
            aria-label="Lead details"
            className="w-105 shrink-0 max-[1279px]:hidden"
          >
            <LeadPanel detail={panelLead} staff={staff} owners={owners} now={now} />
          </aside>
        )}
      </div>
    </>
  );
}
