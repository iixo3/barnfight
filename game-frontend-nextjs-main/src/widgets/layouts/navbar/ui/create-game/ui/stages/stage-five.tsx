import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/components/button/button";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";
import { v4 as uuidv4 } from "uuid";
import { formatPlacesString } from "@/shared/utils/format-places-string";

type StageFiveProps = {
  delta: number;
};

const StageFive: React.FC<StageFiveProps> = ({ delta }) => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<CreateGameSchemaType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "winners_places",
  });
  const {
    fields: distributionFields,
    append: appendDistribution,
    remove: removeDistribution,
  } = useFieldArray({
    control,
    name: "winners_distribution",
  });

  const contract_addresses = useWatch({
    control,
    name: "contract_addresses",
  });

  const handleSelectPlace = useCallback(
    (place: number) => {
      const indexPlace = fields.findIndex((field) => field.place === place);

      if (indexPlace !== -1) {
        remove(indexPlace);
        removeDistribution(indexPlace);
      } else {
        append({ place });
        appendDistribution({
          winning_equally: false,
          place,
          tickets: [
            {
              id: uuidv4(),
              name: "Ticket",
              multiply: "1",
              percentage: "0",
            },
          ],
        });
      }
    },
    [append, fields, remove]
  );

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-10"
    >
      <div className="flex flex-col gap-y-3">
        <span className="text-white handjet-bold-20">Which places win?</span>
        <span className="text-text-secondary aeonik-light-13">
          You can choose one or more ranks
        </span>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="flex flex-col gap-y-1.5">
          {Array.from({ length: contract_addresses.length }).map((_, index) => (
            <Button
              onClick={() => handleSelectPlace(index + 1)}
              variant={
                fields.findIndex((field) => field.place === index + 1) !== -1
                  ? "default_active"
                  : "default"
              }
              size="secondary"
              type="button"
            >
              {formatPlacesString(index + 1)} Place
            </Button>
          ))}
        </div>

        {errors?.winners_places && (
          <span className="text-brand-gradient-red-1 handjet-bold-13">
            {errors?.winners_places?.message}
          </span>
        )}
      </div>
    </motion.div>
  );
};
export default StageFive;
