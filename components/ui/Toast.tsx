"use client";

import * as RadixToast from "@radix-ui/react-toast";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { CloseIcon } from "./icons";

export type ToastTone = "neutral" | "success" | "error";

export type ToastProps = ComponentPropsWithoutRef<typeof RadixToast.Root> & {
  title: string;
  description?: ReactNode;
  tone?: ToastTone;
  closeLabel?: string;
};

const toneClasses: Record<ToastTone, string> = {
  neutral: "border-line-strong bg-surface text-ink",
  success: "border-success bg-success-tint text-success",
  error: "border-red-text bg-red-tint text-red-text",
};

/** Wrap the app once; it also renders the area toasts appear in. */
export function ToastProvider({
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixToast.Provider>) {
  return (
    <RadixToast.Provider {...rest}>
      {children}
      <RadixToast.Viewport className="fixed right-0 bottom-0 z-50 flex w-full max-w-110 flex-col gap-space-3 p-space-5" />
    </RadixToast.Provider>
  );
}

export const Toast = forwardRef<HTMLLIElement, ToastProps>(function Toast(
  {
    title,
    description,
    tone = "neutral",
    closeLabel = "Dismiss",
    className,
    ...rest
  },
  ref,
) {
  return (
    <RadixToast.Root
      {...rest}
      ref={ref}
      className={cn(
        "flex items-start justify-between gap-space-3 rounded-md border p-space-4 shadow-menu",
        toneClasses[tone],
        className,
      )}
    >
      <div className="flex flex-col gap-space-1">
        <RadixToast.Title className="text-label">{title}</RadixToast.Title>
        {description && (
          <RadixToast.Description className="text-body-sm">
            {description}
          </RadixToast.Description>
        )}
      </div>
      <RadixToast.Close
        aria-label={closeLabel}
        className="-mt-space-2 -mr-space-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill"
      >
        <CloseIcon />
      </RadixToast.Close>
    </RadixToast.Root>
  );
});
