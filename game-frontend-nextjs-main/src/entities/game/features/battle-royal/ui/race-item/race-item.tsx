import { useGetToken } from "@/shared/hooks/game/use-get-tokens";
import { cn } from "@/shared/utils";
import React, { useMemo } from "react";
import SliderRaceItem from "./ui/slider-race-item";

type RaceItemProps = {
  token_address: string;
  tickets: number;
  place: number;
  place_winner: boolean;
  max: number;
  gameDetails: {
    prizePool: number;
    winners: number[];
  };
};

const RaceItem: React.FC<RaceItemProps> = ({
  tickets,
  place,
  place_winner,
  max,
  token_address,
  gameDetails,
}) => {
  const { data: tokenMetadata } = useGetToken(token_address);

  const identifyToken = useMemo(() => {
    return {
      label: tokenMetadata?.symbol
        ? "Symbol:"
        : tokenMetadata?.name
        ? "Name:"
        : token_address
        ? "Token address:"
        : "-",
      value:
        tokenMetadata?.symbol || tokenMetadata?.name || token_address || "-",
    };
  }, [tokenMetadata]);

  const symbol = useMemo(() => {
    return tokenMetadata?.symbol || "-";
  }, [tokenMetadata]);

  return (
    <div className="flex w-full items-center gap-x-6">
      <div className="flex w-full items-center gap-x-6">
        <div
          className={cn(
            place_winner
              ? "bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2"
              : "bg-component-highlight",
            "w-8 h-8 flex items-center justify-center rounded-lg"
          )}
        >
          <span
            className={cn(
              place_winner ? "text-white" : "text-text-secondary",
              "handjet-bold-18"
            )}
          >
            {place}
          </span>
        </div>

        <div className="flex-1 items-center justify-center">
          <SliderRaceItem
            value={tickets}
            max={max}
            avatar_url={`/api/tokens/${token_address}/image`}
            token_address={token_address}
            identifyToken={identifyToken}
            symbol={symbol}
            place_winner={place_winner}
            gameDetails={gameDetails}
          />
        </div>
      </div>

      <div
        className={cn(
          place_winner
            ? "bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2"
            : "bg-component-highlight",
          "rounded-lg h-[36px] w-full max-w-[80px] md:max-w-[120px] flex items-center justify-center text-center"
        )}
      >
        <span
          className={cn(
            place_winner ? "text-white" : "text-text-secondary",
            "handjet-bold-16"
          )}
        >
          {tickets} votes
        </span>
      </div>
    </div>
  );
};
export default RaceItem;
