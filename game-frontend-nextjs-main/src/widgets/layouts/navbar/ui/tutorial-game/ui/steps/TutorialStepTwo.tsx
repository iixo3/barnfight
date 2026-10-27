import { motion } from "framer-motion";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import React from "react";

type TutorialStepTwoProps = {
  delta: number;
};

const TutorialStepTwo: React.FC<TutorialStepTwoProps> = ({ delta }) => {
  const { RiveComponent } = useRive({
    src: "/riv/step-two.riv",
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
      <div className="w-full h-[150px] m-0 p-0">
        <RiveComponent />
      </div>

      <div className="flex flex-col items-center justify-center gap-y-5">
        <span className="text-white handjet-bold-18 leading-[32px] text-center">
          2. Projects ARE RANKED through VOTES
        </span>

        <span className="aeonik-light-14 text-center !font-light text-white">
          Projects will be ranked from highest to lowest based on the total
          number of votes cast by players, with the results contributing to the
          game prize pool.
        </span>
      </div>
    </motion.div>
  );
};
export default TutorialStepTwo;
