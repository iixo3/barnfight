import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
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
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import TutorialStepOne from "./ui/steps/TutorialStepOne";
import TutorialStepTwo from "./ui/steps/TutorialStepTwo";
import TutorialStepThree from "./ui/steps/TutorialStepThree";
import { useCheckAvailableTutorial } from "./ui/hooks/use-check-available-tutorial";

type TutorialGameProps = {};

const TutorialGame: React.FC<TutorialGameProps> = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previousStep, setPreviousStep] = useState<number>(1);

  const delta = useMemo(() => {
    return currentStep - previousStep;
  }, [currentStep, previousStep]);

  const next = async () => {
    setPreviousStep(currentStep);
    setCurrentStep((step) => step + 1);
  };

  const prev = () => {
    if (currentStep > 1) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  //   const { setSeenTutorial, getSeenTutorial } = useCheckAvailableTutorial();
  const handleCloseTutorial = () => {
    setOpenDialog(false);
    setCurrentStep(1);
    setPreviousStep(1);

    // if (!getSeenTutorial) {
    //   setSeenTutorial(true);
    // }
  };

  return (
    <Dialog
      open={openDialog}
      defaultOpen={false}
      onOpenChange={(e) => {
        setOpenDialog(e);
        setTimeout(() => {
          setCurrentStep(1);
          setPreviousStep(1);
        }, 500);
      }}
    >
      <DialogTrigger asChild>
        <Button
          id="tutorial-game-button"
          size="outer_icon"
          variant="default_outlined"
        >
          <Icon
            icon="tutorial"
            className="fill-text-secondary group-hover:fill-white"
            width={12}
            height={18}
          />
        </Button>
      </DialogTrigger>

      <DialogContent
        showClose={false}
        className="sm:max-w-[320px] p-0 border-none bg-transparent shadow-none"
        overlayColorClassName="bg-[#181818ed]"
      >
        <DialogDescription className="hidden invisible"></DialogDescription>
        <DialogHeader>
          <DialogTitle hidden></DialogTitle>
        </DialogHeader>

        <div className="flex flex-col w-full gap-y-[30px] overflow-hidden">
          <div>
            {currentStep === 1 && <TutorialStepOne delta={delta} />}
            {currentStep === 2 && <TutorialStepTwo delta={delta} />}
            {currentStep === 3 && <TutorialStepThree delta={delta} />}
          </div>

          <DialogFooter className="w-full items-center justify-center flex flex-col gap-y-5 px-[26px]">
            <div className="flex items-center gap-x-1.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 rounded-full overflow-hidden"
                  initial={false}
                >
                  <motion.div
                    className="w-full h-full bg-text-offset"
                    animate={{
                      backgroundColor:
                        currentStep >= index + 1
                          ? "#FFFFFF"
                          : "var(--text-offset)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center flex-col gap-y-2 w-full">
              <div className="flex items-center gap-x-2.5 w-full">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={prev}
                    className="uppercase flex-1 text-white"
                  >{`<- back`}</Button>
                )}

                {currentStep < 3 && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={next}
                    className="uppercase flex-1 text-white"
                  >
                    {`next ->`}
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="default"
                onClick={handleCloseTutorial}
                className="uppercase w-full"
              >
                {`close`}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default TutorialGame;
