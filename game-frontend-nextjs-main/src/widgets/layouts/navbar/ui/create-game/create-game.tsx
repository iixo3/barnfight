"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
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
import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";
import {
  CreateGameSchemaType,
  useCreateGameForm,
} from "./hooks/use-create-game-form";
import StageEight from "./ui/stages/stage-eight";
import StageFive from "./ui/stages/stage-five";
import StageFour from "./ui/stages/stage-four";
import StageOne from "./ui/stages/stage-one";
import StageSeven from "./ui/stages/stage-seven";
import StageSix from "./ui/stages/stage-six";
import StageThree from "./ui/stages/stage-three";
import StageTwo from "./ui/stages/stage-two";
import { useMemetankProgram } from "@/contract/memetank-data-access";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import Loader from "@/shared/ui/components/loaders/loader";
import { User } from "@/shared/types/user/user";

type CreateGameProps = {
  user: User | undefined | null;
};

const CreateGame: React.FC<CreateGameProps> = ({ user }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [previousStage, setPreviousStage] = useState<number>(0);
  const { createGame } = useMemetankProgram();

  const delta = useMemo(() => {
    return currentStage - previousStage;
  }, [currentStage, previousStage]);

  const { formMethods, next, prev, balanceSolana } = useCreateGameForm({
    onSubmit: onSubmitCreateGame,
    currentStage,
    setCurrentStage,
    setPreviousStage,
  });

  function onSubmitCreateGame(values: CreateGameSchemaType) {
    console.log("submit", values);
    createGame.mutateAsync(values).finally(async () => {
      setOpenDialog(false);
    });
  }

  return (
    <Dialog
      open={openDialog}
      defaultOpen={false}
      onOpenChange={(e) => {
        setOpenDialog(e);
        formMethods.reset();
        setTimeout(() => {
          setCurrentStage(0);
        }, 500);
      }}
    >
      <DialogTrigger asChild>
        <Button
          id="create-game-button"
          size="outer_icon"
          variant="default_outlined"
        >
          <Icon
            icon="plus"
            className="fill-text-secondary group-hover:fill-white"
            width={18}
            height={18}
          />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[380px] p-0 border-none bg-transparent shadow-none">
        <DialogDescription className="hidden invisible"></DialogDescription>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-x-2">
              <span className="handjet-bold-24 uppercase">create game</span>

              <div className="flex items-center gap-x-3 bg-system-modals rounded-3xl py-2 px-3">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback>
                    <PlaceholderAvatar />
                  </AvatarFallback>
                </Avatar>

                <span className="handjet-bold-16 text-text-offset gap-x-1 uppercase inline-flex items-center">
                  <span className="text-text-offset">by</span>{" "}
                  <span className="bg-clip-text truncate inline-block text-transparent bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 max-w-[80px]">
                    {user?.username}
                  </span>
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col bg-system-modals rounded-2xl pt-6 w-full gap-y-10 overflow-hidden">
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmitCreateGame)}>
              <div className="pl-5 pr-8">
                {currentStage === 0 && <StageOne delta={delta} />}
                {currentStage === 1 && <StageTwo delta={delta} />}
                {currentStage === 2 && <StageThree delta={delta} />}
                {currentStage === 3 && <StageFour delta={delta} />}
                {currentStage === 4 && <StageFive delta={delta} />}
                {currentStage === 5 && <StageSix delta={delta} />}
                {currentStage === 6 && (
                  <StageSeven
                    delta={delta}
                    balanceSolana={Number(balanceSolana)}
                  />
                )}
                {currentStage === 7 && <StageEight delta={delta} />}
              </div>
            </form>
          </FormProvider>

          <DialogFooter className="pb-5 w-full items-center justify-center flex flex-col gap-y-8">
            <div className="flex items-center gap-x-2">
              {currentStage > 0 && (
                <Button
                  disabled={createGame.isPending}
                  type="button"
                  onClick={createGame.isPending ? () => {} : prev}
                  className="uppercase"
                >{`<- back`}</Button>
              )}

              <Button
                disabled={createGame.isPending}
                type="button"
                variant={currentStage === 7 ? "action" : "default"}
                onClick={createGame.isPending ? () => {} : next}
                className="uppercase"
              >
                {createGame.isPending ? (
                  <Loader
                    className="border-black border-t-transparent"
                    size={20}
                  />
                ) : currentStage === 7 ? (
                  "START  🎮"
                ) : (
                  `next ->`
                )}
              </Button>
            </div>

            <div className="flex items-center gap-x-1.5">
              {Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 rounded-full overflow-hidden"
                  initial={false}
                >
                  <motion.div
                    className="w-full h-full bg-text-offset"
                    animate={{
                      backgroundColor:
                        currentStage >= index
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
export default CreateGame;
