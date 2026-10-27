import { useGetChartData } from "@/shared/hooks/chart/use-get-chart-data";
import { useMemo } from "react";

export const useGetSwapVolumeGraphData = (
  selectedTime: "1H" | "24H" | "1W"
) => {
  const data1HPlaceholder = [
    { date: "12:00 PM", avg_price: 0.0068 },
    { date: "12:15 PM", avg_price: 0.007 },
    { date: "12:30 PM", avg_price: 0.0072 },
    { date: "12:45 PM", avg_price: 0.0071 },
    { date: "1:00 PM", avg_price: 0.0073 },
  ];

  const data24HPlaceholder = [
    { date: "2:00 PM", avg_price: 0.0065 },
    { date: "6:00 PM", avg_price: 0.0068 },
    { date: "10:00 PM", avg_price: 0.007 },
    { date: "2:00 AM", avg_price: 0.0069 },
    { date: "6:00 AM", avg_price: 0.0071 },
    { date: "10:00 AM", avg_price: 0.0072 },
    { date: "2:00 PM", avg_price: 0.0083 },
  ];

  const data1WPlaceholder = [
    { date: "Mon", avg_price: 0.0065 },
    { date: "Tue", avg_price: 0.0068 },
    { date: "Wed", avg_price: 0.007 },
    { date: "Thu", avg_price: 0.0069 },
    { date: "Fri", avg_price: 0.0071 },
    { date: "Sat", avg_price: 0.0072 },
    { date: "Sun", avg_price: 0.0073 },
  ];

  const { data: chartData } = useGetChartData(selectedTime);

  const chartDataReturn = useMemo(() => {
    if (chartData && chartData?.data?.length > 0) {
      return chartData?.data;
    }

    if (selectedTime === "1H") {
      return data1HPlaceholder;
    } else if (selectedTime === "24H") {
      return data24HPlaceholder;
    } else {
      return data1WPlaceholder;
    }
  }, [chartData, selectedTime]);

  return {
    chartData: {
      data: chartDataReturn,
      available: chartData && chartData?.data?.length > 0,
    },
    currentPrice: 1.75,
    currentPriceSol: 0.0073,
    decreased: chartData?.variation
  };
};
