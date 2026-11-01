import Image from "next/image";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main
      data-portal
      className="flex flex-1 items-center justify-center bg-blue-deep p-space-4"
    >
      <div className="flex w-full max-w-110 flex-col gap-space-4 rounded-lg bg-surface p-space-6">
        <Image
          src="/brand/web-elc-logo-vertical-stack.svg"
          alt="ErnestLinks Consult"
          width={103}
          height={58}
        />
        <div className="flex flex-col gap-space-1">
          <h1 className="text-h3">{title}</h1>
          {intro && <p className="text-ink-muted">{intro}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
