import { Button, EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <h1 className="text-h2">Not found</h1>
      <EmptyState
        message="This record doesn't exist, or it isn't yours to view."
        action={<Button href="/portal/leads">Back to leads</Button>}
      />
    </>
  );
}
