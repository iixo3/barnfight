import React, { useCallback, useEffect, useMemo } from "react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  useFormContext,
  UseFormRegister,
} from "react-hook-form";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/shared/ui/components/button/button";
import { Input } from "@/shared/ui/components/input/input";
import Icon from "@/shared/ui/components/icon/icon";
import { cn } from "@/shared/utils";

type TicketsDistributionProps = {
  nestedIndex: number;
  place: number;
  split_equally: boolean;
};

const TicketsDistribution: React.FC<TicketsDistributionProps> = ({
  nestedIndex,
  split_equally,
}) => {
  const {
    control,
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext<CreateGameSchemaType>();
  const { fields, remove, append } = useFieldArray({
    control,
    name: `winners_distribution.${nestedIndex}.tickets`,
  });

  const handleAddTicketField = useCallback(() => {
    append({
      id: uuidv4(),
      name: "Ticket",
      multiply: "1",
      percentage: "0",
    });
  }, [append]);

  useEffect(() => {
    console.log("err", errors);
  }, [errors]);

  const errors_tickets_distribution = useCallback(
    (index: number) => {
      if (split_equally) return null;

      return (
        errors.winners_distribution?.[nestedIndex]?.tickets?.[index]?.name
          ?.message ||
        errors.winners_distribution?.[nestedIndex]?.tickets?.[index]?.multiply
          ?.message ||
        errors.winners_distribution?.[nestedIndex]?.tickets?.[index]?.percentage
          ?.message
      );
    },
    [errors, nestedIndex, split_equally]
  );

  React.useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      await trigger([`winners_distribution.${nestedIndex}.tickets`]);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <>
      {fields.map(
        (
          fieldTicket: CreateGameSchemaType["winners_distribution"][number]["tickets"][number],
          indexTicket: number
        ) => (
          <div
            className={cn(
              "flex flex-col gap-y-2",
              split_equally && "pointer-events-none"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-1.5">
                <div className="flex items-center gap-x-[11px]">
                  <span
                    className={cn(
                      "handjet-bold-16 bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2",
                      split_equally && "opacity-50"
                    )}
                  >
                    #{indexTicket + 1}
                  </span>
                  <Input
                    {...register(
                      `winners_distribution.${nestedIndex}.tickets.${indexTicket}.name`
                    )}
                    disabled={split_equally}
                    size="secondary"
                    variant="default_unhover"
                    className="text-brand-gradient-green-2 w-[100px]"
                    rightIcon={
                      fields?.length > 1 ? (
                        <Button
                          disabled={split_equally}
                          onClick={() =>
                            split_equally ? null : remove(indexTicket)
                          }
                          variant="highlight"
                          className="w-[17px] h-[17px] rounded-md"
                          size="outer_icon"
                          type="button"
                        >
                          <Icon icon="cross-icon-bold" width={7} height={7} />
                        </Button>
                      ) : null
                    }
                  />
                </div>

                <Input
                  {...register(
                    `winners_distribution.${nestedIndex}.tickets.${indexTicket}.multiply`
                  )}
                  disabled={split_equally}
                  size="secondary"
                  variant="default_unhover"
                  className="w-[60px]"
                  leftText="X"
                />
              </div>

              <Input
                {...register(
                  `winners_distribution.${nestedIndex}.tickets.${indexTicket}.percentage`
                )}
                disabled={split_equally}
                size="secondary"
                variant="default_unhover"
                className="w-[60px]"
                rightText="%"
              />
            </div>

            {errors_tickets_distribution(indexTicket) && (
              <span className="text-brand-gradient-red-1 handjet-bold-14">
                {errors_tickets_distribution(indexTicket)}
              </span>
            )}
          </div>
        )
      )}

      {!split_equally && fields?.length < 6 && (
        <Button
          type="button"
          onClick={() => (split_equally ? null : handleAddTicketField())}
          variant="ghosted"
          size="secondary"
          className="text-text-secondary text-left w-fit py-1 px-0"
        >
          + Create ticket
        </Button>
      )}
    </>
  );
};
export default TicketsDistribution;
