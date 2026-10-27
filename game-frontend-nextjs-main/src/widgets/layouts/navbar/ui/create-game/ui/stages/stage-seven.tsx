import React, { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/shared/ui/components/switch/switch";
import { Input } from "@/shared/ui/components/input/input";
import { useFormContext } from "react-hook-form";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";
import { cn } from "@/shared/utils";

type StageSevenProps = {
  delta: number;
  balanceSolana: number;
};

const StageSeven: React.FC<StageSevenProps> = ({ delta, balanceSolana }) => {
  const {
    watch,
    setValue,
    register,
    trigger,
    formState: { errors },
  } = useFormContext<CreateGameSchemaType>();

  const withoutBlinds = watch("blinds.without_blinds");
  const blind = watch("blinds.blind");

  const handleSwitch = useCallback(() => {
    setValue("blinds.without_blinds", !withoutBlinds);
  }, [withoutBlinds, setValue]);

  useEffect(() => {
    if (blind.toString()?.length > 0) {
      setValue("blinds.without_blinds", false);
    } else {
      setValue("blinds.without_blinds", true);
    }
  }, [blind]);

  React.useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      await trigger([`blinds`]);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-10"
    >
      <div className="flex flex-col gap-y-3">
        <span className={cn("handjet-bold-20 text-white")}>
          Putting the “Big Blind”
        </span>
        <span className="text-text-secondary aeonik-light-13">
          You can choose to skip this step, but if the game has an initial
          stake, users are more likely to join in and try to "steal" the blinds,
          making the game more dynamic.
        </span>
      </div>

      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-4">
          <span
            className={cn(
              "handjet-bold-16",
              !withoutBlinds ? "text-white" : "text-text-secondary"
            )}
          >
            Of course I'm going to put up a “blind”
          </span>
          <div className="flex flex-col gap-y-2">
            <Input
              placeholder="0"
              rightText="SOL"
              {...register("blinds.blind")}
              variant={errors?.blinds?.blind ? "error" : "default"}
            />
            {errors?.blinds?.blind && (
              <span className="text-brand-gradient-red-1 handjet-bold-13">
                {errors?.blinds?.blind?.message}
              </span>
            )}
            <span className="text-text-offset aeonik-light-13">
              Available: {balanceSolana} SOL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-x-2 justify-between">
          <span
            className={cn(
              "handjet-bold-16",
              withoutBlinds ? "text-white" : "text-text-secondary"
            )}
          >
            I don't want to put up any blinds
          </span>
          <Switch checked={withoutBlinds} onCheckedChange={handleSwitch} />
        </div>
      </div>
    </motion.div>
  );
};

export default StageSeven;
