import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-space-4">
      <Skeleton className="h-11 w-64" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
