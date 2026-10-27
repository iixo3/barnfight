"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";

import { cn } from "@/shared/utils";
import { cva, VariantProps } from "class-variance-authority";
import Icon from "../icon/icon";

const Accordion = AccordionPrimitive.Root;

const accordionItemVariants = cva("", {
  variants: {
    variant: {
      default: "border-b",
      secondary: "border-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionTriggerVariants = cva(
  "flex flex-1 items-center justify-between transition-all [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:fill-white",
  {
    variants: {
      variant: {
        default: "py-4 text-sm font-medium hover:underline",
        secondary: cn(
          "h-[36px] px-5 rounded-lg handjet-bold-16 [&>svg]:hover:fill-text-highlight",
          "bg-component-highlight hover:bg-component-highlight",
          "border border-stroke-main hover:border-text-highlight [&[data-state=open]]:border-white",
          "text-text-secondary hover:text-text-highlight [&[data-state=open]]:text-white"
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> &
    VariantProps<typeof accordionItemVariants> & { variant?: string }
>(({ className, variant, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(accordionItemVariants({ variant }), className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> &
    VariantProps<typeof accordionTriggerVariants> & { variant?: string }
>(({ className, variant, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      type="button"
      ref={ref}
      className={cn(accordionTriggerVariants({ variant }), className)}
      {...props}
    >
      {children}
      {variant === "default" && (
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      )}
      {variant === "secondary" && (
        <Icon
          icon="chevron-down"
          width={17}
          height={10}
          className="fill-text-secondary"
        />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn(className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
