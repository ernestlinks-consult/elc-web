"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { CloseIcon } from "./icons";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export type DialogContentProps = ComponentPropsWithoutRef<
  typeof RadixDialog.Content
> & {
  title: ReactNode;
  description?: ReactNode;
  closeLabel?: string;
};

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    { title, description, closeLabel = "Close", className, children, ...rest },
    ref,
  ) {
    // Radix warns when a dialog has no description unless this is undefined.
    const describedBy = description ? {} : { "aria-describedby": undefined };

    return (
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink/60" />
        <RadixDialog.Content
          {...describedBy}
          {...rest}
          ref={ref}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-var(--space-6))] max-w-140 -translate-x-1/2 -translate-y-1/2 flex-col gap-space-4 overflow-y-auto rounded-lg bg-surface p-space-6 shadow-menu",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-space-4">
            <RadixDialog.Title className="text-h3 text-ink">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close
              aria-label={closeLabel}
              className="-mt-space-2 -mr-space-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-blue hover:bg-blue-tint"
            >
              <CloseIcon />
            </RadixDialog.Close>
          </div>
          {description && (
            <RadixDialog.Description className="text-body text-ink-muted">
              {description}
            </RadixDialog.Description>
          )}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    );
  },
);
