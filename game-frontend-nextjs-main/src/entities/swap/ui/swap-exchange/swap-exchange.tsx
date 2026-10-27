"use client";

import { revalidateBalance } from "@/shared/hooks/wallet/use-get-balance";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import Loader from "@/shared/ui/components/loaders/loader";
import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";
import { cn } from "@/shared/utils";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { useSwap } from "./hook/use-swap";
import SwapExchangeHeader from "./swap-exchange-header/swap-exchange-header";
import SwapExchangeItem from "./swap-exchange-item/swap-exchange-item";

type SwapExchangeProps = {
  isAuthenticated: boolean;
  isLoadingAuthentication: boolean;
  buyTicket: {
    mutateAsync: UseMutateAsyncFunction<any, unknown, any, unknown>;
    isLoading: boolean;
  };
  sellTicket: {
    mutateAsync: UseMutateAsyncFunction<any, unknown, any, unknown>;
    isLoading: boolean;
  };
};

const SwapExchange: React.FC<SwapExchangeProps> = ({
  isAuthenticated,
  isLoadingAuthentication,
  buyTicket,
  sellTicket,
}) => {
  const {
    formMethods,
    onMaxTicket,
    onMaxSolana,
    balance,
    exchangeTo,
    exchangeRates,
    enableResume,
    transactionFee,
    minimumReceived,
    reset,
  } = useSwap();

  const isSwapped = useMemo(() => {
    return exchangeTo === "tickets";
  }, [exchangeTo]);

  const handleSwap = useCallback(() => {
    formMethods.setValue(
      "exchangeTo",
      exchangeTo === "solana" ? "tickets" : "solana"
    );
  }, [exchangeTo]);

  const handleRefreshAfterSubmited = useCallback(async () => {
    reset();
    await revalidateBalance();
  }, [reset, revalidateBalance]);

  const handleSubmit = useCallback(async () => {
    await formMethods.handleSubmit((data) => {
      if (exchangeTo == "tickets") {
        buyTicket
          .mutateAsync({
            numTickets: Number(data.tickets),
            slippage: data.slippage,
          })
          .then(() => {
            handleRefreshAfterSubmited();
          })
          .catch((err) => {});
      } else if (exchangeTo == "solana") {
        sellTicket
          .mutateAsync({
            numTickets: Number(data.tickets),
            slippage: data.slippage,
          })
          .then(() => {
            handleRefreshAfterSubmited();
          });
      }
    })();
  }, [exchangeTo]);

  // useEffect(() => {
  //   console.log(formMethods.formState.errors);
  // }, [formMethods.formState.errors]);

  if (isLoadingAuthentication) {
    return <Skeleton className="h-full w-full rounded-[20px]" />;
  }

  return (
    <div className="bg-component-main relative overflow-hidden h-full w-full rounded-[20px] flex flex-col gap-y-11 pt-6 px-5 pb-[42px]">
      {!isAuthenticated && (
        <div className="absolute z-20 backdrop-blur-sm top-0 left-0 w-full h-full bg-black/20 flex items-center justify-center">
          <span className="handjet-bold-24 text-center text-white">
            Connect your wallet <br /> to begin swapping
          </span>
        </div>
      )}

      <FormProvider {...formMethods}>
        <SwapExchangeHeader isAuthenticated={isAuthenticated} />

        <div className="flex flex-col gap-y-[30px]">
          <form
            onSubmit={
              isAuthenticated
                ? formMethods.handleSubmit(handleSubmit)
                : () => {}
            }
            className="flex flex-col gap-y-4 relative"
          >
            <SwapExchangeItem
              isSwapped={isSwapped}
              balance={balance.solana}
              type="solana"
              onMax={onMaxSolana}
              isAuthenticated={isAuthenticated}
            />

            <div className="mx-auto flex items-center justify-center">
              <Button
                type="button"
                onClick={handleSwap}
                variant="default"
                size="rounded_md"
              >
                <Icon
                  icon="arrow-down"
                  width={21}
                  height={17}
                  className="fill-text-secondary group-hover:hidden block"
                />
                <Icon
                  icon="swap-icon"
                  width={21}
                  height={17}
                  className="fill-white group-hover:block hidden"
                />
              </Button>
            </div>

            <SwapExchangeItem
              isSwapped={isSwapped}
              balance={new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(Number(balance.tickets))}
              type="ticket"
              onMax={onMaxTicket}
              isAuthenticated={isAuthenticated}
            />
          </form>

          <div className="flex items-center justify-between gap-x-2">
            <span className="handjet-bold-16 text-white">Price</span>

            <div className="flex items-center gap-x-2">
              <span className="handjet-bold-16 text-text-secondary">
                1 VOTE = {exchangeRates.data.tickets?.rate ?? 0} SOL
              </span>
              <Button
                disabled={exchangeRates.isLoading}
                onClick={exchangeRates.refetch}
                type="button"
                size="xxs"
                variant="default"
              >
                <Icon
                  icon="refresh-icon"
                  width={11}
                  height={11}
                  className={cn("fill-white", {
                    "animate-spin": exchangeRates.isLoading,
                  })}
                />
              </Button>
            </div>
          </div>
        </div>
      </FormProvider>

      <AnimatePresence>
        {enableResume && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-y-10"
          >
            <div className="border border-stroke-main rounded-xl py-5 px-4 flex flex-col gap-y-2">
              <div className="flex items-center justify-between gap-x-2">
                <span className="handjet-bold-16 text-white">
                  Minimum Received
                </span>
                <span className="handjet-bold-16 text-text-secondary">
                  {minimumReceived.minimum} {minimumReceived.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between gap-x-2">
                <span className="handjet-bold-16 text-white">Price Impact</span>
                <span className="handjet-bold-16 text-text-secondary">
                  0.1%
                </span>
              </div>

              <div className="flex items-center justify-between gap-x-2">
                <span className="handjet-bold-16 text-white">Trading Fee</span>
                <span className="handjet-bold-16 text-text-secondary">
                  {transactionFee?.fee_solana} SOL (${transactionFee?.fee_usd})
                </span>
              </div>
            </div>

            <Button
              disabled={buyTicket.isLoading || sellTicket.isLoading}
              type="button"
              onClick={
                buyTicket.isLoading || sellTicket.isLoading
                  ? () => {}
                  : handleSubmit
              }
              variant="action_secondary"
              size="default"
            >
              {buyTicket.isLoading || sellTicket.isLoading ? (
                <Loader
                  className="border-black border-t-transparent"
                  size={20}
                />
              ) : (
                "Swap"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(SwapExchange);
