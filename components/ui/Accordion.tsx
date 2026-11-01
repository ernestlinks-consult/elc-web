"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "./icons";

export const Accordion = RadixAccordion.Root;

export const AccordionItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(function AccordionItem({ className, ...rest }, ref) {
  return (
    <RadixAccordion.Item
      {...rest}
      ref={ref}
      className={cn("border-b border-line", className)}
    />
  );
});

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(function AccordionTrigger({ className, children, ...rest }, ref) {
  return (
    <RadixAccordion.Header>
      <RadixAccordion.Trigger
        {...rest}
        ref={ref}
        className={cn(
          "group flex min-h-11 w-full cursor-pointer items-center justify-between gap-space-3 rounded-sm py-space-3 text-left text-h4 text-ink",
          "disabled:cursor-not-allowed disabled:text-ink-muted",
          className,
        )}
      >
        {children}
        <ChevronDownIcon className="shrink-0 text-blue group-data-[state=open]:rotate-180" />
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
});

export const AccordionContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(function AccordionContent({ className, ...rest }, ref) {
  return (
    <RadixAccordion.Content
      {...rest}
      ref={ref}
      className={cn("pb-space-4 text-body text-ink-muted", className)}
    />
  );
});
