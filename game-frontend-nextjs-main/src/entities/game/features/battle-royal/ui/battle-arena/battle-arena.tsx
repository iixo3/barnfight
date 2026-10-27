"use client";

import { cn } from "@/shared/utils";
import * as motion from "framer-motion/client";
import React, { useEffect, useMemo, useState } from "react";
import RaceItem from "../race-item/race-item";
import { GameDataFromContract } from "@/shared/types/games/games";
import useRankingBattleRoyal from "../../hooks/use-ranking-battle-royal";

type BattleArenaProps = {
  tokens: GameDataFromContract["tokens"];
  checkPlaceWinner: (place: number) => boolean;
  gameDetails: {
    prizePool: number;
    winners: number[];
  };
};

const BattleArena: React.FC<BattleArenaProps> = ({
  tokens,
  checkPlaceWinner,
  gameDetails,
}) => {
  const { initialGameData, ranking } = useRankingBattleRoyal(tokens);
  const [shouldInitialAnimation, setShouldInitialAnimation] = useState(false);

  const max = useMemo(() => {
    return Math.max(...tokens.map((i) => Number(i.numberOfTickets) || 0));
  }, [tokens]);

  useEffect(() => {
    setShouldInitialAnimation(true);
  }, []);

  return (
    <div
      className={cn("relative h-full")}
      style={{
        minHeight: `calc((36px * ${tokens.length}) + 1.25rem * ${
          tokens.length - 3
        })`,
      }}
    >
      {initialGameData.map((token, index) => {
        const { spot, position, tickets } = ranking(String(token.tokenAddress));

        return (
          <motion.div
            className="absolute w-full"
            initial={shouldInitialAnimation ? false : { y: position }}
            animate={{
              y: position,
            }}
            transition={{
              duration: 0.5,
            }}
            key={index}
          >
            <RaceItem
              key={index}
              token_address={String(token.tokenAddress)}
              tickets={tickets}
              place={spot}
              place_winner={checkPlaceWinner(spot)}
              max={max}
              gameDetails={gameDetails}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
export default BattleArena;
