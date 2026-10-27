"use client";

import { useMemetankProgram } from "@/contract/memetank-data-access";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { useGetBalance } from "../wallet/use-get-balance";

type GetUserBalanceParams = {
  only_crypto_balance?: boolean;
};

type UseGetUserBalanceReturn = {
  solana: number | string | null;
  tickets: number | string | null;
};

const currencies_crypto: Record<"Solana" | "Tickets", string> = {
  Solana: "SOL",
  Tickets: "TICKET",
};

export const useGetUserBalance = ({
  only_crypto_balance = false,
}: GetUserBalanceParams = {}): UseGetUserBalanceReturn => {
  let pk: PublicKey | null = null;

  const query = useGetBalance();
  const { userAccount } = useMemetankProgram();

  const { data: userAccountData, isLoading: isLoadingUserAccount } =
    userAccount;

  const getBalanceSolana = useMemo(() => {
    if (Number(query.data) === 0) return 0;

    return Math.round(((query.data || 0) / LAMPORTS_PER_SOL) * 100000) / 100000;
  }, [query.data]);

  const getBalanceTickets = useMemo(() => {
    return Number(userAccountData?.account?.numberTickets || 0).toFixed(0);
  }, [userAccountData?.account?.numberTickets]);

  if (only_crypto_balance) {
    return {
      solana: getBalanceSolana ?? 0,
      tickets: getBalanceTickets ?? 0,
    };

    // switch (currency_crypto) {
    //   case "Solana":
    //     return getBalanceSolana;
    //   case "Tickets":
    //     return getBalanceTickets;
    //   default:
    //     return 0;
    // }
  }

  const balanceViewSolana = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(getBalanceSolana);

  const balanceViewTickets = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(getBalanceTickets));

  return {
    solana: `${balanceViewSolana} ${currencies_crypto.Solana ?? ""}`,
    tickets: `${balanceViewTickets} ${currencies_crypto.Tickets ?? ""}`,
  };
};
