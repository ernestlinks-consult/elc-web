import { Badge } from "@/components/ui";
import type { LiveInfo, Phone } from "@/lib/site-config";

export type TopBarProps = {
  phones: Phone[];
  hotline: Phone;
  hours: string;
  live: Pick<LiveInfo, "note" | "url">;
};

/** Under 820px only the LIVE note stays; PhoneBar carries Call. */
export function TopBar({ phones, hotline, hours, live }: TopBarProps) {
  return (
    <aside aria-label="Contact and LIVE" className="bg-blue text-on-blue">
      <div className="container flex flex-wrap items-center justify-between gap-x-space-5 gap-y-1.5 py-2 text-body-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 max-phone:hidden">
          {phones.map((phone) => (
            <a
              key={phone.tel}
              href={`tel:${phone.tel}`}
              className="text-on-blue no-underline"
            >
              {phone.display}
            </a>
          ))}
          <a href={`tel:${hotline.tel}`} className="text-on-blue no-underline">
            Hotline {hotline.display}
          </a>
          <span>{hours}</span>
        </div>
        <a
          href={live.url}
          className="inline-flex items-center gap-space-2 font-bold text-on-blue no-underline max-phone:min-h-11"
        >
          <Badge tone="red">Live</Badge>
          {live.note}
        </a>
      </div>
    </aside>
  );
}
