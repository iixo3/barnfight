"use client";
import { useGetGame } from "@/shared/hooks/game/use-games";
import { env } from "@/shared/lib/config/env";
import { Game } from "@/shared/types/games/games";
import BodyPrizeFormat from "./ui/body-prize-format/body-prize-format";
import FooterPrizeFormat from "./ui/footer-prize-format/footer-prize-format";
import HeaderPrizeFormat from "./ui/header-prize-format/header-prize-format";
import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";
import { useMemetankProgram } from "@/contract/memetank-data-access";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useExchangeRates } from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";
import { useGameDataContext } from "@/contract/game-data-context";
import toast from "react-hot-toast";
import { useGetGameParticipationsToken } from "@/shared/hooks/game/use-get-game-participations";
import { cn } from "@/shared/utils";

export async function getPrizeFormat() {
  try {
    await new Promise((resolve) => setTimeout(resolve, Number(env.TIMEOUT)));

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const data: {
      id: string;
      end_date: number;
      winners: Game["winners"];
      is_ended: boolean;
    }[] = [
      {
        id: "1",
        end_date: currentTimestamp + 604800,
        is_ended: true,
        winners: [
          {
            percentage: 50,
            position: 1,
            last_updated_time: 1630000000,
            token_address: "a",
            token_winner: "a",
            winner_distribution: [
              {
                fair_distribution_all: true,
                last_updated_time: 1630000000,
                name: "Test",
                num_winners: 1,
                percentage: 50,
                ticket_ids: [1, 2],
              },
            ],
          },
          {
            percentage: 30,
            position: 2,
            last_updated_time: 1630000000,
            token_address: "b",
            token_winner: "b",
            winner_distribution: [
              {
                last_updated_time: 1630000000,
                name: "Test",
                ticket_ids: [1, 2],
                fair_distribution_all: false,
                num_winners: 1,
                percentage: 30,
              },
            ],
          },
          {
            percentage: 20,
            position: 3,
            token_address: "c",
            token_winner: "c",
            winner_distribution: [
              {
                last_updated_time: 1630000000,
                name: "Test",
                ticket_ids: [1, 2],
                fair_distribution_all: true,
                num_winners: 1,
                percentage: 20,
              },
            ],
          },
          {
            percentage: 20,
            position: 6,
            token_address: "d",
            token_winner: "d",
            winner_distribution: [
              {
                last_updated_time: 1630000000,
                name: "Test",
                ticket_ids: [1, 2],
                fair_distribution_all: true,
                num_winners: 1,
                percentage: 20,
              },
            ],
          },
        ],
      },
    ];

    return data;
  } catch (err) {
    console.log("err", err);
  }
}
type PrizeFormatProps = {
  game: string;
};
export default function PrizeFormat(props: PrizeFormatProps) {
  const { data: gameData } = useGetGame(props.game);
  const { isAuthenticated, isLoadingAuthentication, user } = useGetAuth();
  const { useClaimPrizeAvailability, claimPrize } = useMemetankProgram();
  const {
    enhancedParticipations,
    stakesEntered,
    isWinner,
    isClaimAlreadyDone,
    isClaimable,
  } = useClaimPrizeAvailability();
  const { participationsTokensWinner } = useGameDataContext();
  const [isPending, setIsPending] = useState(false);
  const [doesGameTimerEnded, setDoesGameTimerEnded] = useState(false);

  const tokensList = useMemo(
    () =>
      gameData?.tokens.map((token: Game["tokens"][0]) => token.token_address),
    [gameData]
  );
  const { data: participationsGameData, isLoading: participationsGameLoading } =
    useGetGameParticipationsToken(props.game, tokensList);

  const currentUserParticipationsDetails = useMemo(() => {
    const stakesEarned = enhancedParticipations.reduce(
      (acc, enhancedParticipation) =>
        (enhancedParticipation?.totalTicketsEntered ?? 0) + acc,
      0
    );

    const teamsEntered = stakesEntered ?? 0;

    const totalSpent = enhancedParticipations
      .reduce((acc, participation) => (participation?.totalSpend ?? 0) + acc, 0)
      .toFixed(5);

    const isWinningGames = enhancedParticipations?.filter((participation) =>
      Boolean(participation?.isWinner)
    );
    const isWinning = Boolean(isWinningGames?.length ?? 0);

    const hasClaimableGames = isWinning
      ? isWinningGames.map((game) => game?.isClaimable)
      : [];
    const hasClaimable = Boolean(hasClaimableGames?.length ?? 0);
    const doesUserHaveClaimableGames = hasClaimableGames.every(
      (game) => game === true
    );

    const hasAlreadyClaimableGames = isWinning
      ? isWinningGames.map((game) => game?.isClaimAlreadyDone)
      : [];
    const doesUserHaveAlreadyClaimedGames = hasAlreadyClaimableGames.every(
      (game) => game === true
    );

    const amountRewardWon = enhancedParticipations
      .reduce(
        (acc, participation) => (participation?.amountRewardWon ?? 0) + acc,
        0
      )
      .toFixed(5);


    const roi = Number(
      (((amountRewardWon - totalSpent) / totalSpent) * 100).toFixed(1)
    );

    const stakesWon = isWinningGames
      .map((game) => {
        if (!game.prizeDistribution || !Array.isArray(game.prizeDistribution)) {
          return "";
        }

        if (game.prizeDistribution[0]?.fairDistributionAll) {
          return "Split";
        }

        const count = game?.prizeDistribution?.reduce(
          (acc: number, distribution: any) =>
            acc + (distribution.numWinners ?? 0),
          0
        );
        return count > 0 ? count.toString() : "";
      })
      .join("/");

    const doesUserHaveParticipated =
      !!enhancedParticipations &&
      enhancedParticipations?.length > 0 &&
      totalSpent > 0;

    return {
      stakesEarned,
      teamsEntered,
      totalSpent,
      isWinning,
      hasClaimable,
      doesUserHaveClaimableGames,
      doesUserHaveAlreadyClaimedGames,
      amountRewardWon,
      roi,
      stakesWon,
      doesUserHaveParticipated,
    };
  }, [enhancedParticipations, stakesEntered]);

  const participationsGameDataFallback = useMemo(() => {
    if (participationsGameLoading) return {};
    return participationsGameData ?? {};
  }, [participationsGameData, participationsGameLoading]);

  const isEnded = gameData?.is_ended;
  const isCurrentAuthethicated = isAuthenticated && !isLoadingAuthentication;

  const handleClaimPrize = async () => {
    setIsPending(true);
    try {
      const signature = await claimPrize(gameData, participationsTokensWinner);
      // console.log("Claim prize successful, signature:", signature);
      toast.success("Claim prize successful");
    } catch (error) {
      console.error("Error claiming prize:", error);
      toast.error("Something went wrong claiming, try again later");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (!gameData?.end_date) return;

    const currentTimestamp = new Date();
    const gameDataEndedTimestamp = new Date(gameData?.end_date * 1000);

    const doesGameTimerEnded = currentTimestamp > gameDataEndedTimestamp;

    if (doesGameTimerEnded) {
      setDoesGameTimerEnded(true);
    }
  }, [gameData?.end_date]);

  return (
    <div
      className={cn(
        "rounded-xl h-full flex flex-col gap-y-7 bg-component-highlight p-[1px] overflow-hidden",
        {
          "game-ended-active": isEnded,
        }
      )}
    >
      <div className="h-full overflow-hidden flex flex-col gap-y-7 rounded-[11px] bg-component-main-non-opacity">
        <HeaderPrizeFormat
          game={gameData}
          is_ended={isEnded}
          isCurrentAuthethicated={isCurrentAuthethicated}
          user={user}
          claimPrize={{
            handleClaimPrize,
            isPending,
          }}
          currentUserParticipationsDetails={currentUserParticipationsDetails}
          participationsGameData={participationsGameDataFallback}
        />

        <BodyPrizeFormat
          winners={gameData?.winners}
          is_ended={isEnded}
          currentUserParticipationsDetails={currentUserParticipationsDetails}
          doesGameTimerEnded={doesGameTimerEnded}
        />


        <FooterPrizeFormat
          end_date={gameData?.end_date}
          is_ended={isEnded}
          summaryDetails={{
            stakesEarned: currentUserParticipationsDetails.stakesEarned,
            stakesWon: currentUserParticipationsDetails.stakesWon,
            totalSpent: currentUserParticipationsDetails.totalSpent,
            amountRewardWon: currentUserParticipationsDetails.amountRewardWon,
          }}
          doesUserHaveParticipated={
            currentUserParticipationsDetails.doesUserHaveParticipated
          }
          setDoesGameTimerEnded={setDoesGameTimerEnded}
          doesGameTimerEnded={doesGameTimerEnded}
        />
      </div>

    </div>
  );
}
