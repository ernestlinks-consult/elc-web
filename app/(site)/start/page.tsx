import type { Metadata } from "next";
import { StartPage } from "@/components/forms/StartPage";
import { defaultService } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Start your application online",
  description:
    "Tell us the basics in under a minute and we’ll message you on WhatsApp. No call needed, no payment to start.",
};

// next.config.ts sends /start?service=visa to /start/visa, so every tab is a
// complete static page that also works without JavaScript.
export default function Page() {
  return <StartPage service={defaultService} />;
}
