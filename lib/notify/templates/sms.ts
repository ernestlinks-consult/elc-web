import { isPlaceholder } from "../../content/placeholder.ts";

export const smsLimit = 160;

// GSM-7 basic set. One character outside it turns the whole SMS into UCS-2, which
// cuts a segment to 70 characters and doubles the cost.
const gsm7 =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

export function isGsm7(text: string) {
  return [...text].every((character) => gsm7.includes(character));
}

/** Drops accents and any letter outside GSM-7, so one name never doubles the cost. */
function toGsm7(text: string) {
  return [...text.normalize("NFKD")]
    .filter((character) => gsm7.includes(character))
    .join("")
    .trim();
}

export type LeadAckData = {
  firstName?: string | null;
  ref: string;
  ownerFirstName?: string | null;
  replyPromise?: string | null;
};

function promiseText(replyPromise?: string | null) {
  const promise = replyPromise?.trim().replace(/\.$/, "");
  return !promise || isPlaceholder(promise) ? "soon" : toGsm7(promise);
}

export function renderLeadAck({
  firstName,
  ref,
  ownerFirstName,
  replyPromise,
}: LeadAckData) {
  const owner = toGsm7(ownerFirstName ?? "") || "Our team";
  const name = toGsm7(firstName ?? "");
  const end = (promise: string, who: string) =>
    `, thanks for contacting ErnestLinks Consult. Ref ${ref}. ${who} will message you on WhatsApp ${promise}.`;

  let tail = end(promiseText(replyPromise), owner);
  if (`Hi${tail}`.length > smsLimit) tail = end("soon", owner);
  if (`Hi${tail}`.length > smsLimit) tail = end("soon", "Our team");

  const room = smsLimit - tail.length - "Hi ".length;
  return name && room > 0 ? `Hi ${name.slice(0, room).trim()}${tail}` : `Hi${tail}`;
}
