import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/components/dialog/dialog";
import { cn } from "@/shared/utils";
import { Game } from "@/shared/types/games/games";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { DocumentData } from "firebase/firestore";
import { User } from "@/shared/types/user/user";
import TimeRemaining from "@/shared/ui/components/time-remaining/time-remaining";
import TableStatsCurentUser from "./ui/table-stats-current-user/table-stats-current-user";
import TableStatsPlace from "./ui/table-stats-place/table-stats-place";

type PrizeFormatStatsProps = {
  game: Game | DocumentData | undefined;
  creatorData: User | DocumentData | undefined;
  user: User | DocumentData | undefined;
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
    amountRewardWon: number;
    roi: number;
    stakesWon: string;
  };
  participationsGameData: Record<string, string[]>;
};

const PrizeFormatStats: React.FC<PrizeFormatStatsProps> = ({
  game,
  creatorData,
  user,
  claimPrize,
  currentUserParticipationsDetails,
  participationsGameData,
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const tokensWinnersTotals = useMemo(() => {
    if (!game?.is_ended) return {};

    const winners =
      game?.tokens?.filter((token: Game["tokens"][0]) => token.is_winner) ?? [];

    if (!winners) return {};

    return winners.reduce(
      (
        acc: Record<
          string,
          { total_amount_wallet_sol: number; total_amount_wallet_token: number }
        >,
        curr: Game["tokens"][0]
      ) => {
        return {
          ...acc,
          [curr.token_address]: {
            total_amount_wallet_sol: curr?.total_amount_wallet_sol ?? 0,
            total_amount_wallet_token: curr?.number_of_tickets ?? 0,
          },
        };
      },
      {}
    );
  }, [game?.tokens]);

  return (
    <Dialog
      open={openDialog}
      defaultOpen={false}
      onOpenChange={(e) => {
        setOpenDialog(e);
      }}
    >
      <DialogTrigger asChild>
        <Button id="prize-format-stats-trigger" variant="ghosted" size="icon">
          <Icon
            icon="expand"
            width={22}
            height={22}
            className="fill-text-offset hover:fill-white"
          />
        </Button>
      </DialogTrigger>

      <DialogContent
        blur={false}
        showClose={false}
        className={cn(
          "w-full max-w-[1664px] lg:max-w-[1688px] px-2 lg:px-5 gap-0 p-0 border-none bg-transparent shadow-none top-[54%]"
        )}
      >
        <DialogDescription className="hidden invisible"></DialogDescription>
        <DialogHeader>
          <DialogTitle className="hidden" asChild>
            <div></div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-y-[60px] p-5 lg:p-[60px] border border-component-highlight bg-system-modals h-[calc(100vh-68px-30px)] rounded-2xl w-full overflow-hidden">
          <div className="flex flex-col gap-y-8">
            <div className="flex items-center justify-between gap-x-2">
              <span className="handjet-bold-24 text-text-secondary">
                {game?.name}
              </span>

              <Button
                onClick={() => setOpenDialog(false)}
                asChild
                variant="default"
                size="outer_icon"
                className="h-6 w-6 p-2 cursor-pointer"
              >
                <Icon
                  icon="cross-icon-bold"
                  className="fill-white"
                  width={9}
                  height={9}
                />
              </Button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-x-3 rounded-3xl max-w-[500px] min-w-0 py-2 px-3 bg-component-main">
                {useMemo(
                  () => (
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={creatorData?.avatar ?? ""} />
                      <AvatarFallback>
                        <PlaceholderAvatar />
                      </AvatarFallback>
                    </Avatar>
                  ),
                  [creatorData?.avatar]
                )}

                <span className="handjet-bold-16 uppercase truncate min-w-0 max-w-full w-full text-brand-gradient-red-1 flex items-center gap-x-[4px]">
                  <span className="text-text-offset">Created by</span>{" "}
                  <span className="text-transparent truncate min-w-0 max-w-[200px] bg-clip-text bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
                    {creatorData?.username}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-x-3 rounded-3xl py-2 px-3 bg-component-main">
                <span className="handjet-bold-16 uppercase truncate max-w-full text-brand-gradient-red-1 flex items-center gap-x-[4px]">
                  <span className="text-text-offset">Game funds -</span>{" "}
                  <span className="text-transparent truncate max-w-full bg-clip-text bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                    {game?.total_reward}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-x-3 rounded-3xl py-2 px-3 bg-component-main">
                {!game?.is_ended ? (
                  <TimeRemaining
                    dateFuture={game?.end_date ?? 0}
                    format="DD,hh,mm,ss"
                    withSkeleton={false}
                    customText={(time) => {
                      return (
                        <span className="text-text-secondary handjet-bold-16 uppercase">
                          Results in:{" "}
                          <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
                            {time}
                          </span>
                        </span>
                      );
                    }}
                    completedView={
                      <span className="handjet-bold-16 text-text-offset uppercase">
                        Game ended -{" "}
                        {new Date(game?.end_date * 1000)
                          .toLocaleString("en-US", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "UTC",
                          })
                          .replace(",", "")
                          .replace("/", ".")
                          .replace("/", ".")}{" "}
                        UTC
                      </span>
                    }
                  />
                ) : (
                  <span className="handjet-bold-16 text-text-offset uppercase">
                    Game ended -{" "}
                    {new Date(game.end_date * 1000)
                      .toLocaleString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "UTC",
                      })
                      .replace(",", "")
                      .replace("/", ".")
                      .replace("/", ".")}{" "}
                    UTC
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-10 max-w-full overflow-auto no-scrollbar [&>div]:overflow-visible">
            <TableStatsCurentUser
              user={user}
              isEnded={game?.is_ended}
              claimPrize={claimPrize}
              currentUserParticipationsDetails={
                currentUserParticipationsDetails
              }
            />

            {game?.winners.length > 0 &&
              game?.winners.map((winner: Game["winners"][0], index: number) => (
                <TableStatsPlace
                  key={index}
                  winner={winner}
                  isEnded={game?.is_ended}
                  tokensWinnersTotals={tokensWinnersTotals}
                  participationsGameData={participationsGameData}
                />
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PrizeFormatStats;
