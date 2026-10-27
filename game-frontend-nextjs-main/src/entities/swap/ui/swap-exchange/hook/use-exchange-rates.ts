import { useMemetankProgram } from "@/contract/memetank-data-access";
import { useGetPriceSolanaUsd } from "@/shared/hooks/basic/use-get-price-solana-usd";
import { useCallback, useEffect, useMemo } from "react";

export type ExchangeRates =
  | {
      solana: { rate: number; currency: string };
      tickets: { rate: string; currency: string };
      rate_fee_percentage: number;
    }
  | {
      solana: { rate: any; currency: string };
      tickets: { rate: number; currency: string };
      rate_fee_percentage: number;
    };

export const useExchangeRates = (exchangeTo: "solana" | "tickets") => {
  const { master } = useMemetankProgram();

  const {
    data: priceSolanaUsd,
    refetch: refetchPriceSolanaUsd,
    isLoading: isLoadingPriceSolanaUsd,
  } = useGetPriceSolanaUsd();

  const data = useMemo(() => {
    if (!master.data) {
      return {
        solana: { rate: 0, currency: "USD" },
        tickets: { rate: "0", currency: "SOL" },
        rate_fee_percentage: 1.5,
      };
    }

    const ticketsBuyPrice = master.data.account.ticketBuyPrice ?? 0;
    const ticketsSellPrice = master.data.account.ticketSellPrice ?? 0;
    const solanaUsd = priceSolanaUsd ?? 0;

    return {
      solana: {
        rate: solanaUsd, // TO USD
        currency: "USD",
      },
      tickets: {
        rate:
          exchangeTo === "solana"
            ? Number(ticketsSellPrice.toFixed(6))
            : Number(ticketsBuyPrice.toFixed(6)), // TO SOLANA
        currency: "SOL",
      },
      rate_fee_percentage: 1.5,
    };
  }, [master.data, exchangeTo, priceSolanaUsd]);

  const getExchangeRates = useCallback(() => {
    master.refetch();
    refetchPriceSolanaUsd();
  }, [master, refetchPriceSolanaUsd]);

  return {
    refetch: getExchangeRates,
    refetchSolanaUsd: refetchPriceSolanaUsd,
    data,
    loading: master.isLoading || master.isRefetching || isLoadingPriceSolanaUsd,
  };
};
