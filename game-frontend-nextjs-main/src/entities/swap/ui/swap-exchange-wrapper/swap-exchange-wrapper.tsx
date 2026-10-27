"use client";

import React, { useMemo } from "react";
import SwapExchange from "../swap-exchange/swap-exchange";
import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";
import { useMemetankProgram } from "@/contract/memetank-data-access";

const SwapExchangeWrapper: React.FC = () => {
  const { isAuthenticated, isLoadingAuthentication } = useGetAuth();
  const { buyTicket, sellTicket } = useMemetankProgram();

  return (
    <SwapExchange
      isAuthenticated={isAuthenticated}
      isLoadingAuthentication={isLoadingAuthentication}
      buyTicket={{
        mutateAsync: buyTicket.mutateAsync,
        isLoading: buyTicket.isPending,
      }}
      sellTicket={{
        mutateAsync: sellTicket.mutateAsync,
        isLoading: sellTicket.isPending,
      }}
    />
  );
};

export default SwapExchangeWrapper;
