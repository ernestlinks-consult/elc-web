import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ThankYou } from "@/components/forms/ThankYou";
import { getSiteShell } from "@/lib/content/shell";
import { getLeadSession } from "@/lib/leads/session";
import { getThankYouDetails } from "@/lib/leads/thank-you";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ ref?: string | string[] }> };

/** ?ref= is display text only. Nothing is ever looked up from it. */
function displayRef(value: string | string[] | undefined) {
  return typeof value === "string" && /^ELC-[A-Z]{2}-\d+$/.test(value)
    ? value
    : null;
}

async function Details({
  searchParams,
  whatsappNumber,
}: PageProps & { whatsappNumber: string }) {
  // The session check reads the clock, so it must wait for a real request.
  await connection();
  const session = await getLeadSession();
  const details = session ? await getThankYouDetails(session.leadId) : null;

  if (!details) {
    return (
      <ThankYou
        headingLevel="h1"
        whatsappNumber={whatsappNumber}
        ref_={displayRef((await searchParams).ref)}
      />
    );
  }

  return (
    <ThankYou
      headingLevel="h1"
      whatsappNumber={whatsappNumber}
      ref_={details.ref}
      ownerFirstName={details.ownerFirstName}
      replyPromise={details.replyPromise}
      nextSteps={details.nextSteps}
    />
  );
}

export default async function Page({ searchParams }: PageProps) {
  const { whatsappNumber } = await getSiteShell();

  return (
    <div className="bg-blue-tint">
      <div className="container py-12">
        <div className="max-w-200 overflow-hidden rounded-xl border border-line bg-surface">
          <Suspense
            fallback={
              <ThankYou headingLevel="h1" whatsappNumber={whatsappNumber} />
            }
          >
            <Details
              searchParams={searchParams}
              whatsappNumber={whatsappNumber}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
