import { User } from "@/shared/types/user/user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { Button } from "@/shared/ui/components/button/button";
import Loader from "@/shared/ui/components/loaders/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table/table";
import { cn } from "@/shared/utils";
import { DocumentData } from "firebase/firestore";
import React, { useCallback, useMemo } from "react";

type TableStatsCurentUserProps = {
  user: User | DocumentData | undefined;
  isEnded: boolean;
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
};

const TableStatsCurentUser: React.FC<TableStatsCurentUserProps> = ({
  user,
  isEnded,
  claimPrize,
  currentUserParticipationsDetails,
}) => {
  const formatData = useMemo(() => {
    let data = {
      stakes_entered: 0,
      stakes_won: "",
      teams_entered: 0,
      total_spent: 0,
      won_amount: 0,
      ROI: "N/A",
    };

    if (currentUserParticipationsDetails.totalSpent) {
      data.total_spent = Number(
        currentUserParticipationsDetails?.totalSpent ?? 0
      );
    }

    if (currentUserParticipationsDetails) {
      data.stakes_entered = currentUserParticipationsDetails.stakesEarned ?? 0;
      data.teams_entered = currentUserParticipationsDetails.teamsEntered ?? 0;
    }

    if (currentUserParticipationsDetails.amountRewardWon) {
      data.won_amount = currentUserParticipationsDetails.amountRewardWon ?? 0;
    }

    if (currentUserParticipationsDetails.roi) {
      data.ROI = currentUserParticipationsDetails.roi.toString() + "%";
    }

    if (currentUserParticipationsDetails.stakesWon) {
      data.stakes_won = currentUserParticipationsDetails.stakesWon ?? "";
    }

    return data;
  }, [currentUserParticipationsDetails]);

  const onClaimPrize = useCallback(() => {
    if (claimPrize.isPending) return;

    claimPrize.handleClaimPrize();
  }, [claimPrize.handleClaimPrize, claimPrize.isPending]);

  return (
    <Table className="text-nowrap whitespace-nowrap">
      <TableHeader className="[&>tr]:!border-b-0">
        <TableRow className="[&>th:not(:first-child)]:aeonik-light-13 [&>th:not(:first-child)]:h-[36px] [&>th:not(:first-child)]:text-text-secondary [&>th:not(:first-child)]:px-10 [&>th:not(:first-child)]:text-center">
          <TableHead className="w-[134px] h-[36px] rounded-tl-lg rounded-tr-lg bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 handjet-bold-16 text-background text-center">
            My game
          </TableHead>
          <TableHead>Votes Entered</TableHead>
          <TableHead>Votes Won</TableHead>
          <TableHead>Teams Entered</TableHead>
          <TableHead>Total Spent</TableHead>
          {(!isEnded || currentUserParticipationsDetails.isWinning) && (
            <TableHead>Won</TableHead>
          )}
          <TableHead>ROI</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&>tr:last-child>td:first-child]:rounded-bl-lg [&>tr:last-child>td:last-child]:rounded-br-lg [&>tr:first-child>td:last-child]:rounded-tr-lg">
        <TableRow
          className={cn(
            "[&>td]:py-[24px] bg-component-main hover:bg-component-main h-[48px] [&>td:first-child]:px-4 [&>td]:text-center [&>td]:handjet-bold-16"
          )}
        >
          <TableCell className="px-4 text-center text-text-secondary">
            <div className="flex items-center gap-x-3 rounded-3xl py-2 px-3 bg-component-main">
              {useMemo(
                () => (
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={user?.avatar ?? ""} />
                    <AvatarFallback>
                      <PlaceholderAvatar />
                    </AvatarFallback>
                  </Avatar>
                ),
                [user?.avatar]
              )}

              <span
                className={cn(
                  "uppercase max-w-[200px] truncate",
                  !isEnded
                    ? "text-transparent bg-clip-text bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2"
                    : "text-text-secondary"
                )}
              >
                {!isEnded
                  ? user?.username
                  : currentUserParticipationsDetails.isWinning
                  ? "You have"
                  : "No winning tickets"}{" "}
                {isEnded && currentUserParticipationsDetails.isWinning && (
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                    winning tickets
                  </span>
                )}
              </span>
            </div>
          </TableCell>
          <TableCell className="text-text-secondary">
            {formatData.stakes_entered ? formatData.stakes_entered : "--"}
          </TableCell>
          <TableCell
            className={cn(
              currentUserParticipationsDetails.isWinning
                ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2"
                : "text-text-secondary"
            )}
          >
            {isEnded ? formatData.stakes_won || "--" : "--"}
          </TableCell>
          <TableCell className="text-text-secondary">
            {formatData.teams_entered ? formatData.teams_entered : "--"}
          </TableCell>
          <TableCell
            className={cn(
              isEnded
                ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2"
                : "text-text-secondary"
            )}
          >
            {formatData.total_spent ? `${formatData.total_spent} SOL` : "--"}
          </TableCell>
          {(!isEnded || currentUserParticipationsDetails.isWinning) && (
            <TableCell
              className={cn(
                currentUserParticipationsDetails.isWinning
                  ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2"
                  : "text-text-secondary"
              )}
            >
              {currentUserParticipationsDetails.isWinning
                ? `${formatData.won_amount} SOL`
                : "--"}
            </TableCell>
          )}
          <TableCell
            className={cn(
              currentUserParticipationsDetails.isWinning
                ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2"
                : "text-text-secondary"
            )}
          >
            {isEnded && formatData.ROI ? formatData.ROI : "--"}
          </TableCell>
          <TableCell>
            {!currentUserParticipationsDetails.doesUserHaveAlreadyClaimedGames &&
              currentUserParticipationsDetails.doesUserHaveClaimableGames &&
              currentUserParticipationsDetails.isWinning && (
                <Button
                  type="button"
                  onClick={onClaimPrize}
                  disabled={
                    !currentUserParticipationsDetails.doesUserHaveClaimableGames ||
                    claimPrize.isPending
                  }
                  variant="action_secondary"
                  size="lg"
                  className="rounded-full"
                >
                  {claimPrize.isPending ? (
                    <Loader
                      className=" border-black border-t-transparent"
                      size={20}
                    />
                  ) : !currentUserParticipationsDetails.doesUserHaveClaimableGames ? (
                    "Claimed"
                  ) : (
                    "Claim all"
                  )}
                </Button>
              )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
export default TableStatsCurentUser;
