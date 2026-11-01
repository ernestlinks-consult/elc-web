"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export const Tabs = RadixTabs.Root;

export const TabsList = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixTabs.List>
>(function TabsList({ className, ...rest }, ref) {
  return (
    <RadixTabs.List
      {...rest}
      ref={ref}
      className={cn("flex flex-wrap gap-space-2", className)}
    />
  );
});

export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  return (
    <RadixTabs.Trigger
      {...rest}
      ref={ref}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-line-strong bg-surface px-space-4 text-body-sm font-semibold text-ink",
        "data-[state=active]:border-blue data-[state=active]:bg-blue data-[state=active]:text-on-blue",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-ink-muted",
        className,
      )}
    />
  );
});

export const TabsContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(function TabsContent({ className, ...rest }, ref) {
  return (
    <RadixTabs.Content
      {...rest}
      ref={ref}
      className={cn("rounded-md pt-space-4", className)}
    />
  );
});
