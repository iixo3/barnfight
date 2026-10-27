import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import { motion } from "framer-motion";
import React from "react";

type TutorialStepOneProps = {
  delta: number;
};

const TutorialStepOne: React.FC<TutorialStepOneProps> = ({ delta }) => {
  const { RiveComponent } = useRive({
    src: "/riv/step-one.riv",
    layout: new Layout({
      fit: Fit.FitHeight, // Change to: rive.Fit.Contain, or Cover
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center justify-center gap-y-[30px]"
    >
      <div className="w-full h-[335px] m-0 p-0">
        <RiveComponent />
      </div>

      <div className="flex flex-col items-center justify-center gap-y-5">
        <span className="text-white handjet-bold-18 leading-[32px] text-center">
          1. Vote for any PROJECT
        </span>

        <span className="aeonik-light-14 text-center !font-light text-white">
          Each game features a variety of projects to vote on. Cast your{" "}
          <span className="font-bold">$VOTE</span> for a chance to win exciting
          community rewards from the game prize pool!
        </span>
      </div>
    </motion.div>
  );
};
export default TutorialStepOne;
