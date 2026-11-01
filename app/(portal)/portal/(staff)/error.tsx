"use client";

import { Button, EmptyState } from "@/components/ui";

export default function PortalError({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      message="This page couldn't load. Check your connection and try again."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
