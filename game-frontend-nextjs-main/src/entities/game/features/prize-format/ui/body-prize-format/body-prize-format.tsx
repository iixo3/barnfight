"use client";

import Marquee from "@/shared/ui/components/marquee/marquee";
import React, { useMemo } from "react";
import PrizeFormatItem from "../prize-format-item/prize-format-item";
import { formatPlacesString } from "@/shared/utils/format-places-string";
import { Game } from "@/shared/types/games/games";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/ui/components/button/button";

type BodyPrizeFormatProps = {
  winners: Game["winners"];
  is_ended: boolean;
  currentUserParticipationsDetails: {
    stakesEarned: number;
    teamsEntered: number;
    totalSpent: string | number | null;
    isWinning: boolean;
    hasClaimable: boolean;
    doesUserHaveClaimableGames: boolean;
    doesUserHaveAlreadyClaimedGames: boolean;
    doesUserHaveParticipated: boolean;
    amountRewardWon: number;
    roi: number;
    stakesWon: string;
  };
  doesGameTimerEnded: boolean;
};

const BodyPrizeFormat: React.FC<BodyPrizeFormatProps> = ({
  winners,
  is_ended,
  currentUserParticipationsDetails,
  doesGameTimerEnded,
}) => {
  const currentViewStatus: {
    status:
      | "not-ended"
      | "winning"
      | "not-winning"
      | "not-participated"
      | "processing-results";
    label: string;
  } = useMemo(() => {
    if (is_ended) {
      if (currentUserParticipationsDetails.doesUserHaveParticipated) {
        if (currentUserParticipationsDetails.isWinning) {
          return {
            status: "winning",
            label: "You won!",
          };
        } else {
          return {
            status: "not-winning",
            label: "Sorry, bud :(",
          };
        }
      } else {
        return {
          status: "not-participated",
          label: "This game is over",
        };
      }
    }

    if (!is_ended && doesGameTimerEnded) {
      return {
        status: "processing-results",
        label: "Processing Results",
      };
    }

    return {
      status: "not-ended",
      label: "",
    };
  }, [is_ended, currentUserParticipationsDetails, doesGameTimerEnded]);

  const handleTriggerStats = () => {
    const trigger = document.getElementById("prize-format-stats-trigger");
    if (trigger) {
      trigger.click();
    }
  };

  return (
    <div
      className={cn("h-full overflow-hidden", {
        "shadow-scroll": currentViewStatus.status === "not-ended",
      })}
    >
      <div
        className={cn(
          "flex flex-col gap-y-5 h-full no-scrollbar overflow-y-scroll px-5",
          {
            "pb-[4vh]": currentViewStatus.status === "not-ended",
          }
        )}
      >
        {currentViewStatus.status === "not-ended" ? (
          winners.map((winner, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden shrink-0 w-full"
            >
              <div className="rounded-tr-lg w-fit rounded-tl-lg px-3 py-1.5 bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
                <span className="handjet-bold-16 text-white">
                  {formatPlacesString(winner.position)} place -{" "}
                  {Number(winner.percentage).toFixed(1)}%
                </span>
              </div>

              <div className="bg-component-main rounded-br-lg py-2 w-full h-full rounded-bl-lg rounded-tr-lg overflow-hidden">
                {winner.winner_distribution.length === 1 ? (
                  winner.winner_distribution[0].fair_distribution_all ? (
                    <div className="py-2 px-4 rounded-lg bg-component-main w-fit ml-2">
                      <span className="handjet-bold-16 text-text-secondary">
                        EQUAL SPLIT / PER TICKET
                      </span>
                    </div>
                  ) : (
                    <div className="w-fit h-full px-2">
                      <PrizeFormatItem
                        is_ended={is_ended}
                        distribution={winner.winner_distribution[0]}
                        index={0}
                      />
                    </div>
                  )
                ) : (
                  <Marquee
                    gap={"0.5rem"}
                    className="w-full overflow-hidden bg-transparent py-0"
                  >
                    {winner.winner_distribution.map(
                      (winnerDistribution, index) => (
                        <PrizeFormatItem
                          is_ended={is_ended}
                          distribution={winnerDistribution}
                          key={index}
                          index={index}
                        />
                      )
                    )}
                  </Marquee>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center flex-col gap-y-[29px] h-full justify-center">
            <span
              className={cn(
                "handjet-bold-34 uppercase",
                currentViewStatus.status === "winning"
                  ? "text-white"
                  : "text-text-secondary"
              )}
            >
              {currentViewStatus.label}
            </span>

            {currentViewStatus.status !== "processing-results" ? (
              <Button
                onClick={handleTriggerStats}
                size="lg"
                className="rounded-full max-w-[218px] w-full"
                variant={
                  currentViewStatus.status === "winning"
                    ? "action_secondary"
                    : "default"
                }
              >
                Check results
              </Button>
            ) : (
              <div className="flex items-center gap-x-[5px]">
                <div className="bg-white w-[13px] h-[13px] rounded-full animate-bouncing-dot"></div>
                <div className="bg-white w-[13px] h-[13px] rounded-full animate-bouncing-dot ![animation-delay:200ms]"></div>
                <div className="bg-white w-[13px] h-[13px] rounded-full animate-bouncing-dot ![animation-delay:400ms]"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default BodyPrizeFormat;
