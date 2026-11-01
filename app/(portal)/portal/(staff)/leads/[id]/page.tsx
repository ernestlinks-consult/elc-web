import { notFound } from "next/navigation";
import { LeadPanel } from "@/components/portal/LeadPanel";
import { Button } from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { getLeadDetail, getStaffOptions } from "@/lib/portal/data";

type PageProps = { params: Promise<{ id: string }> };

export default async function LeadPage({ params }: PageProps) {
  const staff = await requireStaff();
  const { id } = await params;

  // RLS hides other people's leads, so "not yours" and "missing" look the same.
  const detail = await getLeadDetail(id);
  if (!detail) notFound();

  return (
    <>
      <div className="flex items-center justify-between gap-space-2">
        <h1 className="sr-only">Lead {detail.lead.ref}</h1>
        <Button href="/portal/leads" variant="ghost">
          Back to leads
        </Button>
      </div>
      <div className="max-w-200">
        <LeadPanel
          detail={detail}
          staff={staff}
          owners={await getStaffOptions()}
          now={new Date()}
        />
      </div>
    </>
  );
}
