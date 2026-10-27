import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/shared/ui/components/slider/slider";
import { cn } from "@/shared/utils";
import { useFormContext } from "react-hook-form";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";

type StageThreeProps = {
  delta: number;
};

const StageThree: React.FC<StageThreeProps> = ({ delta }) => {
  const { setValue } = useFormContext<CreateGameSchemaType>();

  const [minutes, setMinutes] = useState<number>(1);
  const [hours, setHours] = useState<number>(0);

  const totalHours = useMemo(() => {
    if (minutes < 60) {
      setValue("game_length", minutes);
      return minutes;
    }

    const totalHoursInMinutes = ((hours || 1) * (minutes * 60 || 1)) / 60;

    setValue("game_length", totalHoursInMinutes);
    return totalHoursInMinutes;
  }, [minutes, hours]);

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-10"
    >
      <div className="flex flex-col gap-y-2">
        <span className="handjet-bold-20 text-white">Game length</span>
        <span className="text-text-offset aeonik-light-13">
          Select the duration for the game for maximum 12 days. After it ends,
          winning tickets will be randomly assigned.
        </span>
      </div>

      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <span className="handjet-bold-16 text-white">{minutes} MINUTES</span>
          <Slider
            min={1}
            max={60}
            value={[minutes]}
            onValueChange={(value) => setMinutes(value[0])}
          />
        </div>

        <div
          className={cn(
            "flex flex-col gap-y-2",
            minutes !== 60 ? "opacity-50 pointer-events-none" : ""
          )}
        >
          <span className="handjet-bold-16 text-white">{hours} HOURS</span>
          <Slider
            min={0}
            max={24}
            value={[hours]}
            onValueChange={(value) => minutes === 60 && setHours(value[0])}
          />
        </div>

        <span className="aeonik-light-13 text-text-secondary">
          Game ends ~{" "}
          {new Date(Date.now() + totalHours * 60 * 1000).toLocaleString(
            "en-US",
            {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
              hour12: false,
            }
          )}{" "}
          UTC
        </span>
      </div>
    </motion.div>
  );
};
export default StageThree;
