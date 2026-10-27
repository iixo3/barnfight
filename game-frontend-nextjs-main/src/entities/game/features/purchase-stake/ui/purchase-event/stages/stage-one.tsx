import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/shared/ui/components/input/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import Icon from "@/shared/ui/components/icon/icon";

type StageOneProps = {
  delta: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tickets: string;
  error: string;
  name: string;
  avatar_url: string;
  balance: number;
  ticketsBought: number | string;
  priceTicket: number;
};

const StageOne: React.FC<StageOneProps> = ({
  delta,
  handleChange,
  tickets,
  error,
  name,
  avatar_url,
  balance,
  ticketsBought,
  priceTicket,
}) => {
  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-10"
    >
      <div className="flex flex-col gap-y-3">
        <span className="handjet-bold-20 text-white">HOW BARNFIGHT WORKS</span>
        <span className="aeonik-light-13 text-text-secondary">
          If Team {name} wins, each $VOTE cast gives you a chance to win{" "}
          <span className="uppercase">${name}</span> tokens and claim them from
          the game funds.
        </span>
      </div>

      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-3">
            <span className="handjet-bold-20 text-white">$VOTE FOR {name}</span>

            <div className="flex items-center gap-x-1">
              <span className="aeonik-light-13 text-text-secondary">
                Pre-Purchase:{" "}
              </span>

              <Icon icon="ticket-fill" width={14} height={14} color="white" />

              <span className="aeonik-light-14 text-white uppercase">
                {new Intl.NumberFormat("en-US", {
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                }).format(Number(balance))}{" "}
                $votes
              </span>
            </div>
          </div>

          <Input
            placeholder="Cast votes"
            value={tickets}
            onChange={handleChange}
          />

          {tickets.length > 0 && (
            <span className="aeonik-light-13 text-text-secondary">
              You will pledge ~
              {Number(Number(priceTicket) * Number(tickets)).toFixed(5)} SOL to
              game funds
            </span>
          )}

          {error && (
            <span className="handjet-bold-13 text-brand-gradient-red-1">
              {error}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-[13px]">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatar_url} />
                <AvatarFallback>
                  <PlaceholderAvatar />
                </AvatarFallback>
              </Avatar>

              <span className="handjet-bold-16 text-text-secondary uppercase">
                {name}
              </span>
            </div>
          </div>

          <span className="uppercase handjet-bold-16 text-text-secondary">
            Now:{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
              {ticketsBought} {name} votes
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
export default StageOne;
