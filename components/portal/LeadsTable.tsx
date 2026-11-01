import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import { LeadLink } from "./LeadLink";
import { OverdueBadge, StatusBadge, TimeAgo } from "./bits";

export type LeadRow = {
  id: string | null;
  ref: string | null;
  full_name: string | null;
  service_name: string | null;
  owner_name: string | null;
  status: string | null;
  steps_completed: number | null;
  steps_total: number | null;
  is_partial: boolean | null;
  overdue: boolean | null;
  created_at: string | null;
};

const steps = (lead: LeadRow) =>
  `${lead.steps_completed}/${lead.steps_total}${lead.is_partial ? " · Partial" : ""}`;

/** A table from 820px, a card list below it. */
export function LeadsTable({
  leads,
  now,
  caption,
}: {
  leads: LeadRow[];
  now: Date;
  caption: string;
}) {
  return (
    <>
      <div className="max-phone:hidden">
        <Table caption={caption} captionHidden>
          <TableHead>
            <TableRow>
              <TableHeaderCell scope="col">Reference</TableHeaderCell>
              <TableHeaderCell scope="col">Name</TableHeaderCell>
              <TableHeaderCell scope="col">Service</TableHeaderCell>
              <TableHeaderCell scope="col">Owner</TableHeaderCell>
              <TableHeaderCell scope="col">Status</TableHeaderCell>
              <TableHeaderCell scope="col">Steps</TableHeaderCell>
              <TableHeaderCell scope="col">Received</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.ref}</TableCell>
                <TableCell>
                  <LeadLink id={lead.id!}>{lead.full_name}</LeadLink>
                </TableCell>
                <TableCell>{lead.service_name}</TableCell>
                <TableCell>{lead.owner_name ?? "Unassigned"}</TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1">
                    <StatusBadge status={lead.status!} />
                    {lead.overdue && <OverdueBadge />}
                  </span>
                </TableCell>
                <TableCell>{steps(lead)}</TableCell>
                <TableCell>
                  <TimeAgo value={lead.created_at!} now={now} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul aria-label={caption} className="flex flex-col gap-space-2 phone:hidden">
        {leads.map((lead) => (
          <li
            key={lead.id}
            className="flex flex-col gap-1 rounded-md border border-line bg-surface p-space-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-space-2">
              <LeadLink id={lead.id!}>{lead.full_name}</LeadLink>
              <span className="flex flex-wrap gap-1">
                <StatusBadge status={lead.status!} />
                {lead.overdue && <OverdueBadge />}
              </span>
            </div>
            <span className="text-body-sm text-ink-muted">
              {lead.ref} · {lead.service_name}
            </span>
            <span className="text-body-sm text-ink-muted">
              {lead.owner_name ?? "Unassigned"} · {steps(lead)} ·{" "}
              <TimeAgo value={lead.created_at!} now={now} />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
