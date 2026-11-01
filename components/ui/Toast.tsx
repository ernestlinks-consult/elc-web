"use client";

import * as RadixToast from "@radix-ui/react-toast";
import {
  forwardRef,
  useSyncExternalStore,
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

type QueuedToast = { id: number; title: string; tone: ToastTone };

let queued: QueuedToast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function setQueue(next: QueuedToast[]) {
  queued = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Shows a toast from anywhere. Needs one <Toaster /> inside a ToastProvider. */
export function toast(title: string, tone: ToastTone = "success") {
  setQueue([...queued, { id: nextId++, title, tone }]);
}

export function Toaster() {
  const items = useSyncExternalStore(
    subscribe,
    () => queued,
    () => queued,
  );

  return items.map((item) => (
    <Toast
      key={item.id}
      title={item.title}
      tone={item.tone}
      onOpenChange={(open) => {
        if (!open) setQueue(queued.filter(({ id }) => id !== item.id));
      }}
    />
  ));
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
