"use client";
import { env } from "@/shared/lib/config/env";
import { unstable_noStore } from "next/cache";
import PurchaseStakeBody from "./ui/purchase-stake-body/purchase-stake-body";
import PurchaseStakeHeader from "./ui/purchase-stake-header/purchase-stake-header";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGetGame } from "@/shared/hooks/game/use-games";
// import { useGetGame } from "@/shared/hooks/game/mockup-get-games";
import { useGetAccountUserData } from "@/shared/hooks/user/use-get-user-data";
import PurchaseStakeFooter from "./ui/purchase-stake-footer/purchase-stake-footer";
import { memo, useMemo } from "react";

type PurchaseStakeProps = {
  game: string;
};

export async function getCompetition() {
  unstable_noStore();

  try {
    await new Promise((resolve) => setTimeout(resolve, Number(env.TIMEOUT)));

    const data: any = {
      game_name: "Sample Game #032",
      creator_name: "SAMPLE",
      avatar_url: "creator",
      competition: [
        {
          name: "Brett",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 12.2,
        },
        {
          name: "Bonk",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 13.2,
        },
        {
          name: "Dogwifhat",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 11.8,
        },
        {
          name: "Pepe",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 14.5,
        },
        {
          name: "Shiba inu",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 10.9,
        },
        {
          name: "Sheba",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 15.3,
        },
        // aici
        {
          name: "Sheba",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 12.7,
        },
        {
          name: "Sheba",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 13.9,
        },
        {
          name: "Sheba",
          avatar_url: "a",
          tickets: 3,
          priceTicket: 11.5,
        },
      ],
    };

    return data;
  } catch (err) {
    console.log("err", err);
  }
}

export default function PurchaseStake(props: PurchaseStakeProps) {
  const { data: game_data } = useGetGame(props.game, true);
  //@ts-ignore
  const { data: creatorData } = useGetAccountUserData(game_data?.creator, true);

  if (!game_data) {
    return null;
  }

  return useMemo(
    () => (
      <div className="bg-component-main rounded-xl h-full flex flex-col gap-y-[25px] border border-component-highlight overflow-hidden">
        {game_data?.name && (
          <PurchaseStakeHeader
            game_name={game_data.name}
            creator_name={creatorData?.username || ""}
            avatar_url={creatorData?.avatar || "creator"}
          />
        )}

        <PurchaseStakeBody game={game_data} />

        <PurchaseStakeFooter game={game_data} />
      </div>
    ),
    [game_data, creatorData]
  );
}
