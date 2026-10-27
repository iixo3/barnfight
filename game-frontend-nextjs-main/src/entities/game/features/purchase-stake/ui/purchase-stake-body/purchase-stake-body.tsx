"use client";

import React, { useMemo } from "react";
import PurchaseStakeItem from "../purchase-stake-item/purchase-stake-item";
import { useGetGame } from "@/shared/hooks/game/use-games";
// import { useGetGame } from "@/shared/hooks/game/mockup-get-games";
import { Game, GameBattleToken, GameToken } from "@/shared/types/games/games";
import { useMemetankProgram } from "@/contract/memetank-data-access";
import { PublicKey } from "@solana/web3.js";
import { useGetBalance } from "@/shared/hooks/wallet/use-get-balance";
import { useExchangeRates } from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";
import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";
import { DocumentData } from "firebase/firestore";

type PurchaseStakeBodyProps = {
  game: Game | DocumentData | undefined;
};

const PurchaseStakeBody: React.FC<PurchaseStakeBodyProps> = ({ game }) => {
  const { isAuthenticated, isLoadingAuthentication } = useGetAuth();
  const { useTokenParticipation, userAccount } = useMemetankProgram();
  const { data: exchangeRates, loading: isLoadingExchangeRates } =
    useExchangeRates("solana");

  const { data: getBalanceTickets, isLoading: isLoadingBalanceTickets } =
    userAccount;

  const balanceTickets = useMemo(() => {
    if (
      isLoadingBalanceTickets ||
      !getBalanceTickets ||
      !getBalanceTickets.account
    )
      return 0;

    return Number(getBalanceTickets?.account.numberTickets ?? 0).toFixed(0);
  }, [isLoadingBalanceTickets, getBalanceTickets]);

  const priceTicket = useMemo(() => {
    if (isLoadingExchangeRates || !exchangeRates || !exchangeRates.tickets)
      return 0;

    return (
      Number(exchangeRates?.tickets.rate) +
      Number(exchangeRates?.tickets.rate) * 0.03
    );
  }, [exchangeRates, isLoadingExchangeRates]);

  const priceSolana = useMemo(() => {
    if (isLoadingExchangeRates || !exchangeRates || !exchangeRates.solana)
      return 0;

    return exchangeRates.solana.rate;
  }, [exchangeRates, isLoadingExchangeRates]);

  const tokensPublicKeys = useMemo(() => {
    return (
      game?.tokens?.map(
        (token: GameBattleToken) => new PublicKey(token.token_address)
      ) ?? []
    );
  }, [game?.tokens]);

  const contractData = useTokenParticipation(game?.id, tokensPublicKeys);

  const tokensToDisplay = useMemo(() => {
    return game?.tokens?.map((token: GameBattleToken) => {
      const tokenFromContract = contractData.participations.find(
        (contract) => contract.tokenAddress.toString() === token.token_address
      );

      return {
        ...token,
        ticketsBought: tokenFromContract?.ticketsBought || 0,
      };
    });
  }, [game?.tokens, contractData]);

  return (
    <div className="flex flex-col gap-y-3 px-5 h-full overflow-hidden shadow-scroll">
      <div className="flex items-center justify-between text-text-offset handjet-bold-16 uppercase gap-x-3">
        <span>COMPETITION</span>
        <span>Cast vote</span>
      </div>
      <div className="flex flex-col overflow-y-scroll no-scrollbar h-full pb-[4vh]">
        {tokensToDisplay.map(
          (
            token: GameBattleToken & { ticketsBought: number },
            index: number
          ) => (
            <PurchaseStakeItem
              key={`${index}`}
              spot={index + 1}
              tokenDetails={token}
              balanceTickets={balanceTickets}
              priceTicket={priceTicket}
              priceSolana={priceSolana}
              gameId={game?.id}
              isAuthenticated={isAuthenticated}
              isLoadingAuthentication={isLoadingAuthentication}
              is_ended={game?.is_ended}
            />
          )
        )}
      </div>
    </div>
  );
};
export default PurchaseStakeBody;
