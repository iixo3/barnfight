import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import TimeRemaining from "@/shared/ui/components/time-remaining/time-remaining";
import { cn } from "@/shared/utils";
import React from "react";
import GameHistorySectionCardBar from "../game-history-section-card/game-history-section-card-bar";
import { formatPrice } from "@/shared/utils/format-price";

type GameHistorySectionCardEmptyProps = {
  game: {
    title: string;
    hosted_by_me: boolean;
    users?: number;
    tickets?: number;
    total_reward: number;
    start_date: string;
    percentage: number;
  };
};

const GameHistorySectionCardEmpty: React.FC<
  GameHistorySectionCardEmptyProps
> = ({ game }) => {
  return (
    <div
      className={cn(
        "border rounded-[10px] pt-3 pl-3 pr-4 pb-[25px] flex flex-col gap-y-3",
        "border-component-highlight blur-[7px]"
      )}
    >
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-2">
          <span className={cn("handjet-bold-18", "text-text-secondary")}>
            {game?.title}
          </span>

          <div className="flex items-center">
            <Button variant="ghosted" size="icon_padding">
              <Icon
                icon="copy"
                width={11}
                height={13}
                className="fill-text-secondary group-hover:fill-white"
              />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-x-1.5">
          <div className="bg-component-main rounded-xl py-1 px-2">
            <span className="handjet-handjet-bold-15 text-text-offset uppercase">
              {
                //@ts-ignore
                game?.hosted_by_me ? "users" : "tickets"
              }{" "}
              -{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                {
                  //@ts-ignore
                  game?.hosted_by_me ? game?.users : game?.tickets
                }
              </span>
            </span>
          </div>

          <div className="bg-component-main rounded-xl py-1 px-2">
            <span className="handjet-handjet-bold-15 text-text-offset uppercase">
              prize -{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                {
                  //@ts-ignore
                  formatPrice(game?.total_reward as number)
                }
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-[5px] w-full">
        <span className="handjet-bold-14 bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 bg-clip-text text-transparent">
          Time left - {game?.start_date}
        </span>

        <div className="w-full bg-component-highlight rounded-full overflow-hidden h-[7px]">
          <div
            className="rounded-full h-full bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2"
            style={{ width: `${game?.percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
export default GameHistorySectionCardEmpty;
