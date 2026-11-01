import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/portal/AuthCard";
import { SignInForms } from "@/components/portal/SignInForms";
import { Skeleton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sign in | ELC staff portal",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  next?: string;
  blocked?: string;
  expired?: string;
}>;

async function Forms({ searchParams }: { searchParams: SearchParams }) {
  const { next, blocked, expired } = await searchParams;

  return (
    <>
      {blocked && (
        <p role="alert" className="font-bold text-red-text">
          This account can&apos;t sign in. Ask an admin for help.
        </p>
      )}
      {expired && (
        <p role="alert" className="font-bold text-red-text">
          That link has expired or was already used. Ask for a new one.
        </p>
      )}
      <SignInForms next={next} />
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthCard title="ELC staff portal">
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <Forms searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
