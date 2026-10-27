import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";

const buttonVariants = cva(
  "inline-flex items-center group duration-300 justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-0 focus:ring-transparent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-component-main text-text-secondary hover:bg-component-highlight",
        default_active: "bg-component-highlight text-white border border-white",
        default_outlined:
          "bg-component-main text-text-secondary border border-text-secondary hover:border-white",
        default_group_hovered:
          "bg-component-main text-text-secondary hover:bg-component-highlight group-hover:bg-component-highlight",

        solid: "bg-background text-white",

        highlight: "bg-component-highlight text-text-highlight",

        action:
          "bg-gradient-to-b from-brand-gradient-red-1 to-brand-gradient-red-2",
        action_outlined:
          "bg-gradient-to-b from-brand-gradient-red-1 to-brand-gradient-red-2 border border-text-main",
        action_secondary:
          "bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 text-black",

        ghosted: "bg-transparent",

        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "bg-transparent border border-component-highlight text-text-secondary",
        outline_secondary: "border border-text-secondary text-text-secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        link_ghosted: "text-text-secondary bg-transparent hover:text-white",
        link_action:
          "bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 bg-clip-text text-transparent",
        link_action_secondary:
          "bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 bg-clip-text text-transparent",
      },
      size: {
        default: "h-[44px] px-8 rounded-xl !handjet-bold-14",
        secondary: "h-[36px] px-5 rounded-lg !handjet-bold-16",
        icon: "w-auto h-auto rounded-none",
        icon_padding: "w-auto h-auto p-1 rounded-none",
        outer_icon: "h-[36px] w-[36px] rounded-lg",
        sidebar_left:
          "px-[7px] h-[49px] rounded-tr-md rounded-br-md rounded-bl-[0px] rounded-tl-[0px]",
        sidebar_right:
          "px-[7px] h-[49px] rounded-tr-[0px] rounded-br-[0px] rounded-bl-md rounded-tl-md",
        sidebar_trigger:
          "px-[3px] md-game:px-[7px] h-[49px] rounded-tl-none rounded-bl-none md-game:rounded-tl-md md-game:rounded-bl-md rounded-tr-md rounded-br-md",
        link: "w-auto h-auto rounded-none",
        xxs: "h-5 px-2 rounded-[5px] handjet-bold-13",
        rounded_md: "w-10 h-10 rounded-full",

        xs: "h-[28px] rounded-[14px] handjet-bold-16 text-center px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
