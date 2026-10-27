import { Game } from "@/shared/types/games/games";
import Marquee from "@/shared/ui/components/marquee/marquee";
import { cn } from "@/shared/utils";
import { DocumentData } from "firebase/firestore";
import React, { useEffect, useMemo } from "react";
import { useGetGameParticipationsToken } from "@/shared/hooks/game/use-get-game-participations";

type PurchaseStakeFooterProps = {
  game: Game | DocumentData | undefined;
};

const PurchaseStakeFooter: React.FC<PurchaseStakeFooterProps> = ({ game }) => {
  const tokensList = useMemo(
    () => game?.tokens.map((token: Game["tokens"][0]) => token.token_address),
    [game]
  );
  const { data: participationsGameData, isLoading: participationsGameLoading } =
    useGetGameParticipationsToken(game?.id ?? "", tokensList);

  const purchaseStats: { label: string; value: string }[] = useMemo(() => {
    let summary = [
      {
        label: "REWARD POOL -",
        value: "0",
      },
      {
        label: "USERS REGISTERED -",
        value: "0",
      },
      {
        label: "TICKETS PURCHASED -",
        value: "0",
      },
      // {
      //   label: "MAXIMUM PRICE IMPACT (GROK) ",
      //   value: "+15%",
      // },
    ];

    if (game?.total_reward) {
      summary[0].value = `${Number(game.total_reward ?? 0).toFixed(3)} SOL`;
    }

    if (participationsGameData && !participationsGameLoading) {
      const usersRegistered = new Set([
        ...Object.values(participationsGameData).flat(),
      ]).size;

      summary[1].value = usersRegistered.toString();
    }

    const aggregateTicketsPurchased =
      game &&
      game.tokens.length > 0 &&
      game.tokens.reduce((acc: number, token: Game["tokens"][0]) => {
        return acc + Number(token.number_of_tickets);
      }, 0);
    if (aggregateTicketsPurchased > 0) {
      summary[2].value = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(aggregateTicketsPurchased));
    }

    return summary;
  }, [game, participationsGameData, participationsGameLoading]);

  return (
    <div className="w-full pb-5">
      <Marquee
        gap="0.5rem"
        className="bg-transparent w-full overflow-hidden p-0"
        duration={10}
      >
        {purchaseStats.map((summary, index) => (
          <div className="bg-component-main rounded-xl py-2.5 px-5" key={index}>
            <span
              className="handjet-bold-18 text-text-secondary uppercase"
              key={index}
            >
              {summary.label}{" "}
              <span
                className={cn(
                  "bg-gradient-to-br bg-clip-text text-transparent",
                  index === purchaseStats.length - 1
                    ? "from-brand-gradient-green-1 to-brand-gradient-green-2"
                    : "from-brand-gradient-red-1 to-brand-gradient-red-2"
                )}
              >
                {summary.value}
              </span>
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};
export default PurchaseStakeFooter;
