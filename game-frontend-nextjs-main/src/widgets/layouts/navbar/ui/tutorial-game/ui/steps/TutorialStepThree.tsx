import TutorialStepThreeSvg from "@/shared/assets/images/svgs/tutorial-step-three-svg";
import { motion } from "framer-motion";
import React from "react";

type TutorialStepThreeProps = {
  delta: number;
};

const TutorialStepThree: React.FC<TutorialStepThreeProps> = ({ delta }) => {
  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center justify-center gap-y-[30px]"
    >
      <div className="w-full m-0 p-0 flex items-center justify-center">
        <TutorialStepThreeSvg width={218} height={335} />
      </div>

      <div className="flex flex-col items-center justify-center gap-y-5">
        <span className="text-white handjet-bold-18 leading-[32px] text-center">
          3. PRe-purchase $VOTE
        </span>

        <span className="aeonik-light-14 text-center !font-light text-white">
          Each vote casted works within a bonding curve, allowing you to
          pre-purchase <span className="font-bold">$VOTE</span> at a better rate
          to maximise your impact on the game for less.
        </span>
      </div>
    </motion.div>
  );
};
export default TutorialStepThree;
