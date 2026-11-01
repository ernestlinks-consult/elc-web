import { buildWhatsAppLink } from "../../whatsapp.ts";

export type RenderedEmail = { subject: string; html: string; text: string };

// Answers come from the forms, which never ask for these. This is a second lock,
// so a future form mistake still cannot reach an inbox.
const bannedKey =
  /ghana.?card|ssnit|voter|id.?number|passport.?number|upload|payment|momo|card|facilitator/i;

const hiddenKeys = new Set(["full_name", "whatsapp", "consent", "confirm"]);

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const sentenceCase = (key: string) => {
  const words = key.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const answerText = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value);

type Row = [label: string, value: string];

function layout(heading: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:24px;background:#F5F6FF;color:#0B0B1F;font-family:Arial,sans-serif;font-size:16px;line-height:1.5">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden">
<div style="background:#0505C6;color:#FFFFFF;padding:20px 24px">
<h1 style="margin:0;font-size:22px;line-height:1.3">${escapeHtml(heading)}</h1>
</div>
<div style="padding:24px">
${body}
</div>
</div>
</body>
</html>`;
}

function table(rows: Row[]) {
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><th scope="row" style="padding:6px 16px 6px 0;text-align:left;vertical-align:top;color:#4A4A68;font-weight:normal">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<table style="border-collapse:collapse;width:100%">${cells}</table>`;
}

const button = (href: string, label: string) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:999px;background:#0505C6;color:#FFFFFF;font-weight:bold;text-decoration:none">${escapeHtml(label)}</a>`;

const subheading = (text: string) =>
  `<h2 style="margin:24px 0 8px;font-size:18px">${escapeHtml(text)}</h2>`;

const textRows = (rows: Row[]) =>
  rows.map(([label, value]) => `${label}: ${value}`).join("\n");

export type OwnerNewLeadData = {
  id: string;
  ref: string;
  serviceName: string;
  fullName: string;
  whatsapp: string;
  bestTime: string;
  ownerFirstName?: string | null;
  answers: Record<string, unknown>;
  attribution: {
    sourcePage?: string | null;
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    heardFrom?: string | null;
  };
  /** Set when the lead's acknowledgement SMS has not gone out. */
  smsProblem?: string | null;
  siteUrl: string;
};

export function renderOwnerNewLead(data: OwnerNewLeadData): RenderedEmail {
  const firstName = data.fullName.split(" ")[0];
  const greeting = data.ownerFirstName
    ? `Hi ${firstName}, this is ${data.ownerFirstName} from ErnestLinks Consult, about your request ${data.ref}.`
    : `Hi ${firstName}, this is ErnestLinks Consult, about your request ${data.ref}.`;
  const whatsappHref = buildWhatsAppLink(data.whatsapp, { message: greeting });
  const portalHref = `${data.siteUrl}/portal/leads/${data.id}`;

  const details: Row[] = [
    ["Service", data.serviceName],
    ["Name", data.fullName],
    ["WhatsApp", data.whatsapp],
    ["Best time", data.bestTime],
    ...Object.entries(data.answers)
      .filter(
        ([key, value]) =>
          !hiddenKeys.has(key) &&
          key !== "best_time" &&
          !bannedKey.test(key) &&
          value !== null &&
          value !== undefined &&
          value !== "",
      )
      .map(([key, value]): Row => [sentenceCase(key), answerText(value)]),
  ];

  const { attribution: source } = data;
  const attribution = (
    [
      ["Started from", source.sourcePage],
      ["Referrer", source.referrer],
      ["UTM source", source.utmSource],
      ["UTM medium", source.utmMedium],
      ["UTM campaign", source.utmCampaign],
      ["Heard about us", source.heardFrom],
    ] as [string, string | null | undefined][]
  ).filter((row): row is Row => Boolean(row[1]));

  const warning = data.smsProblem
    ? `<p style="margin:0 0 16px;padding:12px 16px;border-radius:8px;background:#FDECEC;color:#C70404;font-weight:bold">${escapeHtml(data.smsProblem)}</p>`
    : "";

  return {
    subject: `New ${data.serviceName} lead: ${data.fullName} (${data.ref})`,
    html: layout(
      `New ${data.serviceName} lead`,
      `${warning}
<p style="margin:0 0 16px">Reference <strong>${escapeHtml(data.ref)}</strong></p>
${table(details)}
${attribution.length > 0 ? `${subheading("Where they came from")}${table(attribution)}` : ""}
<p style="margin:24px 0 0">${button(whatsappHref, "WhatsApp them")}${button(portalHref, "Open in the portal")}</p>`,
    ),
    text: [
      `New ${data.serviceName} lead, reference ${data.ref}`,
      data.smsProblem,
      textRows(details),
      attribution.length > 0
        ? `Where they came from\n${textRows(attribution)}`
        : null,
      `WhatsApp them: ${whatsappHref}`,
      `Open in the portal: ${portalHref}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export type OwnerSmsFailedData = {
  id: string;
  ref: string;
  fullName: string;
  whatsapp: string;
  siteUrl: string;
};

export function renderOwnerSmsFailed(data: OwnerSmsFailedData): RenderedEmail {
  const whatsappHref = buildWhatsAppLink(data.whatsapp);
  const portalHref = `${data.siteUrl}/portal/leads/${data.id}`;
  const message = `We could not send the acknowledgement SMS to ${data.fullName}, so they have not heard from us yet. Please message them directly.`;

  return {
    subject: `SMS failed for ${data.fullName} (${data.ref})`,
    html: layout(
      "Acknowledgement SMS failed",
      `<p style="margin:0 0 16px">${escapeHtml(message)}</p>
<p style="margin:0">${button(whatsappHref, "WhatsApp them")}${button(portalHref, "Open in the portal")}</p>`,
    ),
    text: `${message}\n\nWhatsApp them: ${whatsappHref}\nOpen in the portal: ${portalHref}`,
  };
}

export type MessageReceivedData = {
  fullName: string;
  whatsapp: string;
  email?: string | null;
  topic?: string | null;
  body: string;
};

export function renderMessageReceived(data: MessageReceivedData): RenderedEmail {
  const topic = data.topic ?? "General question";
  const rows: Row[] = [
    ["Name", data.fullName],
    ["WhatsApp", data.whatsapp],
    ...(data.email ? ([["Email", data.email]] as Row[]) : []),
    ["Topic", topic],
  ];
  const whatsappHref = buildWhatsAppLink(data.whatsapp);

  return {
    subject: `New message: ${topic} from ${data.fullName}`,
    html: layout(
      "New message from the website",
      `${table(rows)}
${subheading("Message")}
<p style="margin:0 0 24px;white-space:pre-wrap">${escapeHtml(data.body)}</p>
<p style="margin:0">${button(whatsappHref, "WhatsApp them")}</p>`,
    ),
    text: `${textRows(rows)}\n\nMessage\n${data.body}\n\nWhatsApp them: ${whatsappHref}`,
  };
}
