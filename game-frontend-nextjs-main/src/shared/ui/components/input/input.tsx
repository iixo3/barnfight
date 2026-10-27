import * as React from "react";

import { cn } from "@/shared/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "variant">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftText?: string;
  rightText?: string;
}

const inputVariants = cva(
  "flex w-full bg-transparent transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-component-main text-white hover:bg-component-highlight placeholder:text-text-secondary",
        default_unhover:
          "bg-component-main text-white placeholder:text-text-secondary focus-visible:ring-0",
        error:
          "bg-component-main text-white hover:bg-component-highlight placeholder:text-text-secondary border border-brand-gradient-red-1",
        swap: "bg-transparent text-white hover:bg-transparent placeholder:text-white focus-visible:ring-0 focus:ring-0 text-right",
      },
      size: {
        default: "h-9 rounded-lg px-[13px] aeonik-light-13",
        secondary: "h-9 rounded-xl px-3 handjet-bold-16",
        lg: "h-10 rounded-lg px-[13px] aeonik-light-13",
        rounded: "h-9 rounded-[20px] px-3",
        swap: "h-5 px-2 handjet-bold-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      leftIcon,
      rightIcon,
      leftText,
      rightText,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative flex items-center">
        {leftText && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-white handjet-bold-16",
              props.disabled && "opacity-50"
            )}
          >
            {leftText}
          </span>
        )}
        {leftIcon && (
          <div
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2",
              props.disabled && "opacity-50"
            )}
          >
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size, className }),
            rightIcon && "pr-10",
            leftIcon && "pl-9",
            leftText && "pl-5",
            rightText && "pr-6"
          )}
          ref={ref}
          {...props}
        />
        {rightText && (
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-white handjet-bold-16",
              props.disabled && "opacity-50"
            )}
          >
            {rightText}
          </span>
        )}
        {rightIcon && (
          <div
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              props.disabled && "opacity-50"
            )}
          >
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
