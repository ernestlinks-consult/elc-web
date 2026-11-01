import type { Metadata } from "next";
import { AuthCard } from "@/components/portal/AuthCard";
import { SetPasswordForm } from "@/components/portal/SetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a password | ELC staff portal",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthCard
      title="Choose a password"
      intro="You'll use this with your email to sign in."
    >
      <SetPasswordForm />
    </AuthCard>
  );
}
