import { AuthCard } from "@/components/portal/AuthCard";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <AuthCard
      title="Not found"
      intro="This record doesn't exist, or it isn't yours to view."
    >
      <Button href="/portal/leads" block>
        Back to leads
      </Button>
    </AuthCard>
  );
}
