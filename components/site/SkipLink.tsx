export type SkipLinkProps = {
  targetId?: string;
};

export function SkipLink({ targetId = "main" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-md bg-surface px-space-4 py-space-3 text-label focus:not-sr-only focus:absolute focus:top-space-2 focus:left-space-2 focus:z-50"
    >
      Skip to main content
    </a>
  );
}
