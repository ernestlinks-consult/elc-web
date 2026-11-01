import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teaches tailwind-merge the theme in app/globals.css. Without this it reads
// text-label as a colour and drops it when text-ink follows.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display",
        "h1",
        "h2",
        "h3",
        "h4",
        "lead",
        "body",
        "body-sm",
        "label",
        "caption",
        "eyebrow",
      ],
      spacing: [
        "space-1",
        "space-2",
        "space-3",
        "space-4",
        "space-5",
        "space-6",
        "space-7",
        "space-8",
      ],
      radius: ["pill"],
      shadow: ["float", "menu", "bar", "focus-ring"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
