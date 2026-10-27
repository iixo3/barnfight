"use client";
import { Game } from "@/shared/types/games/games";
import { firestore } from "@/shared/utils/firebase";
import {
  QueryObserverResult,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useMemetankProgram } from "@/contract/memetank-data-access";
import {
  ExchangeRates,
  useExchangeRates,
} from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";
import { formatGamesWinners } from "@/shared/utils/format-games-winners";
import { useFirestoreDocumentData } from "@/shared/utils/use-query-firebase";
import { PublicKey } from "@solana/web3.js";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const useGameQuery = (options: {
  type: "history" | "popular" | "hosted";
  search?: string;
  creator?: string;
}) => {
  return useSuspenseQuery<Game[]>({
    queryKey: ["games", options.search, options.type],
    queryFn: async () => {
      const getGamesFromFirestore = async (): Promise<Game[]> => {
        try {
          const gamesCollection = collection(firestore, "game");

          let gamesQuery = query(gamesCollection);

          if (options.search && options.search.length > 0) {
            const searchText = options.search;
            gamesQuery = query(
              gamesCollection,
              where("name", ">=", searchText),
              where("name", "<=", searchText + "\uf8ff")
            );
          }

          if (options.creator) {
            const creator = options.creator;
            gamesQuery = query(
              gamesCollection,
              where("creator", "==", creator)
            );
          }

          const gamesSnapshot = await getDocs(gamesQuery);
          return gamesSnapshot.docs.map((doc) => doc.data() as Game);
        } catch (error) {
          console.error("Error getting games from Firestore", error);
          return [];
        }
      };
      return await getGamesFromFirestore();
    },
  });
};

export const useGetGame = (gameId: string, subscribe?: boolean) => {
  const query = useFirestoreDocumentData<Game | DocumentData>(
    ["game", gameId],
    doc(firestore, "game", gameId),
    { subscribe },
    {
      refetchOnMount: false,
      queryKey: ["game", gameId],
      enabled: Boolean(gameId),
      placeholderData: {} as Game,
    }
  );
  return query;
};

export const useGetGameStaled = (gameId: string) => {
  return useQuery({
    queryKey: ["game-staled", gameId],
    queryFn: async () => {
      const res = await getDoc(doc(firestore, "game", gameId));
      return res.data() as Game;
    },
    enabled: Boolean(gameId),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
    retry: false,
    refetchInterval: undefined,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
};

export const useGetSpent = (gameId: string, exchangeRates: ExchangeRates) => {
  const { data: game } = useGetGameStaled(gameId);
  const [spent, setSpent] = useState<string | null>(null);
  const { useTokenParticipationCached } = useMemetankProgram();

  const { data: contractData } = useTokenParticipationCached(
    gameId,
    game?.tokens?.map(
      (token: { token_address: string }) => new PublicKey(token.token_address)
    ) ?? []
  );

  useEffect(() => {
    if (game && exchangeRates && contractData) {
      const exchangeRateTicket = exchangeRates?.tickets?.rate ?? 0;
      const exchangeRateSolana = exchangeRates?.solana?.rate ?? 0;

      const ticketsBought = contractData
        .map((participation) => participation.ticketsBought)
        .reduce((acc, curr) => acc + curr, 0);

      const ticketsInSol = Number(ticketsBought) * Number(exchangeRateTicket);
      const ticketsInUsd = ticketsInSol * Number(exchangeRateSolana);

      setSpent(ticketsInUsd.toFixed(2) || null);
    }
  }, [contractData, exchangeRates]);

  return spent;
};

export const useGameWinners = (gameId: string) => {
  const gameData = useGetGameStaled(gameId);

  const formattedData = gameData?.data
    ? formatGamesWinners([
        { id: gameId, winners: gameData.data?.winners || [] },
      ])
    : {};

  return { ...gameData, data: formattedData?.[gameId] };
};
