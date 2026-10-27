"use client";

import { ExchangeRates } from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";
import { useGameWinners, useGetSpent } from "@/shared/hooks/game/use-games";
import { useGetAccountUserData } from "@/shared/hooks/user/use-get-user-data";
import { Game } from "@/shared/types/games/games";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import Icon from "@/shared/ui/components/icon/icon";
import { IconsListProp } from "@/shared/ui/components/icon/icon.types";
import TimeRemaining from "@/shared/ui/components/time-remaining/time-remaining";
import { cn } from "@/shared/utils";
import { formatPlacesString } from "@/shared/utils/format-places-string";
import { formatPrice } from "@/shared/utils/format-price";
import Link from "next/link";
import React, { memo, useMemo } from "react";

type DiscoveryGameCardProps = {
  game: Game;
  listIndex: string | number;
  type: "popular" | "hosted" | "history" | string;
  exchangeRates: ExchangeRates;
};

const DiscoveryGameCard: React.FC<DiscoveryGameCardProps> = ({
  game,
  listIndex,
  type,
  exchangeRates,
}) => {
  const { data: gameWinners } = useGameWinners(game.id);

  const winnersPlacesFormatted = useMemo(() => {
    const places = gameWinners?.places || [];

    if (!places || places.length === 0) return null;

    return places
      ?.map((place: number | string) => {
        return formatPlacesString(place);
      })
      .join(", ");
  }, [gameWinners]);

  const poolSize = useMemo(() => {
    return formatPrice(Number(game.total_reward));
  }, [game.total_reward]);

  const streamers = useMemo(() => {
    return (game.streamers as unknown as number) ?? 0;
  }, [game.streamers]);

  const revenue = useMemo(() => {
    if (type !== "hosted") return 0;

    return ((10 / 100) * Number(game.total_reward)).toFixed(4);
  }, [game.total_reward, type]);

  const tickets = useMemo(() => {
    return gameWinners?.tickets || "-";
  }, [gameWinners]);

  const isEnded = useMemo(() => game?.is_ended || false, [game?.is_ended]);

  const isWinningTicket = {
    win: false,
    reward: "TICKET 1 - 35%",
    amount: 10,
  };

  const tokensListed = useMemo(() => {
    const tokens = game?.tokens || [];

    return Array.from({ length: 6 }).map((_, index) => {
      let token = tokens?.[index]?.token_address
        ? tokens?.[index]?.token_address
        : null;

      return {
        token_address: token,
      };
    });
  }, [game?.tokens]);

  const spent = useGetSpent(game.id, exchangeRates);

  const viewCardByType = useMemo(() => {
    const baseView = {
      icon: "ticket" as IconsListProp,
      label: "Tickets",
      value: undefined as string | undefined,
    };

    switch (type) {
      case "popular":
        return {
          ...baseView,
          value: tickets,
        };
      case "hosted":
        return {
          icon: "percentage-box",
          label: "Revenue",
          value: revenue,
        };
      case "history":
        return {
          ...baseView,
          label: isEnded
            ? isWinningTicket.win
              ? "Won"
              : "No winning ticket"
            : !!spent
            ? "Spent -"
            : "No tickets yet",
          value: isEnded
            ? isWinningTicket.win
              ? isWinningTicket.reward
              : null
            : `$${spent}`,
        };
      default:
        return baseView;
    }
  }, [type, spent, isWinningTicket, isEnded, tickets]);

  const { data: user, isLoading } = useGetAccountUserData(game.creator);

  const username = useMemo(() => {
    if (!isLoading) {
      if (!user?.username) return "-";

      if (user?.username.length > 15)
        return user?.username.slice(0, 15) + "...";

      return user?.username;
    }

    return "-";
  }, [user?.username, isLoading]);

  return useMemo(() => {
    return (
      <Link
        href={`/game/${game.id}`}
        className="bg-component-main hover:bg-component-highlight flex-wrap transition-all duration-300 cursor-pointer border border-component-highlight rounded-[20px] py-[17px] pl-9 pr-7 flex items-center justify-between gap-y-4 gap-x-2"
      >
        <div className="flex items-center gap-x-10 text-nowrap flex-nowrap min-w-0">
          <span className="handjet-bold-20 text-text-offset">{listIndex}</span>
          <div className="flex flex-col gap-y-1 min-w-0">
            <span className="handjet-bold-20 text-text-secondary uppercase truncate max-w-[300px] w-full min-w-0">
              {game.name}
            </span>
            <span className="handjet-bold-16 uppercase">
              🔥{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gradient-red-1 to-brand-gradient-red-2">
                Battle Royal{" "}
                {winnersPlacesFormatted &&
                  `- ${winnersPlacesFormatted} place wins`}
              </span>
            </span>
          </div>
        </div>

        <div className="ml-12 truncate grow-[4] shrink-[1] basis-[auto] flex items-center gap-4 justify-start flex-wrap lg:flex-nowrap">
          {type === "history" && !isWinningTicket.win && (
            <div
              className={cn(
                "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
                "gap-x-3 flex-nowrap text-nowrap overflow-hidden"
              )}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback>
                  <PlaceholderAvatar />
                </AvatarFallback>
              </Avatar>

              <span className="handjet-bold-16 uppercase truncate max-w-full text-brand-gradient-red-1 flex items-center gap-x-1">
                <span className="text-text-secondary">created by</span>{" "}
                <span className="bg-clip-text text-transparent truncate max-w-full bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2">
                  {username}
                </span>
              </span>
            </div>
          )}

          {type === "popular" && !isEnded && (
            <div
              className={cn(
                "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
                "gap-x-2 flex-nowrap text-nowrap"
              )}
            >
              <div className="w-[15px] h-[15px] bg-[#F42626] rounded-full mb-[1px] animate-pulse"></div>
              <span className="handjet-bold-16 text-text-secondary">LIVE</span>
            </div>
          )}

          <div
            className={cn(
              "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
              "gap-x-2 flex-nowrap text-nowrap"
            )}
          >
            <Icon
              icon="timer"
              className="fill-text-secondary"
              width={17}
              height={20}
            />

            <TimeRemaining
              dateFuture={game.end_date}
              format="DD,hh,mm,ss"
              withSkeleton={false}
              customText={(time) => {
                return (
                  <span className="text-text-secondary handjet-bold-16">
                    Ends in{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                      {time}
                    </span>
                  </span>
                );
              }}
              completedView={
                <span className="handjet-bold-16 text-text-secondary">
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
              }
            />
          </div>

          <div
            className={cn(
              "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
              "gap-x-2 flex-nowrap text-nowrap"
            )}
          >
            <Icon
              icon="ticket"
              className="fill-text-secondary"
              width={20}
              height={20}
            />

            <span className="handjet-bold-16 text-text-secondary uppercase">
              Pool{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                {poolSize}
              </span>
            </span>
          </div>

          <div
            className={cn(
              "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
              "gap-x-2 flex-nowrap text-nowrap"
            )}
          >
            <Icon
              icon={viewCardByType.icon as IconsListProp}
              className="fill-text-secondary"
              width={20}
              height={20}
            />

            <span className="handjet-bold-16 text-text-secondary uppercase">
              {viewCardByType.label}{" "}
              {viewCardByType.value && (
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                  {viewCardByType.value}
                </span>
              )}
            </span>
          </div>

          {type === "history" && isEnded && isWinningTicket.win && (
            <>
              <div
                className={cn(
                  "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
                  "gap-x-2 flex-nowrap text-nowrap"
                )}
              >
                <Icon
                  icon={"ticket"}
                  className="fill-text-secondary"
                  width={20}
                  height={20}
                />

                <span className="handjet-bold-16 text-text-secondary uppercase">
                  Spent -{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                    ${spent}
                  </span>
                </span>
              </div>

              <div
                className={cn(
                  "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
                  "gap-x-2 flex-nowrap text-nowrap"
                )}
              >
                <Icon
                  icon={"ticket"}
                  className="fill-text-secondary"
                  width={20}
                  height={20}
                />

                <span className="handjet-bold-16 text-text-secondary uppercase">
                  Wins -{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                    ${isWinningTicket.amount}
                  </span>
                </span>
              </div>
            </>
          )}

          {type !== "history" && (
            <div
              className={cn(
                "py-3 px-4 rounded-xl bg-component-highlight flex items-center",
                "gap-x-2 flex-nowrap text-nowrap"
              )}
            >
              <Icon
                icon="camera"
                className="fill-text-secondary"
                width={19}
                height={12}
              />

              <span className="handjet-bold-16 uppercase bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                {streamers}
              </span>
            </div>
          )}
        </div>

        {tokensListed && tokensListed?.length > 0 && (
          <div className="ml-12 overflow-x-auto no-scrollbar py-3 px-5 rounded-2xl bg-component-highlight flex items-center gap-x-2">
            {tokensListed.map((token, index) => (
              <TokenImage key={index} token_address={token.token_address} />
            ))}
          </div>
        )}
      </Link>
    );
  }, [
    game.id,
    username,
    user,
    type,
    winnersPlacesFormatted,
    spent,
    isWinningTicket.win,
  ]);
};

const TokenImage = memo(
  ({ token_address }: { token_address: string | null }) => {
    return (
      <Avatar className="w-8 h-8">
        <AvatarImage src={`/api/tokens/${token_address}/image`} />
        <AvatarFallback></AvatarFallback>
      </Avatar>
    );
  }
);

export default DiscoveryGameCard;
