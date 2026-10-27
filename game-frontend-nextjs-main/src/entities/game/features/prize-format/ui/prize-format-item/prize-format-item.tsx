import { Game } from "@/shared/types/games/games";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { cn } from "@/shared/utils";
import React from "react";

type PrizeFormatItemProps = {
  is_ended: boolean;
  distribution: Game["winners"][0]["winner_distribution"][0];
  index: number;
};

const PrizeFormatItem: React.FC<PrizeFormatItemProps> = ({
  is_ended = false,
  distribution,
  index,
}) => {
  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg bg-component-main",
        is_ended && "gap-x-3 flex items-center"
      )}
    >
      <div className="handjet-bold-16 text-text-secondary">
        <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
          {distribution.name ?? "Ticket"} #{Number(index) + 1}
        </span>{" "}
        - {distribution.percentage}%
      </div>

      {/* {is_ended && (
        <div className="flex items-center gap-x-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={""} />
            <AvatarFallback>
              <PlaceholderAvatar />
            </AvatarFallback>
          </Avatar>

          <div className="handjet-bold-16 text-text-secondary uppercase">
            won by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
              {"-"}
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
};
export default PrizeFormatItem;
