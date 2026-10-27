import React, { memo, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/ui/components/table/table";
import { cn } from "@/shared/utils";
import { Game } from "@/shared/types/games/games";
import { formatPlacesString } from "@/shared/utils/format-places-string";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";

type TableStatsPlaceProps = {
  winner: Game["winners"][0];
  isEnded: boolean;
  tokensWinnersTotals: Record<
    string,
    { total_amount_wallet_sol: number; total_amount_wallet_token: number }
  >;
  participationsGameData: Record<string, string[]>;
};

interface TableData {
  name: string;
  team_prize: number;
  allocation: number;
  ticket_prize: number;
  won_by: string;
  stakes_won: number;
  stakes_won_total: number;
  total_spent: number;
  total_earned: string;

  stakes_total?: number;
  users_total?: number;
  share_per_stake?: number;
}

const TableStatsPlace: React.FC<TableStatsPlaceProps> = ({
  winner,
  isEnded,
  tokensWinnersTotals,
  participationsGameData,
}) => {
  const formatPlaceView = useMemo(() => {
    return formatPlacesString(winner.position);
  }, [winner.position]);

  const dataView = useMemo(() => {
    return winner.winner_distribution.map((winnerDistribution) => {
      const totalEarned =
        (winnerDistribution?.percentage / 100) *
        (tokensWinnersTotals[
          winner?.token_address as keyof typeof tokensWinnersTotals
        ]?.total_amount_wallet_sol ?? 0);

      return {
        name: winnerDistribution.name,
        team_prize:
          tokensWinnersTotals[
            winner?.token_address as keyof typeof tokensWinnersTotals
          ]?.total_amount_wallet_sol ?? 0,
        allocation: winnerDistribution.percentage,
        ticket_prize: 0,
        won_by: "",
        stakes_won: 0,
        stakes_won_total: 0,
        total_spent: 0,
        total_earned: totalEarned.toFixed(6),

        stakes_total:
          tokensWinnersTotals[
            winner?.token_address as keyof typeof tokensWinnersTotals
          ]?.total_amount_wallet_token ?? 0,
        users_total:
          participationsGameData[
            winner?.token_address as keyof typeof participationsGameData
          ]?.length ?? 0,
        share_per_stake: Number(totalEarned.toFixed(6)), // FIXME: TODO divide by number of tickets
      };
    });
  }, [tokensWinnersTotals, participationsGameData]);

  const isEquallySplit = useMemo(
    () => winner.winner_distribution[0].fair_distribution_all,
    [winner.winner_distribution]
  );
  const tableHeaders = useMemo(() => {
    if (isEquallySplit) {
      return [
        "Team Prize",
        "Allocation",
        "Votes (Total)",
        "Users (Total)",
        "Share per Stake",
      ];
    }

    return [
      "Team Prize",
      "Allocation",
      "TicketPrize",
      "Won by",
      "Votes Won",
      "Total Spent",
      "Total Earned",
    ];
  }, [winner, isEquallySplit]);

  return (
    <Table className="text-nowrap whitespace-nowrap">
      <TableHeader className="[&>tr]:!border-b-0">
        <TableRow className="[&>th:not(:first-child)]:aeonik-light-13 [&>th:not(:first-child)]:h-[36px] [&>th:not(:first-child)]:text-text-secondary [&>th:not(:first-child)]:px-10 [&>th:not(:first-child)]:text-center ">
          <TableHead
            className={cn(
              "px-10 h-[36px] flex items-center justify-center relative uppercase rounded-tl-lg rounded-tr-lg bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 handjet-bold-16 text-white text-center"
            )}
          >
            {formatPlaceView} place
            {isEnded && <AvatarMemoized token_address={winner.token_address} />}
          </TableHead>
          {tableHeaders.map((item, index) => (
            <TableHead key={index}>{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="[&>tr:last-child>td:first-child]:rounded-bl-lg [&>tr:last-child>td:last-child]:rounded-br-lg [&>tr:first-child>td:last-child]:rounded-tr-lg">
        {isEquallySplit ? (
          <EquallySplit
            is_ended={isEnded}
            data={dataView[0] as TableData}
            winner={dataView.slice(0, 1) as TableData[]}
            index={0}
          />
        ) : (
          dataView.map((data, index) => {
            return (
              <NotEquallySplit
                is_ended={isEnded}
                data={data as TableData}
                winner={dataView as TableData[]}
                index={index}
                key={index}
              />
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

const NotEquallySplit = ({
  data,
  winner,
  index,
  is_ended,
}: {
  data: TableData;
  winner: TableData[];
  index: number;
  is_ended: boolean;
}) => {
  return (
    <TableRow
      key={index}
      className={cn(
        "bg-component-main hover:bg-component-main h-[48px] [&>td]:py-3 [&>td:first-child]:px-4 [&>td]:text-center [&>td:not(:first-child)]:handjet-bold-16",
        index === 0 && "[&>td]:pt-[34px]",
        index === winner.length - 1 && "[&>td]:pb-[34px]"
      )}
    >
      <TableCell className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 handjet-bold-16 uppercase">
        {data.name} {`#${index + 1}`}
      </TableCell>
      <TableCell className="text-text-secondary">
        {is_ended && data.team_prize ? `${data.team_prize} SOL` : "--"}
      </TableCell>
      <TableCell className="text-text-secondary">
        {data.allocation ? `${data.allocation}%` : "--"}
      </TableCell>
      <TableCell
        className={cn(
          is_ended
            ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2"
            : "text-text-secondary"
        )}
      >
        {is_ended && data.ticket_prize ? `${data.ticket_prize} SOL` : "--"}
      </TableCell>
      <TableCell>
        {is_ended && data.won_by ? (
          <div className="flex items-center gap-x-2.5 justify-center">
            <Avatar className="w-5 h-5">
              <AvatarImage src={data.won_by ?? ""} />
              <AvatarFallback>
                <PlaceholderAvatar />
              </AvatarFallback>
            </Avatar>
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
              {data.won_by}
            </span>
          </div>
        ) : (
          <span className="text-text-secondary">--</span>
        )}
      </TableCell>
      <TableCell>
        {is_ended && data.stakes_won ? (
          <>
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
              {data.stakes_won}
            </span>{" "}
            <span className="text-text-secondary">
              / {data.stakes_won_total}
            </span>
          </>
        ) : (
          <span className="text-text-secondary">--</span>
        )}
      </TableCell>
      <TableCell
        className={cn(
          is_ended
            ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2"
            : "text-text-secondary"
        )}
      >
        {is_ended && data.total_spent ? `${data.total_spent} SOL` : "--"}
      </TableCell>
      <TableCell
        className={cn(
          is_ended
            ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2"
            : "text-text-secondary"
        )}
      >
        {is_ended && data.total_earned ? `${data.total_earned} SOL` : "--"}
      </TableCell>
    </TableRow>
  );
};

const EquallySplit = ({
  data,
  winner,
  index,
  is_ended,
}: {
  data: TableData;
  winner: TableData[];
  index: number;
  is_ended: boolean;
}) => {
  return (
    <TableRow
      key={index}
      className={cn(
        "bg-component-main hover:bg-component-main h-[48px] [&>td]:py-3 [&>td:first-child]:px-4 [&>td]:text-center [&>td:not(:first-child)]:handjet-bold-16",
        index === 0 && "[&>td]:pt-[34px]",
        index === winner.length - 1 && "[&>td]:pb-[34px]"
      )}
    >
      <TableCell className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 handjet-bold-16 uppercase">
        Equally Split
      </TableCell>
      <TableCell
        className={cn(
          is_ended
            ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 uppercase"
            : "text-text-secondary"
        )}
      >
        {is_ended && data.team_prize ? `${data.team_prize} SOL` : "--"}
      </TableCell>
      <TableCell className="text-text-secondary">
        {data.allocation ? `${data.allocation}%` : "--"}
      </TableCell>
      <TableCell
        className={cn(
          is_ended
            ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 uppercase"
            : "text-text-secondary"
        )}
      >
        {is_ended && data?.stakes_total ? data?.stakes_total : "--"}
      </TableCell>
      <TableCell
        className={cn(
          is_ended
            ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 uppercase"
            : "text-text-secondary"
        )}
      >
        {is_ended && data?.users_total ? data?.users_total : "--"}
      </TableCell>
      <TableCell
        className={cn(
          is_ended
            ? "bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 uppercase"
            : "text-text-secondary"
        )}
      >
        {is_ended && data?.share_per_stake
          ? `${data?.share_per_stake} SOL`
          : "--"}
      </TableCell>
    </TableRow>
  );
};

const AvatarMemoized = memo(({ token_address }: { token_address: string }) => {
  return (
    <Avatar className="w-10 h-10 absolute left-[83%]">
      <AvatarImage src={`/api/tokens/${token_address}/image`} />
      <AvatarFallback>
        <PlaceholderAvatar />
      </AvatarFallback>
    </Avatar>
  );
});

export default TableStatsPlace;
