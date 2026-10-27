import { useGetUserBalance } from "@/shared/hooks/user/use-get-user-balance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useExchangeRates } from "./use-exchange-rates";

const schemaSwap = z.object({
  exchangeTo: z.enum(["solana", "tickets"]),
  slippage: z.number().min(0.1).max(5),
  tickets: z.coerce
    .number()
    .min(1)
    .refine((val) => val !== 0, "Value must be greater than 0")
    .transform((val) => Number(val).toFixed(0)),
  ticketsUsd: z.coerce
    .number()
    .min(0.01)
    .refine((val) => val !== 0, "Value must be greater than 0")
    .transform((val) => Number(val).toFixed(2)),
  solana: z.coerce
    .number()
    .min(0.0000001)
    .refine((val) => val !== 0, "Value must be greater than 0")
    .transform((val) => Number(val).toFixed(4)),
  solanaUsd: z.coerce
    .number()
    .min(0.01)
    .refine((val) => val !== 0, "Value must be greater than 0")
    .transform((val) => Number(val).toFixed(2)),
});

export type SwapSchemaType = z.infer<typeof schemaSwap>;

export const useSwap = () => {
  const balanaces = useGetUserBalance({
    only_crypto_balance: true,
  });

  const balanceSolana = useMemo(() => {
    return balanaces.solana || "0.0";
  }, [balanaces.solana]);

  const balanceTickets = useMemo(() => {
    return Number(balanaces.tickets) || 0;
  }, [balanaces.tickets]);

  const formMethods = useForm<SwapSchemaType>({
    mode: "all",
    defaultValues: {
      exchangeTo: "tickets",
      slippage: 0.1,
      solana: "0.0",
      tickets: "0",
      ticketsUsd: "0.0",
      solanaUsd: "0.0",
    },
    resolver: zodResolver(schemaSwap),
  });

  const solanaValue = useWatch({
    control: formMethods.control,
    name: "solana",
  });
  const ticketsValue = useWatch({
    control: formMethods.control,
    name: "tickets",
  });
  const exchangeTo = useWatch({
    control: formMethods.control,
    name: "exchangeTo",
  });
  const slippage = useWatch({
    control: formMethods.control,
    name: "slippage",
  });

  const {
    data: exchangeRates,
    loading: isLoadingExchangeRates,
    refetch: refetchExchangeRates,
    refetchSolanaUsd,
  } = useExchangeRates(exchangeTo);

  const handleChangeValueExchange = (
    value: string,
    exchangeFrom: "solana" | "tickets"
  ) => {
    const exchangeRateSol = exchangeRates?.solana.rate ?? 0;
    const exchangeRateTickets = exchangeRates?.tickets.rate ?? 0;

    if (isLoadingExchangeRates) return;

    const currentValue = Number(value) || 0;

    if (exchangeFrom === "tickets") {
      const ticketsInSol = Number(currentValue) * Number(exchangeRateTickets);
      const ticketsInUsd = ticketsInSol * Number(exchangeRateSol);

      formMethods.setValue("solana", ticketsInSol.toFixed(4));
      formMethods.setValue("solanaUsd", ticketsInUsd.toFixed(2));
      formMethods.setValue("ticketsUsd", ticketsInUsd.toFixed(2));

      return;
    }

    if (exchangeFrom === "solana") {
      const solInTickets = Number(currentValue) / Number(exchangeRateTickets);
      const solInUsd = Number(currentValue) * Number(exchangeRateSol);

      formMethods.setValue("tickets", Math.floor(solInTickets).toString());
      formMethods.setValue("solanaUsd", solInUsd.toFixed(2));
      formMethods.setValue("ticketsUsd", solInUsd.toFixed(2));
    }
  };

  useEffect(() => {
    const subscription = formMethods.watch((value, { name, type }) => {
      if (type === "change") {
        if (name === "solana") {
          handleChangeValueExchange(value.solana as string, "solana");
        } else if (name === "tickets") {
          handleChangeValueExchange(value.tickets as string, "tickets");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [formMethods, handleChangeValueExchange]);

  // Max events
  const onMaxTicket = useCallback(() => {
    const exchangeRateTickets = exchangeRates?.tickets.rate ?? 0;
    const exchangeRateSol = exchangeRates?.solana.rate ?? 0;

    const ticketsInSol =
      Number(balanaces.tickets) * Number(exchangeRateTickets);
    const ticketsInUsd = ticketsInSol * Number(exchangeRateSol);

    formMethods.setValue("tickets", Number(balanaces.tickets).toFixed(0));
    formMethods.setValue("solana", ticketsInSol.toFixed(4));
    formMethods.setValue("solanaUsd", ticketsInUsd.toFixed(2));
    formMethods.setValue("ticketsUsd", ticketsInUsd.toFixed(2));
  }, [exchangeRates, balanaces.tickets]);

  const onMaxSolana = useCallback(() => {
    const exchangeRateTickets = exchangeRates?.tickets.rate ?? 0;
    const exchangeRateSol = exchangeRates?.solana.rate ?? 0;

    const solInTickets = Number(balanceSolana) / Number(exchangeRateTickets);
    const solInUsd = Number(balanceSolana) * Number(exchangeRateSol);

    formMethods.setValue("solana", Number(balanceSolana).toFixed(2));
    formMethods.setValue("tickets", Math.floor(solInTickets).toString());
    formMethods.setValue("solanaUsd", solInUsd.toFixed(2));
    formMethods.setValue("ticketsUsd", solInUsd.toFixed(2));
  }, [balanceSolana, exchangeRates]);

  // Enable Resume
  const enableResume = useMemo(() => {
    const exchange = exchangeRates && !isLoadingExchangeRates;
    const solana = solanaValue && Number(solanaValue) > 0;
    const tickets = ticketsValue && Number(ticketsValue) > 0;

    return exchange && solana && tickets;
  }, [exchangeRates, isLoadingExchangeRates, solanaValue, ticketsValue]);

  // Transaction Fee
  const transactionFee = useMemo(() => {
    const fee_percentage = exchangeRates?.rate_fee_percentage ?? 0;

    if (isLoadingExchangeRates) return;

    const fee_solana = (fee_percentage / 100) * Number(solanaValue);
    const fee_usd = fee_solana * Number(exchangeRates?.solana?.rate ?? 0);

    return {
      fee_solana: fee_solana.toFixed(6),
      fee_usd: fee_usd.toFixed(2),
    };
  }, [solanaValue, exchangeRates, isLoadingExchangeRates]);

  // Minimum Received
  const minimumReceived = useMemo(() => {
    let value = 0;
    const exchangeToSymbol = {
      solana: "SOL",
      tickets: "VOTES",
    };

    if (exchangeTo === "solana") {
      value = Number(solanaValue);
    }

    if (exchangeTo === "tickets") {
      value = Number(ticketsValue);
    }

    const minimum = value - (slippage / 100) * value;

    return {
      minimum: minimum.toFixed(6),
      symbol: exchangeToSymbol[exchangeTo],
    };
  }, [exchangeTo, solanaValue, ticketsValue, slippage]);

  return {
    formMethods,
    exchangeTo,
    onMaxTicket,
    onMaxSolana,
    enableResume,
    transactionFee,
    minimumReceived,
    balance: {
      tickets: balanceTickets,
      solana: balanceSolana,
    },
    exchangeRates: {
      isLoading: isLoadingExchangeRates,
      data: exchangeRates,
      refetch: refetchExchangeRates,
    },
    reset: formMethods.reset,
  };
};
