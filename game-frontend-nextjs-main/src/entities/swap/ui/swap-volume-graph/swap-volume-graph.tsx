"use client";

import { Button } from "@/shared/ui/components/button/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/components/chart/chart";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useGetSwapVolumeGraphData } from "./hook/use-get-swap-volume-graph-data";
import { useSwap } from "../swap-exchange/hook/use-swap";

type SwapVolumeGraphProps = {};

const SwapVolumeGraph: React.FC<SwapVolumeGraphProps> = () => {
  const [selectedTime, setSelectedTime] = useState<"1H" | "24H" | "1W">("1H");
  const { chartData, decreased } = useGetSwapVolumeGraphData(selectedTime);

  const { exchangeRates } = useSwap();
  const handleTimeChange = (time: "1H" | "24H" | "1W") => {
    setSelectedTime(time);
  };

  const chartConfig = {
    desktop: {
      label: "Desktop",
    },
  } satisfies ChartConfig;

  const [threshold, setThreshold] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setThreshold(window.innerWidth >= 500 ? false : true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const ticketUsdPrice = (
    Number(exchangeRates.data.tickets.rate) *
    Number(exchangeRates.data.solana.rate)
  ).toFixed(2);

  return (
    <div className="rounded-[20px] bg-component-main flex flex-col gap-y-11 flex-1 h-full">
      <div className="px-[28px] flex-wrap pt-8 flex items-baseline justify-between gap-3">
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-baseline gap-x-3">
            <span className="handjet-bold-34 text-white">
              {ticketUsdPrice}$
            </span>
            <span className="handjet-bold-16 text-text-secondary">
              1 VOTE / {exchangeRates.data.tickets.rate} SOL
            </span>
            <span className="handjet-bold-16 bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
              ({decreased}%)
            </span>
          </div>

          <div className="aeonik-light-13 text-text-secondary">
            {new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </div>
        </div>

        <div className="bg-component-main rounded-[20px] py-[2px] px-2 flex items-center gap-x-2">
          <Button
            variant={selectedTime === "1H" ? "action" : "ghosted"}
            size="xs"
            onClick={() => handleTimeChange("1H")}
          >
            1H
          </Button>
          <Button
            variant={selectedTime === "24H" ? "action" : "ghosted"}
            size="xs"
            onClick={() => handleTimeChange("24H")}
          >
            24H
          </Button>
          <Button
            variant={selectedTime === "1W" ? "action" : "ghosted"}
            size="xs"
            onClick={() => handleTimeChange("1W")}
          >
            1W
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="pb-[28px] min-h-[330px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              accessibilityLayer
              data={chartData.data}
              margin={{
                left: 45,
                right: threshold ? -20 : 50,
                top: 10,
              }}
            >
              <defs>
                <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="70%"
                    stopColor="rgba(255, 87, 57, 0.16)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="rgba(255, 87, 57, 0.00)"
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => value}
                axisLine={{
                  stroke: "var(--text-offset)",
                  strokeWidth: 1,
                  strokeDasharray: 4,
                }}
              />
              <YAxis
                className="hidden min-[500px]:block"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={30}
                tickFormatter={(value) => {
                  if (value < 0.01) {
                    return value.toFixed(4);
                  } else if (value < 0.1) {
                    return value.toFixed(3);
                  } else {
                    return value.toFixed(2);
                  }
                }}
                domain={["dataMin", "dataMax"]}
              />
              <ChartTooltip
                isAnimationActive={false}
                cursor={false}
                formatter={(value) => {
                  return (
                    <span className="handjet-bold-18 text-white">
                      Avg Price: {Number(value).toFixed(5).toLocaleString()}
                    </span>
                  );
                }}
                trigger={threshold ? "click" : "hover"}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    hideLabel={false}
                    hideIndicator
                  />
                }
              />
              <Area
                dataKey="avg_price"
                type="linear"
                fill="url(#colorDesktop)"
                stroke="var(--brand-gradient-red-2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default React.memo(SwapVolumeGraph);
