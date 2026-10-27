"use client";

import { useMutationObserver } from "@/shared/hooks/basic/use-mutation-observer";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

type ConfettiWrapperProps = {};

const ConfettiWrapper: React.FC<ConfettiWrapperProps> = () => {
  const [runConfetti, setRunConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  const confettiTriggerRef = useMutationObserver<HTMLCanvasElement>(
    (mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-run-confetti-active"
        ) {
          const confettiState = (
            mutation.target as HTMLCanvasElement
          ).getAttribute("data-run-confetti-active");

          setRunConfetti(confettiState === "true");
          break;
        }
      }
    }
  );

  useEffect(() => {
    if (runConfetti) {
      const timeout = setTimeout(() => {
        setRecycleConfetti(false);
      }, 1000 * 60 * 2);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [runConfetti]);

  useEffect(() => {
    setDimensions({
      width: window?.innerWidth,
      height: window?.innerHeight - 68,
    });
  }, []);

  return (
    <Confetti
      id="confetti-wrapper-trigger"
      ref={confettiTriggerRef}
      run={runConfetti}
      recycle={recycleConfetti}
      onConfettiComplete={(confetti) => {
        setRunConfetti(false);
      }}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute w-full top-0 mt-[68px] left-0"
    />
  );
};
export default ConfettiWrapper;
