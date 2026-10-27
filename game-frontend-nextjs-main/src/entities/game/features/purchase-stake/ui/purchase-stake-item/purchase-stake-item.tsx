"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import React, { useMemo } from "react";
import PurchaseEvent from "../purchase-event/purchase-event";
import { useGetToken } from "@/shared/hooks/game/use-get-tokens";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { GameBattleToken } from "@/shared/types/games/games";
import { cn } from "@/shared/utils";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type PurchaseStakeItemProps = {
  spot: string | number;
  tokenDetails: GameBattleToken & { ticketsBought: number };
  balanceTickets: number | string;
  priceTicket: number | string;
  priceSolana: number | string;
  gameId: string;
  isAuthenticated: boolean;
  isLoadingAuthentication: boolean;
  is_ended: boolean;
};

const PurchaseStakeItem: React.FC<PurchaseStakeItemProps> = ({
  spot,
  tokenDetails,
  balanceTickets,
  priceTicket,
  priceSolana,
  gameId,
  isAuthenticated,
  isLoadingAuthentication,
  is_ended,
}) => {
  const { data: tokenMetadata } = useGetToken(tokenDetails.token_address);

  const { setVisible, visible } = useWalletModal();

  const nameView = useMemo(() => {
    if (tokenMetadata?.symbol) return `TEAM ${tokenMetadata.symbol}`;

    if (tokenMetadata?.name) return tokenMetadata.name;

    if (tokenDetails?.token_address) return tokenDetails.token_address;

    return "-";
  }, [tokenMetadata, tokenDetails]);

  return (
    <div className="flex items-center justify-between px-2 py-1.5 gap-x-2 rounded-xl hover:bg-component-highlight transition-all group">
      <div className="flex items-center gap-x-2 flex-grow min-w-0">
        <span className="handjet-bold-16 text-text-offset flex-shrink-0">
          {spot}
        </span>
        <div className="flex items-center gap-x-[13px] flex-grow min-w-0">
          {useMemo(
            () => (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage
                  src={`/api/tokens/${tokenDetails.token_address}/image`}
                />
                <AvatarFallback>
                  <PlaceholderAvatar />
                </AvatarFallback>
              </Avatar>
            ),
            [tokenDetails.token_address]
          )}

          <span className="handjet-bold-16 uppercase truncate text-text-secondary group-hover:text-text-highlight flex-grow min-w-0">
            {nameView}
          </span>
        </div>
      </div>

      <div
        className={cn(
          !isLoadingAuthentication && "group",
          "flex items-center gap-x-2 flex-shrink-0"
        )}
      >
        {isAuthenticated && !isLoadingAuthentication && (
          <span className="group-hover:hidden block handjet-bold-16 text-text-secondary uppercase group-hover:text-text-highlight whitespace-nowrap">
            {tokenDetails.ticketsBought} votes
          </span>
        )}
        <span className="group-hover:block hidden handjet-bold-16 text-text-secondary uppercase group-hover:text-text-highlight whitespace-nowrap">
          {is_ended ? `${tokenDetails.ticketsBought} votes` : "Cast vote"}
        </span>
        {!is_ended && (
          <>
            {isAuthenticated ? (
              <PurchaseEvent
                avatar_url={`/api/tokens/${tokenDetails.token_address}/image`}
                name={tokenMetadata?.symbol || "-"}
                ticketsBought={tokenDetails.ticketsBought}
                balance={balanceTickets}
                priceTicket={priceTicket}
                priceSolana={priceSolana}
                gameId={gameId}
                tokenAddress={tokenDetails.token_address}
              />
            ) : (
              <Button
                onClick={() => !visible && setVisible(true)}
                className="group-hover:flex hidden"
                size="outer_icon"
                variant="action"
              >
                <Icon
                  icon="double-chevron-up"
                  className="fill-white rotate-[270px]"
                  width={15}
                  height={15}
                />
              </Button>
            )}

            <Button
              className="group-hover:hidden flex"
              size="outer_icon"
              variant="default_group_hovered"
            >
              <Icon
                icon="ticket"
                className="fill-text-secondary group-hover:fill-text-highlight"
                width={17.5}
                height={17.5}
              />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
export default PurchaseStakeItem;
