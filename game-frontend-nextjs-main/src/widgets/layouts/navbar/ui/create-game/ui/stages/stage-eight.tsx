import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";
import { useFormContext } from "react-hook-form";
import { formatPlacesString } from "@/shared/utils/format-places-string";

type StageEightProps = {
  delta: number;
};

const StageEight: React.FC<StageEightProps> = ({ delta }) => {
  const { watch } = useFormContext<CreateGameSchemaType>();

  const { winners_places, game_length, blinds } = watch();

  const placesFormat = useMemo(() => {
    return winners_places
      .map((place) => {
        return formatPlacesString(place.place);
      })
      .join(" & ");
  }, [winners_places]);

  const formatDuration = useMemo(() => {
    if (game_length < 60) {
      return game_length + " " + "minutes";
    }

    return game_length / 60 + " " + "hours";
  }, [game_length]);

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-3"
    >
      <span className="handjet-bold-20 text-white">
        Format: {placesFormat} place wins
      </span>

      <div className="h-full flex flex-col gap-y-[3px] w-[1px]">
        <div className="w-full h-[5.3px] bg-transparent"></div>
        <div className="w-full h-[3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-transparent"></div>
      </div>

      <div className="flex flex-col gap-y-3">
        <span className="handjet-bold-20 text-white">Duration</span>
        <span className="aeonik-light-13 text-text-secondary">
          {formatDuration} starting now
        </span>
      </div>

      <div className="h-full flex flex-col gap-y-[3px] w-[1px]">
        <div className="w-full h-[5.3px] bg-transparent"></div>
        <div className="w-full h-[3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-transparent"></div>
      </div>

      <div className="flex flex-col gap-y-3">
        <span className="handjet-bold-20 text-white">Commission fees</span>
        <span className="aeonik-light-13 text-text-secondary">
          The creator and the platform will charge 10% of the pool split equally
          between them
        </span>
      </div>

      {!blinds.without_blinds && (
        <>
          <div className="h-full flex flex-col gap-y-[3px] w-[1px]">
            <div className="w-full h-[5.3px] bg-transparent"></div>
            <div className="w-full h-[3px] bg-text-offset"></div>
            <div className="w-full h-[5.3px] bg-text-offset"></div>
            <div className="w-full h-[3.3px] bg-text-offset"></div>
            <div className="w-full h-[3.3px] bg-text-offset"></div>
            <div className="w-full h-[5.3px] bg-transparent"></div>
          </div>

          <div className="flex flex-col gap-y-3">
            <span className="handjet-bold-20 text-white">“Big Blind”</span>
            <span className="aeonik-light-13 text-text-secondary">
              The creator will start the game with{" "}
              <span className="text-white">{blinds.blind} SOL</span>
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};
export default StageEight;
