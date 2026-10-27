import { FormatType } from "@/shared/types/format-date";
import React, { useMemo, useState, useEffect } from "react";
import Countdown from "react-countdown";
import { Skeleton } from "../skeleton/skeleton";
import { cn } from "@/shared/utils";

type TimeRemainingProps = {
  dateFuture: number;
  format?: FormatType;
  customText?: (time: string) => React.ReactNode | string;
  withSkeleton?: boolean;
  skeletonClassName?: string;
  className?: string;
  completedView?: React.ReactNode;
  onCompleteTimerCallback?: () => void;
};

const TimeRemaining: React.FC<TimeRemainingProps> = React.memo(
  ({
    dateFuture,
    format = "DD,hh,mm",
    customText,
    withSkeleton = true,
    skeletonClassName,
    className,
    completedView,
    onCompleteTimerCallback,
  }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const renderer = React.useCallback(
      ({
        days,
        hours,
        minutes,
        seconds,
        completed,
      }: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        completed: boolean;
      }) => {
        const formatParts: Record<string, number> = {
          DD: days,
          hh: hours,
          mm: minutes,
          ss: seconds,
        };

        const parts = Object.entries(formatParts)
          .filter(([key]) => format.includes(key))
          .map(([key, value]) => `${completed ? 0 : value}${key[0]}`);

        return completed && completedView ? (
          completedView
        ) : customText ? (
          customText(parts?.length > 0 ? parts.join(", ") : "0m")
        ) : (
          <span className={cn("handjet-bold-14 text-text-offset", className)}>
            {parts?.length > 0 ? parts.join(", ") : "0m"}
          </span>
        );
      },
      [format]
    );

    if (!mounted && withSkeleton) {
      return <Skeleton className={cn("w-full h-[20px]", skeletonClassName)} />;
    }

    return (
      <Countdown
        date={new Date(dateFuture * 1000)}
        renderer={renderer}
        onComplete={onCompleteTimerCallback}
      />
    );
  }
);

export default TimeRemaining;
