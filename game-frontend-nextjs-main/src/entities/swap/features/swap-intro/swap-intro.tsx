import GetTicketWorms from "@/shared/assets/images/svgs/get-ticket-worms";
import SingleWorm from "@/shared/assets/images/svgs/single-worm";
import React from "react";

type SwapIntroProps = {};

const SwapIntro: React.FC<SwapIntroProps> = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -z-10 top-1/2 -translate-y-1/2 left-[20%] w-[20%] h-[50%] bg-brand-gradient-green-1 opacity-15"></div>
      <div className="absolute -z-10 top-1/2 -translate-y-1/2 left-[40%] w-[20%] h-[50%] bg-brand-gradient-green-2 opacity-15"></div>
      <div className="absolute -z-10 top-1/2 -translate-y-1/2 left-[60%] w-[20%] h-[50%] bg-brand-gradient-red-2 opacity-15"></div>

      <div className="rounded-[20px] flex-wrap isolate border relative border-stroke-main bg-component-main/50 backdrop-blur-2xl flex gap-y-10 items-center py-5 lg:py-[35px] px-5 lg:px-[50px]">
        <div className="flex-1 w-full basis-[300px]">
          <div className="flex flex-col gap-y-2.5 max-w-[367px] w-full">
            <div className="flex flex-col gap-y-[2px]">
              <span className="handjet-bold-32 text-white">{"->"}</span>
              <span className="handjet-bold-34 bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                Want to play game?
              </span>
            </div>
            <span className="aeonik-light-14 text-white">
              Experience the excitement of reward distributions in our game.
              Test your luck, make strategic choices, and feel the adrenaline as
              you compete for potentially big rewards!
            </span>
          </div>
        </div>

        <div className="flex-1 flex justify-end w-full">
          <div className="flex items-center gap-x-[4%] w-fit">
            <div className="flex items-center justify-center aspect-square w-[min(30vw,142px)] relative">
              <SingleWorm />
            </div>

            <div className="flex items-center justify-center aspect-square w-[min(40vw,250px)] relative">
              <GetTicketWorms />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SwapIntro;
