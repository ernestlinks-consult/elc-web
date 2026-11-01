import type { Metadata } from "next";
import { signOut } from "@/app/(portal)/portal/auth-actions";
import { AuthCard } from "@/components/portal/AuthCard";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "No access | ELC staff portal",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthCard
      title="No access"
      intro="This account isn't set up for the staff portal. If you work at ELC, ask an admin to add you."
    >
      <form action={signOut}>
        <Button type="submit" block variant="secondary">
          Sign out
        </Button>
      </form>
    </AuthCard>
  );
}
