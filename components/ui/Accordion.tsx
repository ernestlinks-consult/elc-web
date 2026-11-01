"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "./icons";

export type AccordionHeadingLevel = 2 | 3 | 4;

const HeadingLevelContext = createContext<AccordionHeadingLevel>(3);

export type AccordionProps = ComponentPropsWithoutRef<
  typeof RadixAccordion.Root
> & {
  /** Heading level of every trigger; match the page's outline. */
  headingLevel?: AccordionHeadingLevel;
};

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion({ headingLevel = 3, ...rest }, ref) {
    return (
      <HeadingLevelContext.Provider value={headingLevel}>
        <RadixAccordion.Root {...rest} ref={ref} />
      </HeadingLevelContext.Provider>
    );
  },
);

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
  const Heading = `h${useContext(HeadingLevelContext)}` as const;

  return (
    <RadixAccordion.Header asChild>
      <Heading>
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
      </Heading>
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
