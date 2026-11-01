import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import tokens from "@/design-system/tokens.json";

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

// Class names are written out in full so Tailwind can find them.
const colorClasses: Record<string, string> = {
  blue: "bg-blue",
  "blue-deep": "bg-blue-deep",
  "blue-mid": "bg-blue-mid",
  "blue-tint": "bg-blue-tint",
  "blue-tint-strong": "bg-blue-tint-strong",
  line: "bg-line",
  "line-strong": "bg-line-strong",
  "line-on-deep": "bg-line-on-deep",
  surface: "bg-surface",
  ink: "bg-ink",
  "ink-muted": "bg-ink-muted",
  "on-blue": "bg-on-blue",
  "on-blue-muted": "bg-on-blue-muted",
  red: "bg-red",
  "red-text": "bg-red-text",
  "red-tint": "bg-red-tint",
  success: "bg-success",
  "success-tint": "bg-success-tint",
  warning: "bg-warning",
  "warning-tint": "bg-warning-tint",
  "neutral-tint": "bg-neutral-tint",
};

const typeClasses: Record<string, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  lead: "text-lead",
  body: "text-body",
  "body-sm": "text-body-sm",
  label: "text-label",
  caption: "text-caption",
  eyebrow: "text-eyebrow",
};

const spacingClasses: Record<string, string> = {
  "space-1": "w-space-1",
  "space-2": "w-space-2",
  "space-3": "w-space-3",
  "space-4": "w-space-4",
  "space-5": "w-space-5",
  "space-6": "w-space-6",
  "space-7": "w-space-7",
  "space-8": "w-space-8",
};

const radiusClasses: Record<string, string> = {
  "radius-sm": "rounded-sm",
  "radius-md": "rounded-md",
  "radius-lg": "rounded-lg",
  "radius-xl": "rounded-xl",
  "radius-pill": "rounded-pill",
};

const shadowClasses: Record<string, string> = {
  "shadow-float": "shadow-float",
  "shadow-menu": "shadow-menu",
  "shadow-bar": "shadow-bar",
  "focus-ring": "shadow-focus-ring",
};

const typeStyles = tokens.type.groups.flatMap((group) => group.styles);

export default function TokensPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="container flex flex-col gap-space-7 py-space-7">
      <header className="flex flex-col gap-space-4">
        <Image
          src="/brand/web-elc-logo-vertical-stack.svg"
          alt="ErnestLinks Consult"
          width={240}
          height={136}
          loading="eager"
        />
        <h1 className="text-h1">Design tokens</h1>
        <p className="text-lead text-ink-muted">
          Generated from design-system/tokens.json. Development only.
        </p>
        <Link href="/dev/components">Component preview</Link>
      </header>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-h2">Colour</h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-space-4">
          {tokens.color.tokens.map((token) => (
            <li key={token.name} className="flex items-center gap-space-3">
              <span
                className={`size-space-7 shrink-0 rounded-sm border border-line ${colorClasses[token.name]}`}
              />
              <span className="flex flex-col">
                <span className="text-label">{token.name}</span>
                <span className="text-caption text-ink-muted">
                  {token.value.light}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-h2">Type</h2>
        <ul className="flex flex-col gap-space-5">
          {typeStyles.map((style) => (
            <li key={style.name} className="flex flex-col gap-space-1">
              <p className={typeClasses[style.name]}>
                Making impact through education
              </p>
              <p className="text-caption text-ink-muted">
                {typeClasses[style.name]} · {style.fontSize} /{" "}
                {style.lineHeight} · {style.fontWeight}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-h2">Spacing</h2>
        <ul className="flex flex-col gap-space-2">
          {tokens.spacing.tokens.map((token) => (
            <li key={token.name} className="flex items-center gap-space-3">
              <span
                className={`h-space-4 bg-blue ${spacingClasses[token.name]}`}
              />
              <span className="text-body-sm">
                {token.name} · {token.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-h2">Radius</h2>
        <ul className="flex flex-wrap gap-space-5">
          {tokens.radius.tokens.map((token) => (
            <li key={token.name} className="flex flex-col gap-space-2">
              <span
                className={`block h-space-8 w-30 border border-line-strong bg-blue-tint ${radiusClasses[token.name]}`}
              />
              <span className="text-body-sm">
                {radiusClasses[token.name]} · {token.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-h2">Shadow</h2>
        <ul className="flex flex-wrap gap-space-7">
          {tokens.shadow.tokens.map((token) => (
            <li key={token.name} className="flex flex-col gap-space-3">
              <span
                className={`block h-space-8 w-30 rounded-lg bg-surface ${shadowClasses[token.name]}`}
              />
              <span className="text-body-sm">{shadowClasses[token.name]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-h2">Layout</h2>
        <ul className="flex flex-col gap-space-2">
          {tokens.breakpoint.tokens.map((token) => (
            <li key={token.name} className="text-body-sm">
              {token.name} · {token.value}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-h2">Focus ring</h2>
        <p>Press Tab to reach these.</p>
        <div className="flex flex-wrap items-center gap-space-5">
          <button
            type="button"
            className="min-h-11 rounded-pill bg-blue px-space-5 text-label text-on-blue"
          >
            Start online
          </button>
          <a href="#top">A text link</a>
        </div>
      </section>
    </main>
  );
}
