import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";

type StageTwoProps = {
  delta: number;
  ticketsToBuy: string;
  priceTicket: number;
  priceSolana: number;
  avatar_url: string;
  name: string;
};

const StageTwo: React.FC<StageTwoProps> = ({
  delta,
  ticketsToBuy,
  priceTicket,
  priceSolana,
  avatar_url,
  name,
}) => {
  const prices = useMemo(() => {
    const ticketsPriceInSolana = Number(priceTicket) * Number(ticketsToBuy);
    const solanaInUsd = Number(ticketsPriceInSolana) * Number(priceSolana);

    const tickets = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 4,
    }).format(Number(ticketsPriceInSolana));

    const solana = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(Number(solanaInUsd));

    return {
      tickets,
      solana,
    };
  }, [priceTicket, priceSolana, ticketsToBuy]);

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-3"
    >
      <div className="flex flex-col gap-y-3">
        <span className="handjet-bold-20 text-white">Game mechanics</span>
        <span className="aeonik-light-13 text-text-secondary">
          {/* Instead of receiving the $SOL from trading your ticket, you will
          receive <span className="font-bold">{name} Stake</span>, and the funds
          will be added to the game instead. */}
          Instead of selling your $VOTE for $SOL, you'll pledge it to Team{" "}
          {name}, adding it to the game pool for a chance to win ${name} tokens.
        </span>
      </div>

      <div className="h-full flex flex-col gap-y-[3px] w-[1px]">
        <div className="w-full h-[5.3px] bg-transparent"></div>
        <div className="w-full h-[3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-transparent"></div>
      </div>

      <div className="flex items-center gap-x-2">
        <div className="flex items-center gap-x-[13px]">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatar_url} />
            <AvatarFallback>
              <PlaceholderAvatar />
            </AvatarFallback>
          </Avatar>

          <span className="handjet-bold-16 text-white">
            <span className="uppercase">{ticketsToBuy} $votes</span> for{" "}
            <span className="uppercase bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
              {name}
            </span>{" "}
            <span className="uppercase">
              (~{prices.tickets} SOL, ~${prices.solana})
            </span>{" "}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
export default StageTwo;
