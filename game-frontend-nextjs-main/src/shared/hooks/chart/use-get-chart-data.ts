import { useQuery } from "@tanstack/react-query";

const formatData = (
  data: { date: Date | string; avg_price: number }[],
  period: "1H" | "24H" | "1W"
) => {
  if (period === "1W") {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const formattedData = data.map((item) => {
      const date = new Date(item.date);
      const dayOfWeek = date.getUTCDay();
      return {
        date: daysOfWeek[dayOfWeek],
        avg_price: item.avg_price,
      };
    });

    return daysOfWeek.map((day) => ({
      date: day,
      avg_price:
        formattedData.find((item) => item.date === day)?.avg_price || 0,
    }));
  }

  return data.map((item: any) => {
    const date = new Date(item.date);
    let formattedDate;

    if (period === "1H" || period === "24H") {
      // Format as HH:MM
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      formattedDate = `${hours}:${minutes}`;
    }
    const floatAvgPrice = parseFloat(
      Number(item.avg_price).toFixed(4)
    ).toString();

    // Return the updated object with formatted date
    return {
      date: formattedDate,
      avg_price: floatAvgPrice,
    };
  });
};

export const useGetChartData = (period: "1H" | "24H" | "1W") => {
  return useQuery({
    queryKey: ["chart", period],
    queryFn: async () => {
      const response = await fetch(`/api/chart/${period}`);
      const data = await response.json();

      return {data: formatData(data?.data || [], period), variation: parseFloat(Number(data?.variation || 0).toFixed(2))}
    },
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnReconnect: false,
  });
};
