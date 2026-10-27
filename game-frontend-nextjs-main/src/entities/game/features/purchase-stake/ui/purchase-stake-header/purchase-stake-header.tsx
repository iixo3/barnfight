import { Game } from "@/shared/types/games/games";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import React from "react";

type PurchaseStakeHeaderProps = {
  game_name: string;
  avatar_url: string;
  creator_name: string;
};

const PurchaseStakeHeader: React.FC<PurchaseStakeHeaderProps> = ({
  game_name,
  creator_name,
  avatar_url,
}) => {
  return (
    <div className="w-full pt-5 px-5">
      <div className="flex flex-col gap-y-3 max-w-full">
        <div className="flex items-center gap-x-1.5">
          <span className="handjet-bold-18 text-text-offset uppercase truncate">
            {game_name}
          </span>
          <div className="h-[1px] flex-1 bg-stroke-main"></div>
        </div>

        <div className="py-2 px-3 w-fit rounded-3xl bg-component-main flex items-center gap-x-3 max-w-full">
          <Avatar className="w-5 h-5">
            <AvatarImage src={avatar_url} />
            <AvatarFallback>
              <PlaceholderAvatar />
            </AvatarFallback>
          </Avatar>

          <span className="handjet-bold-16 uppercase truncate max-w-full text-brand-gradient-red-1 flex items-center gap-x-[4px]">
            <span className="text-text-offset">Created by</span>{" "}
            <span className="text-transparent truncate max-w-full bg-clip-text bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
              {creator_name}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
export default PurchaseStakeHeader;
