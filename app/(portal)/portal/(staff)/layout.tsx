import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { PortalNav } from "@/components/portal/PortalNav";
import { Skeleton, ToastProvider, Toaster } from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ELC staff portal",
  robots: { index: false, follow: false },
};

async function Nav() {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { count } = await supabase
    .from("leads_inbox")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <PortalNav
      fullName={staff.fullName}
      role={staff.role}
      newLeads={count ?? 0}
    />
  );
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div
        data-portal
        className="flex flex-1 bg-blue-tint max-phone:flex-col"
      >
        <Suspense
          fallback={<Skeleton className="w-62 shrink-0 rounded-none max-phone:h-15 max-phone:w-full" />}
        >
          <Nav />
        </Suspense>
        <main
          id="main"
          className="flex min-w-0 flex-1 flex-col gap-space-4 p-space-5 max-phone:p-space-3"
        >
          {children}
        </main>
      </div>
      <Toaster />
    </ToastProvider>
  );
}
