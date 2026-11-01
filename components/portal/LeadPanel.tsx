import { Badge, Button } from "@/components/ui";
import type { Staff } from "@/lib/auth/session";
import { seesAllLeads } from "@/lib/auth/access";
import type { LeadDetail } from "@/lib/portal/data";
import { splitVersions, type AnswerGroup } from "@/lib/portal/answers";
import { statusLabels, type LeadStatus } from "@/lib/portal/filters";
import { exactTime } from "@/lib/portal/time";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { OverdueBadge, Panel, StatusBadge, TimeAgo } from "./bits";
import {
  LeadNoteForm,
  LeadOwnerControl,
  LeadStatusControl,
  ResendSmsButton,
} from "./LeadControls";

type Event = LeadDetail["events"][number];

function eventText(event: Event, names: Map<string, string>) {
  const data = (event.data ?? {}) as Record<string, string | number | null>;
  const status = (value: unknown) =>
    statusLabels[value as LeadStatus] ?? String(value);

  switch (event.type) {
    case "created":
      return "Saved step 1 on the website";
    case "step_saved":
      return `Saved step ${Number(data.step_index) + 1}`;
    case "completed":
      return "Finished all steps";
    case "status_changed":
      return `Status changed: ${status(data.from)} to ${status(data.to)}`;
    case "assigned":
      return data.to
        ? `Assigned to ${names.get(String(data.to)) ?? "a staff member"}`
        : "Unassigned";
    case "note":
      return String(data.text);
    case "sms_sent":
      return "Acknowledgement SMS sent";
    case "email_sent":
      return "Email sent";
    case "resubmitted":
      return `Submitted again from another session (version ${data.submission})`;
    default:
      return event.type;
  }
}

function Answers({ groups }: { groups: AnswerGroup[] }) {
  return groups.map((group, index) => (
    <div key={`${group.title}-${index}`} className="flex flex-col gap-1">
      <h3 className="text-label font-bold">{group.title}</h3>
      {group.rows.length > 0 ? (
        <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-space-3 gap-y-1 text-body-sm">
          {group.rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-body-sm text-ink-muted">Nothing filled in.</p>
      )}
    </div>
  ));
}

const notificationLabels: Record<string, string> = {
  "sms.lead_ack": "Acknowledgement SMS",
  "email.owner_new_lead": "Email to owner",
  "email.owner_sms_failed": "Email: SMS failed",
};

const statusTones = {
  sent: "success",
  pending: "warning",
  sending: "warning",
  failed: "new",
} as const;

export function LeadPanel({
  detail,
  staff,
  owners,
  now,
}: {
  detail: LeadDetail;
  staff: Staff;
  owners: { id: string; name: string }[];
  now: Date;
}) {
  const { lead, steps, events, notifications } = detail;
  const id = lead.id!;
  const { latest, earlier } = splitVersions(lead.service_key!, steps);
  const names = new Map(owners.map((owner) => [owner.id, owner.name]));
  const firstName = lead.full_name!.split(" ")[0];
  const whatsappHref = buildWhatsAppLink(lead.whatsapp!, {
    message: `Hi ${firstName}, this is ${staff.firstName} from ErnestLinks Consult, about your request ${lead.ref}.`,
  });
  const canManage = seesAllLeads(staff.role);

  const attribution = (
    [
      ["Started from", lead.source_page],
      ["Referrer", lead.referrer],
      ["UTM source", lead.utm_source],
      ["UTM medium", lead.utm_medium],
      ["UTM campaign", lead.utm_campaign],
      ["Heard about us", lead.heard_from],
    ] as const
  ).filter(([, value]) => value);

  return (
    <div className="flex min-w-0 flex-col gap-space-3">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-space-2">
          <div className="min-w-0">
            <h2 className="text-h3 break-words">{lead.full_name}</h2>
            <p className="text-ink-muted">
              {lead.ref} · {lead.service_name}
            </p>
          </div>
          <span className="flex flex-wrap gap-1">
            <StatusBadge status={lead.status!} />
            {lead.overdue && <OverdueBadge />}
          </span>
        </div>
        <div className="flex flex-wrap gap-space-2">
          <Button href={whatsappHref}>WhatsApp {lead.whatsapp}</Button>
          <Button href={`tel:${lead.whatsapp}`} variant="secondary">
            Call
          </Button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-space-3">
          <LeadStatusControl leadId={id} status={lead.status as LeadStatus} />
          {canManage && (
            <LeadOwnerControl leadId={id} ownerId={lead.owner_id} staff={owners} />
          )}
        </div>
        {lead.closed_reason && (
          <p className="text-body-sm">
            <strong>Reason closed:</strong> {lead.closed_reason}
          </p>
        )}
        <p className="text-body-sm text-ink-muted">
          Best time: {lead.best_time} · Received {exactTime(lead.created_at!)}
          {lead.first_reply_at && ` · First reply ${exactTime(lead.first_reply_at)}`}
        </p>
      </Panel>

      <Panel>
        <h2 className="text-h4">
          Form answers ({lead.steps_completed} of {lead.steps_total}
          {lead.is_partial ? ", partial" : ""})
        </h2>
        <Answers groups={latest} />
        {earlier.length > 0 && (
          <details className="flex flex-col gap-space-2">
            <summary className="flex min-h-11 cursor-pointer items-center font-bold text-blue">
              Earlier submission
            </summary>
            <Answers groups={earlier} />
          </details>
        )}
      </Panel>

      {attribution.length > 0 && (
        <Panel>
          <h2 className="text-h4">Where they came from</h2>
          <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-space-3 gap-y-1 text-body-sm">
            {attribution.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-ink-muted">{label}</dt>
                <dd className="break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      )}

      <Panel>
        <h2 className="text-h4">Messages</h2>
        {notifications.length > 0 ? (
          <ul className="flex flex-col gap-space-2">
            {notifications.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-space-2 text-body-sm"
              >
                <span>{notificationLabels[item.template] ?? item.template}</span>
                <Badge tone={statusTones[item.status]}>{item.status}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-ink-muted">No messages yet.</p>
        )}
        {canManage && <ResendSmsButton leadId={id} />}
      </Panel>

      <Panel>
        <h2 className="text-h4">Timeline</h2>
        <LeadNoteForm leadId={id} />
        <ol aria-label="Timeline" className="flex flex-col gap-space-2">
          {events.map((event) => (
            <li key={event.id} className="text-body-sm">
              <span className="break-words">{eventText(event, names)}</span>{" "}
              <span className="text-ink-muted">
                · {event.staff?.full_name ?? "System"} ·{" "}
                <TimeAgo value={event.created_at} now={now} />
              </span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
