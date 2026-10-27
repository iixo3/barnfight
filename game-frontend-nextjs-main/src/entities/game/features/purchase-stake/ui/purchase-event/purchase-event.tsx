"use client";

import { useMemetankProgram } from "@/contract/memetank-data-access";
import { Button } from "@/shared/ui/components/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/components/dialog/dialog";
import Icon from "@/shared/ui/components/icon/icon";
import Loader from "@/shared/ui/components/loaders/loader";
import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { z } from "zod";
import StageOne from "./stages/stage-one";
import StageTwo from "./stages/stage-two";
import { useExchangeRates } from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";
import { revalidateBalance } from "@/shared/hooks/wallet/use-get-balance";

type PurchaseEventProps = {
  name: string;
  ticketsBought: string | number;
  avatar_url: string;
  balance: string | number;
  priceTicket: string | number;
  priceSolana: string | number;
  gameId: string;
  tokenAddress: string;
};

const validateInputPurchaseTickets = z.object({
  tickets: z.coerce
    .number({ message: "Must be a number" })
    .int({ message: "Must be an integer" })
    .min(1, { message: "Minimum 1 ticket" }),
});

const PurchaseEvent: React.FC<PurchaseEventProps> = ({
  avatar_url,
  name,
  ticketsBought,
  balance,
  priceTicket,
  priceSolana,
  gameId,
  tokenAddress,
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [previousStage, setPreviousStage] = useState<number>(1);
  const { joinGame } = useMemetankProgram();

  const delta = useMemo(() => {
    return currentStage - previousStage;
  }, [currentStage, previousStage]);

  const [ticketsValue, setTicketsValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const next = async () => {
    if (currentStage === 1) {
      const { success, error } = validateInputPurchaseTickets.safeParse({
        tickets: ticketsValue,
      });

      if (!success) {
        const errorParsed = JSON.parse(error.message)[0];
        setError(errorParsed.message);
        return;
      }

      setPreviousStage(currentStage);
      setCurrentStage((step) => step + 1);
      return;
    }

    joinGame
      .mutateAsync({
        gameId: gameId,
        tokenAddress: tokenAddress,
        ticketAmount: parseInt(ticketsValue),
      })
      .finally(async () => {
        setOpenDialog(false);
        await revalidateBalance();
      });
  };

  const prev = () => {
    if (currentStage > 1) {
      setPreviousStage(currentStage);
      setCurrentStage((step) => step - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTicketsValue(value);

    const { success, error } = validateInputPurchaseTickets.safeParse({
      tickets: value,
    });

    if (success) {
      setError("");
      return;
    }

    const errorParsed = JSON.parse(error.message)[0];
    setError(errorParsed.message);
  };

  return (
    <Dialog
      open={openDialog}
      defaultOpen={false}
      onOpenChange={(e) => {
        setOpenDialog(e);
        setTimeout(() => {
          setError("");
          setTicketsValue("");
          setCurrentStage(1);
          setPreviousStage(1);
        }, 500);
      }}
    >
      <DialogTrigger asChild>
        <Button
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
      </DialogTrigger>

      <DialogContent className="sm:max-w-[380px] p-0 border-none bg-transparent shadow-none">
        <DialogDescription className="hidden invisible"></DialogDescription>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-x-2">
              <span className="handjet-bold-24 uppercase">
                VOTE FOR TEAM {name}
              </span>

              {/* <div className="flex items-center gap-x-2 bg-system-modals rounded-3xl py-1 px-3">
                <Icon
                  icon="ticket-fill"
                  width={16}
                  height={15}
                  className="fill-white"
                />

                <span className="handjet-bold-18 text-white uppercase">
                  {new Intl.NumberFormat("en-US", {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  }).format(Number(balance))}{" "}
                  ticket
                </span>
              </div> */}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col bg-system-modals rounded-2xl pt-6 w-full gap-y-10 overflow-hidden">
          <div className="pl-5 pr-8">
            {currentStage === 1 && (
              <StageOne
                delta={delta}
                handleChange={handleChange}
                tickets={ticketsValue}
                error={error}
                name={name}
                avatar_url={avatar_url}
                balance={Math.floor(Number(balance))}
                ticketsBought={Math.floor(Number(ticketsBought))}
                priceTicket={Number(priceTicket)}
              />
            )}
            {currentStage === 2 && (
              <StageTwo
                avatar_url={avatar_url}
                delta={delta}
                ticketsToBuy={ticketsValue}
                priceTicket={Number(priceTicket)}
                priceSolana={Number(priceSolana)}
                name={name}
              />
            )}
          </div>

          <DialogFooter className="pb-5 w-full items-center justify-center flex flex-col gap-y-8">
            <div className="flex items-center gap-x-2">
              {currentStage > 1 && (
                <Button
                  type="button"
                  onClick={prev}
                  className="uppercase"
                >{`<- back`}</Button>
              )}

              <Button
                disabled={joinGame.isPending}
                type="button"
                variant={currentStage === 2 ? "action_secondary" : "default"}
                onClick={next}
                className="uppercase"
              >
                {joinGame.isPending ? (
                  <Loader
                    className=" border-black border-t-transparent"
                    size={20}
                  />
                ) : currentStage === 2 ? (
                  `Swap`
                ) : (
                  `next ->`
                )}
              </Button>
            </div>

            <div className="flex items-center gap-x-1.5">
              {Array.from({ length: 2 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 rounded-full overflow-hidden"
                  initial={false}
                >
                  <motion.div
                    className="w-full h-full bg-text-offset"
                    animate={{
                      backgroundColor:
                        currentStage >= index + 1
                          ? "#FFFFFF"
                          : "var(--text-offset)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PurchaseEvent;
