import { LeadsTable } from "@/components/portal/LeadsTable";
import { PageHeader, Panel } from "@/components/portal/bits";
import { Button, EmptyState } from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { getDashboard } from "@/lib/portal/data";
import { greeting } from "@/lib/portal/time";

function Kpi({ label, value, urgent }: { label: string; value: number; urgent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-space-4">
      <span className="text-body-sm text-ink-muted">{label}</span>
      <span className={`text-h2 ${urgent && value > 0 ? "text-red-text" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default async function DashboardPage() {
  const staff = await requireStaff();
  const now = new Date();
  const { newToday, waiting, overdue, newest } = await getDashboard(now);

  return (
    <>
      <PageHeader title={`${greeting(now)}, ${staff.firstName}`} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-space-3">
        <Kpi label="New leads today" value={newToday} />
        <Kpi label="Waiting for first reply" value={waiting} />
        <Kpi label="Overdue" value={overdue} urgent />
      </div>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-space-2">
          <h2 className="text-h4">Newest leads</h2>
          <Button href="/portal/leads" variant="ghost">
            Open leads
          </Button>
        </div>
        {newest.length > 0 ? (
          <LeadsTable leads={newest} now={now} caption="Five newest leads" />
        ) : (
          <EmptyState
            message="No leads yet. New ones will appear here."
            action={<Button href="/portal/leads">Open leads</Button>}
          />
        )}
      </Panel>
    </>
  );
}
