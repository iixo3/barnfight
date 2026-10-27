import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/components/accordion/accordion";
import { Switch } from "@/shared/ui/components/switch/switch";
import { motion } from "framer-motion";
import React, { useCallback, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";
import TicketsDistribution from "../tickets-distribution/tickets-distribution";
import { formatPlacesString } from "@/shared/utils/format-places-string";

type StageSixProps = {
  delta: number;
};

const StageSix: React.FC<StageSixProps> = ({ delta }) => {
  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CreateGameSchemaType>();
  const { fields } = useFieldArray({
    control,
    name: "winners_distribution",
  });

  // Switch
  const getValueSwitch = useCallback(
    (index: number) => {
      return getValues(`winners_distribution.${index}.winning_equally`);
    },
    [getValues]
  );
  const handleSwitch = useCallback(
    (index: number) => {
      const valueSwitch = getValueSwitch(index);

      setValue(`winners_distribution.${index}.winning_equally`, !valueSwitch);
    },
    [fields]
  );

  const totalPercentage = useCallback(
    (index: number) => {
      const totalTickets = watch(`winners_distribution.${index}.tickets`);

      return totalTickets
        .reduce(
          (sum, ticket) =>
            sum + Number(ticket.percentage) * Number(ticket.multiply),
          0
        )
        .toFixed(2);
    },
    [watch]
  );

  const memoizedFields = useMemo(() => fields, [fields]);

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-8"
    >
      <div className="flex flex-col gap-y-3">
        <span className="text-white handjet-bold-20">Winning distribution</span>
        <span className="text-text-secondary aeonik-light-13">
          You can decide how winning tickets are distributed to users whose
          projects finish in the ranks you've set.
        </span>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full flex flex-col gap-y-8"
      >
        {memoizedFields.map((field, index) => (
          <AccordionItem
            variant="secondary"
            key={field.id}
            value={`distribution-index-${field.id}`}
          >
            <AccordionTrigger variant="secondary">
              <div className="flex items-center justify-between gap-x-1 flex-1 pr-2">
                <span>{formatPlacesString(field.place)} Place</span>

                <span>
                  {getValueSwitch(index)
                    ? "Splitted equally"
                    : `PERCENTAGE: ${totalPercentage(index)}%`}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 flex flex-col gap-y-2">
              <div className="flex items-center justify-between gap-x-2">
                <span className="handjet-bold-16 text-text-secondary">
                  Winnings equally split among all tickets
                </span>
                <Switch
                  checked={getValueSwitch(index)}
                  onCheckedChange={() => handleSwitch(index)}
                />
              </div>

              <div className="flex items-center h-8 gap-x-2">
                <div className="h-full flex flex-col gap-y-[3px] w-[1px]">
                  <div className="w-full h-[5.3px] bg-transparent"></div>
                  <div className="w-full h-[3px] bg-text-offset"></div>
                  <div className="w-full h-[5.3px] bg-text-offset"></div>
                  <div className="w-full h-[3.3px] bg-text-offset"></div>
                  <div className="w-full h-[3.3px] bg-text-offset"></div>
                  <div className="w-full h-[5.3px] bg-transparent"></div>
                </div>

                <span className="handjet-bold-14 text-text-offset h-full flex items-center">
                  or create individual tickets
                </span>
              </div>

              <TicketsDistribution
                place={field.place}
                nestedIndex={index}
                split_equally={getValueSwitch(index)}
              />
            </AccordionContent>

            {errors.winners_distribution?.[index]?.tickets?.message && (
              <span className="text-brand-gradient-red-1 handjet-bold-14 pt-2">
                {errors.winners_distribution?.[index]?.tickets?.message}
              </span>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
};

export default React.memo(StageSix);
