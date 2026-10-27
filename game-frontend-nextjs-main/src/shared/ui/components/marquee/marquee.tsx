"use client";

import { cn } from "@/shared/utils";
import { useEffect, useRef, useState } from "react";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  [key: string]: any;
  gap?: string;
  duration?: number;
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  gap = "1rem",
  duration = 40,
  ...props
}: MarqueeProps) {
  const marqueeReference = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={marqueeReference}
      {...props}
      style={
        {
          width: "100%",
          "--gap": gap,
          "--duration": `${duration}s`,
        } as React.CSSProperties
      }
      className={cn(
        `group flex overflow-hidden p-2  [gap:var(--gap)]`,
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
