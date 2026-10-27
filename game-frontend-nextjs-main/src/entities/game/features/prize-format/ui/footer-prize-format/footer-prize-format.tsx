"use client";

import { useGameDataContext } from "@/contract/game-data-context";
import { Button } from "@/shared/ui/components/button/button";
import Loader from "@/shared/ui/components/loaders/loader";
import Marquee from "@/shared/ui/components/marquee/marquee";
import TimeRemaining from "@/shared/ui/components/time-remaining/time-remaining";
import { cn } from "@/shared/utils";
import React, { useCallback, useMemo } from "react";

type FooterPrizeFormatProps = {
  end_date: number;
  is_ended: boolean;
  summaryDetails: {
    stakesEarned: string;
    stakesWon: string;
    totalSpent: string;
    amountRewardWon: string;
  };
  doesUserHaveParticipated: boolean;
  setDoesGameTimerEnded: (value: boolean) => void;
  doesGameTimerEnded: boolean;
};

const FooterPrizeFormat: React.FC<FooterPrizeFormatProps> = ({
  end_date,
  is_ended,
  summaryDetails,
  doesUserHaveParticipated,
  setDoesGameTimerEnded,
  doesGameTimerEnded,
}) => {
  const gameEndedSummary: { label: string; value: string }[] = useMemo(() => {
    let summary = [
      {
        label: "+ Stakes PURCHASED:",
        value: "-",
      },
      {
        label: "+ Tickets WON:",
        value: "-",
      },
      {
        label: "+ TOTAL SPENT:",
        value: "- SOL",
      },
      {
        label: "+ PRIZE WIN:",
        value: "- SOL",
      },
    ];

    if (!doesUserHaveParticipated) {
      summary[0].value = "-";
      summary[1].value = "-";
      summary[2].value = "-";
      summary[3].value = "-";
    } else {
      if (summaryDetails.stakesEarned) {
        summary[0].value = summaryDetails.stakesEarned;
      }
      if (summaryDetails.stakesWon) {
        summary[1].value = summaryDetails.stakesWon;
      }
      if (summaryDetails.totalSpent) {
        summary[2].value = `${summaryDetails.totalSpent} SOL`;
      }
      if (summaryDetails.amountRewardWon) {
        summary[3].value = `${summaryDetails.amountRewardWon} SOL`;
      }
    }

    return summary;
  }, [summaryDetails, doesUserHaveParticipated]);

  const handleRunEndedTimer = () => {
    document
      .getElementById("confetti-wrapper-trigger")
      ?.setAttribute("data-run-confetti-active", "true");

    setDoesGameTimerEnded(true);
  };

  return (
    <div className="px-5 pb-[19px] w-full">
      {!is_ended ? (
        doesGameTimerEnded ? (
          <></>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 w-full py-2 px-5">
            <TimeRemaining
              dateFuture={end_date ?? 0}
              format="DD,hh,mm,ss"
              withSkeleton={false}
              customText={(time) => {
                return (
                  <span className="text-white handjet-bold-18 uppercase">
                    Results in: <span className="text-white">{time}</span>
                  </span>
                );
              }}
              completedView={
                <span className="handjet-bold-18 text-white">
                  Has been ended
                </span>
              }
              onCompleteTimerCallback={handleRunEndedTimer}
            />
          </div>
        )

      ) : (
        <div className="w-full flex flex-col gap-y-3">
          <div className="w-full">
            <Marquee
              gap="0.75rem"
              className="bg-component-main rounded-2xl w-full overflow-hidden mr-3"
            >
              {gameEndedSummary.map((summary, index) => (
                <span
                  className="handjet-bold-18 text-text-secondary uppercase"
                  key={index}
                >
                  {summary.label}{" "}
                  <span
                    className={cn(
                      "bg-gradient-to-br bg-clip-text text-transparent",
                      {
                        "from-brand-gradient-red-1 to-brand-gradient-red-2":
                          index % 2 === 0,
                        "from-brand-gradient-green-1 to-brand-gradient-green-2":
                          index % 2 !== 0,
                      }
                    )}
                  >
                    {summary.value}
                  </span>
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      )}
    </div>
  );
};
export default FooterPrizeFormat;
