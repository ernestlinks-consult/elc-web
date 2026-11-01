import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ImageOrPatternProps = {
  /** A storage path in public-images, or a full URL. Null shows the pattern. */
  path?: string | null;
  /** Required when there is an image; empty for a decorative one. */
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
};

function imageUrl(path: string) {
  return /^https?:\/\//.test(path)
    ? path
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-images/${path}`;
}

/** A real photo once ELC uploads one; until then the brand pattern, never stock. */
export function ImageOrPattern({
  path,
  alt = "",
  sizes = "(width >= 820px) 50vw, 100vw",
  priority,
  className,
  children,
}: ImageOrPatternProps) {
  return (
    <div className={cn("relative overflow-hidden bg-blue", className)}>
      {path ? (
        <Image
          src={imageUrl(path)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          data-testid="brand-pattern"
          className="absolute inset-0 bg-[url(/brand/elc-pattern-tile.webp)] bg-size-[240px] opacity-50"
        />
      )}
      {children}
    </div>
  );
}
