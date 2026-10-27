"use client";

import { useGetAccountUserData } from "@/shared/hooks/user/use-get-user-data";
import { Game } from "@/shared/types/games/games";
import { User } from "@/shared/types/user/user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { DocumentData } from "firebase/firestore";
import React, { memo } from "react";
import PrizeFormatStats from "../prize-format-stats/prize-format-stats";

type HeaderPrizeFormatProps = {
  is_ended: boolean;
  isCurrentAuthethicated: boolean;
  user: User | undefined;
  game: Game | DocumentData | undefined;
  claimPrize: {
    handleClaimPrize: () => Promise<void>;
    isPending: boolean;
  };
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
  participationsGameData: Record<string, string[]>;
};

const HeaderPrizeFormat: React.FC<HeaderPrizeFormatProps> = ({
  is_ended,
  isCurrentAuthethicated,
  user,
  game,
  claimPrize,
  currentUserParticipationsDetails,
  participationsGameData,
}) => {
  const { data: creatorData } = useGetAccountUserData(game?.creator, false);

  return (
    <div className="pt-[18px] px-5 flex items-center gap-x-1.5">
      <div className="flex items-center gap-x-1.5">
        <span className="handjet-bold-18 uppercase text-text-offset">
          {is_ended ? "game ended" : "prize format"}
        </span>

        {isCurrentAuthethicated &&
          is_ended &&
          currentUserParticipationsDetails.doesUserHaveParticipated && (
            <div className="rounded-3xl bg-component-main py-2 px-3 flex items-center gap-x-2">
              <AvatarMemoized avatar_url={user?.avatar ?? ""} />

              <div className="handjet-bold-16 text-text-secondary uppercase">
                {currentUserParticipationsDetails.isWinning
                  ? "you have"
                  : "no winning tickets"}{" "}
                {currentUserParticipationsDetails.isWinning && (
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                    winning tickets
                  </span>
                )}
              </div>
            </div>
          )}
      </div>

      <div className="h-[1px] w-full flex-1 bg-component-highlight" />

      <div className="flex items-center">
        <PrizeFormatStats
          game={game}
          creatorData={creatorData}
          user={user}
          claimPrize={claimPrize}
          currentUserParticipationsDetails={currentUserParticipationsDetails}
          participationsGameData={participationsGameData}
        />
      </div>
    </div>
  );
};

const AvatarMemoized = memo(({ avatar_url }: { avatar_url: string }) => {
  return (
    <Avatar className="w-5 h-5 cursor-pointer">
      <AvatarImage src={avatar_url ?? ""} />
      <AvatarFallback>
        <PlaceholderAvatar />
      </AvatarFallback>
    </Avatar>
  );
});

export default HeaderPrizeFormat;
