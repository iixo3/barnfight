import { getQueryClient } from "@/shared/utils/get-query-client";
import { useQuery } from "@tanstack/react-query";

export const useGetPriceSolanaUsd = () => {
  const queryClient = getQueryClient();

  return useQuery({
    queryKey: ["price-solana-usd"],
    queryFn: async () => {
      try {
        const response = await fetch(
          "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112"
        );
        const data = await response.json();

        const price =
          data.data["So11111111111111111111111111111111111111112"].price;

        if (!price) {
          throw new Error("Something went wrong");
        }

        return price;
      } catch (err) {
        const lastData = queryClient.getQueryData(["price-solana-usd"]);

        if (lastData && lastData !== undefined) {
          return lastData;
        } else {
          return 0;
        }
      }
    },
    placeholderData: () => queryClient.getQueryData(["price-solana-usd"]),
  });
};
