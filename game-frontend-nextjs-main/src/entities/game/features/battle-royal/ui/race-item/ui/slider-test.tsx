import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import React from "react";
import { motion } from "framer-motion";

type SliderTestProps = {
  value: number;
  max: number;
};

const SliderTest: React.FC<SliderTestProps> = ({ value, max }) => {
  const percent = convertValueToPercentage(value, 0, max);

  return (
    <div className="relative">
      <span className="select-none touch-none items-center w-full flex relative">
        <span className="rounded-full overflow-hidden grow w-full h-3 relative bg-component-highlight">
          <motion.span
            animate={{
              right: `${percent}%`,
              width: `calc(${percent}% - 0%)`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="left-0 opacity-30 bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 h-full absolute"
          ></motion.span>
        </span>

        <motion.span
          animate={{
            left: `${percent}%`,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="transform -translate-x-1/2 absolute"
        >
          <span className="pointer-events-none transition-colors">
            <Avatar className="w-[36px] h-[36px]">
              <AvatarImage src={"A"} />
              <AvatarFallback>
                <div className="w-full h-full bg-blue-900 rounded-full text-white uppercase text-base flex items-center justify-center">
                  {"A"}
                </div>
              </AvatarFallback>
            </Avatar>
          </span>
        </motion.span>
      </span>
    </div>
  );
};
export default SliderTest;

function convertValueToPercentage(value: number, min: number, max: number) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return Math.min(100, Math.max(0, percentage));
}
