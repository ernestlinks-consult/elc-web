import { Button, EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container flex flex-col gap-space-4 py-space-7">
      <h1 className="text-h1">Page not found</h1>
      <EmptyState
        message="We couldn’t find that page. Tell us what you need and we’ll help."
        action={<Button href="/start">Start online</Button>}
      />
    </div>
  );
}
