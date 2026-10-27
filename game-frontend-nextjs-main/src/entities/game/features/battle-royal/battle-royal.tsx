"use client";
import { useMemetankProgram } from "@/contract/memetank-data-access";
import { Game } from "@/shared/types/games/games";
import Marquee from "@/shared/ui/components/marquee/marquee";
import { formatPlacesString } from "@/shared/utils/format-places-string";
import { useCallback, useEffect, useMemo } from "react";
import BattleArena from "./ui/battle-arena/battle-arena";
import SkeletonBattle from "./ui/skeleton-battle";

type BattleRoyalProps = {
  game: Game["id"];
};

export default function BattleRoyal(props: BattleRoyalProps) {
  const { useGameData } = useMemetankProgram();
  const { game: gameDataLiveFromContract, isLoadingInitial } = useGameData(
    props.game
  );

  const tokenList = useMemo(() => {
    if (
      isLoadingInitial ||
      !gameDataLiveFromContract ||
      gameDataLiveFromContract.tokens.length === 0
    )
      return [];

    return gameDataLiveFromContract.tokens;
  }, [isLoadingInitial, gameDataLiveFromContract]);

  const sectionWinnersView = useMemo(() => {
    if (isLoadingInitial) return "-";
    if (!gameDataLiveFromContract) return "-";

    const winners = gameDataLiveFromContract.winners
      .map((winner) => Number(winner.position))
      .sort((a, b) => a - b)
      .map((place) => formatPlacesString(place))
      .join(", ");

    return winners;
  }, [isLoadingInitial, gameDataLiveFromContract]);

  const getPlaceWinners = useMemo(() => {
    if (isLoadingInitial) return [];
    if (!gameDataLiveFromContract) return [];

    return gameDataLiveFromContract.winners.map((winner) =>
      Number(winner.position)
    );
  }, [isLoadingInitial, gameDataLiveFromContract]);

  const checkPlaceWinner = useCallback(
    (place: number) => {
      if (isLoadingInitial) return false;
      if (!gameDataLiveFromContract) return false;

      return getPlaceWinners.includes(place);
    },
    [isLoadingInitial, gameDataLiveFromContract, getPlaceWinners]
  );

  const labelsView = useMemo(() => {
    const rewardPool = (gameDataLiveFromContract?.totalReward ?? 0).toFixed(3);

    const labelRewardPool = `⚡️  REWARDS POOL: ${rewardPool} SOL  |`;

    return {
      labelRewardPool,
      marqueeLabels: [
        "+ WINNERS WILL BE ANNOUNCED WHEN THE TIMER IS OVER",
        "+ THE REWARD POOL IS USED TO PURCHASE MARKET TOKENS",
        // "+ FUNDS WILL MARKET BUY WINNING TICKETS",
        // "+ WINNING TICKETS WILL AUTOMATICALLY BE IMBURSED",
        // "+ GAME HOST WILL TAKE A 5% CUT",
        // "+ THE PLATFORM WILL TAKE a 5% CUT",
      ],
    };
  }, [gameDataLiveFromContract]);

  if (isLoadingInitial) return <SkeletonBattle />;

  return (
    <div className="bg-component-main rounded-xl h-full flex flex-col gap-y-10 border border-component-highlight pt-5 px-5 pb-5 overflow-hidden">
      <div className="w-full flex items-center gap-x-1.5">
        <div className="flex items-center gap-x-2.5">
          <span className="uppercase handjet-bold-18">
            🔥 <span className="text-text-offset">Battle Royal</span>
          </span>

          <div className="py-[5px] px-[15px] bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 text-white handjet-bold-16 rounded-full">
            {sectionWinnersView} place wins
          </div>
        </div>

        <div className="h-[1px] flex-1 bg-stroke-main"></div>
      </div>

      <div className="shadow-scroll h-full overflow-hidden">
        <div className="overflow-y-scroll no-scrollbar flex flex-col gap-y-5 h-full pb-[4vh]">
          <BattleArena
            tokens={tokenList}
            checkPlaceWinner={checkPlaceWinner}
            gameDetails={{
              prizePool: gameDataLiveFromContract?.totalReward ?? 0,
              winners: getPlaceWinners,
            }}
          />
        </div>
      </div>

      <div className="w-full">
        <div className="pl-5 flex items-center gap-x-2 bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 rounded-2xl overflow-hidden">
          <span className="text-whtie handjet-bold-18">
            {labelsView.labelRewardPool}
          </span>
          <Marquee className="w-full mr-0 flex-1">
            {labelsView.marqueeLabels.map((label, index) => (
              <span className="text-white handjet-bold-18" key={index}>
                {label}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
