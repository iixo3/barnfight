import { GameDataFromContract } from "@/shared/types/games/games";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type UseRankingBattleRoyalReturn = {
  initialGameData: GameDataFromContract["tokens"];
  gameUpdated: GameDataFromContract["tokens"];
  ranking: (
    tokenAddress: GameDataFromContract["tokens"][number]["tokenAddress"]
  ) => {
    spot: number;
    position: number;
    tickets: number;
  };
};

const useRankingBattleRoyal = (
  game: GameDataFromContract["tokens"]
): UseRankingBattleRoyalReturn => {
  const initialGameData = useRef<GameDataFromContract["tokens"]>(game);
  const [gameUpdated, setGameUpdated] =
    useState<GameDataFromContract["tokens"]>(game);

  const sortedTokens = useMemo(() => {
    return gameUpdated.sort((a, b) => {
      if (Number(b.numberOfTickets) === Number(a.numberOfTickets)) {
        return Number(a.positionFinal || 0) - Number(b.positionFinal || 0);
      }
      return Number(b.numberOfTickets) - Number(a.numberOfTickets);
    });
  }, [gameUpdated]);

  const ranking = useCallback(
    (tokenAddress: GameDataFromContract["tokens"][number]["tokenAddress"]) => {
      const position_spots = {
        1: 0,
        2: 48,
        3: 96,
        4: 144,
        5: 192,
        6: 240,
      };

      const spot =
        sortedTokens.findIndex(
          (item) => String(item.tokenAddress) === String(tokenAddress)
        ) + 1;

      const position = position_spots[spot as keyof typeof position_spots];
      const tickets = Number(sortedTokens[spot - 1]?.numberOfTickets);

      return {
        spot,
        position,
        tickets,
      };
    },
    [sortedTokens]
  );

  useEffect(() => {
    if (initialGameData.current.length === 0 && game.length > 0) {
      initialGameData.current = game;
    }

    setGameUpdated(game);
  }, [game]);

  return {
    ranking,
    initialGameData: initialGameData.current,
    gameUpdated,
  };
};
export default useRankingBattleRoyal;
