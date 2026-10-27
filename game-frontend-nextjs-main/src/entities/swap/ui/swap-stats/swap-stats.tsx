"use client";

import Marquee from "@/shared/ui/components/marquee/marquee";
import React, { useCallback, useEffect } from "react";
import SwapVolumeGraph from "../swap-volume-graph/swap-volume-graph";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  collection,
  getAggregateFromServer,
  getCountFromServer,
  getDocs,
  query,
  sum,
  where,
} from "firebase/firestore";
import { firestore } from "@/shared/utils/firebase";

interface SwapStatsProps {}

const SwapStats: React.FC<SwapStatsProps> = () => {
  const { data: swapStats } = useSuspenseQuery({
    queryKey: ["swap-stats"],
    queryFn: async () => {
      const aggregateUsers =
        (await getCountFromServer(query(collection(firestore, "users")))).data()
          .count ?? 0;

      const gameQueryAggregate = query(
        collection(firestore, "game"),
        where("is_ended", "==", "false")
      );
      const aggregateGamesActive =
        (await getCountFromServer(gameQueryAggregate)).data().count ?? 0;

      const aggregateVolume =
        (
          await getAggregateFromServer(query(collection(firestore, "game")), {
            total_volume: sum("total_reward"),
          })
        ).data().total_volume ?? 0;

      const aggregateTicketsEntered =
        (
          await getAggregateFromServer(
            query(collection(firestore, "participation")),
            {
              total_tickets: sum("total_tickets_entered"),
            }
          )
        ).data().total_tickets ?? 0;

      return {
        users: aggregateUsers,
        games_active: aggregateGamesActive,
        all_time_volume: aggregateVolume,
        total_votes_entered: aggregateTicketsEntered,
      };
    },
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnReconnect: false,
  });

  const formattedViewData = useCallback(
    (stat: string) => {
      if (stat === "all_time_volume") {
        let value = swapStats[stat as keyof typeof swapStats];

        return value <= 0 ? `<${value}` : `~${value}`;
      }

      return swapStats[stat as keyof typeof swapStats];
    },
    [swapStats]
  );

  return (
    <div className="grow-[12] shrink basis-[580px] flex flex-col gap-y-4 w-full overflow-hidden">
      <div className="rounded-[20px] bg-component-main py-2.5 overflow-hidden w-full">
        <Marquee
          gap={"0.5rem"}
          className="bg-transparent w-full overflow-hidden"
        >
          {Object.keys(swapStats).map((stat, index) => (
            <div className="py-4 pl-6 pr-[80px] bg-component-main rounded-xl flex flex-col gap-y-1.5">
              <span className="handjet-bold-24 bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
                {formattedViewData(stat)}
              </span>
              <span className="aeonik-light-13 text-text-secondary">
                {stat
                  .replaceAll("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            </div>
          ))}
        </Marquee>
      </div>

      <div className="flex-1 h-full">
        <SwapVolumeGraph />
      </div>
    </div>
  );
};

export default React.memo(SwapStats);
