type WhatsAppLinkOptions = {
  message?: string;
  /** Campaign keyword in capitals, e.g. PASSPORT. Sent after the message. */
  keyword?: string;
};

/** Builds a wa.me link. `number` may include +, spaces or dashes. */
export function buildWhatsAppLink(
  number: string,
  { message, keyword }: WhatsAppLinkOptions = {},
) {
  const digits = number.replace(/\D/g, "");
  const text = [message, keyword].filter(Boolean).join(" ");

  return text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`;
}
