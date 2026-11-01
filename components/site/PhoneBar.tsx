import { Button } from "@/components/ui";
import type { Phone } from "@/lib/site-config";

export type PhoneBarProps = {
  startHref: string;
  whatsappHref: string;
  call: Phone;
};

const secondaryClasses =
  "flex-1 rounded-md border border-line-strong px-2 whitespace-nowrap";

/**
 * Render last in the page. Sticky keeps it in the flow, so its own height is
 * the bottom padding that stops it covering the end of the page.
 */
export function PhoneBar({ startHref, whatsappHref, call }: PhoneBarProps) {
  return (
    <nav
      aria-label="Quick actions"
      className="sticky bottom-0 z-30 flex gap-space-2 border-t border-line bg-surface px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-bar phone:hidden"
    >
      <Button
        href={startHref}
        className="flex-2 rounded-md px-2 whitespace-nowrap"
      >
        Start online
      </Button>
      <Button
        href={whatsappHref}
        variant="secondary"
        className={secondaryClasses}
      >
        WhatsApp
      </Button>
      <Button
        href={`tel:${call.tel}`}
        variant="secondary"
        className={secondaryClasses}
      >
        Call
      </Button>
    </nav>
  );
}
