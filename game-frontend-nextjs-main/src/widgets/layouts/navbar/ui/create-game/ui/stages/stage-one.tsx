import { Input } from "@/shared/ui/components/input/input";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";
import { motion } from "framer-motion";

type StageOneProps = {
  delta: number;
};

const StageOne: React.FC<StageOneProps> = ({ delta }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateGameSchemaType>();

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-10"
    >
      <div className="flex flex-col gap-y-3">
        <span className="text-white handjet-bold-20">
          You are about to start a Meme Tank
        </span>
        <span className="aeonik-light-13 text-text-secondary">
          As a game creator, you can design a game with any projects you choose,
          set the game duration, determine ticket distribution, and earn 10% of
          the total game funds.
        </span>
      </div>

      <div className="flex flex-col gap-y-3">
        <span>Does this game have a name?</span>
        <Input
          {...register("name")}
          variant={errors?.name ? "error" : "default"}
        />
        {errors?.name && (
          <span className="text-brand-gradient-red-1 handjet-bold-13">
            {errors?.name?.message}
          </span>
        )}
      </div>
    </motion.div>
  );
};
export default StageOne;
