import React, { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGameSchema } from "../lib/create-game-schema";
import { useGetUserBalance } from "@/shared/hooks/user/use-get-user-balance";

export type CreateGameSchemaType = z.infer<typeof createGameSchema>;

type UseCreateGameFormProps = {
  onSubmit: (data: CreateGameSchemaType) => void;
  currentStage: number;
  setCurrentStage: React.Dispatch<React.SetStateAction<number>>;
  setPreviousStage: React.Dispatch<React.SetStateAction<number>>;
};

export const useCreateGameForm = ({
  onSubmit,
  currentStage,
  setCurrentStage,
  setPreviousStage,
}: UseCreateGameFormProps) => {
  const steps = [
    {
      fields: ["name"],
    },
    {
      fields: ["contract_addresses"],
    },
    {
      fields: ["game_length"],
    },
    {},
    {
      fields: ["winners_places"],
    },
    {
      fields: ["winners_distribution"],
    },
    {
      fields: ["blinds.without_blinds", "blinds.blind"],
    },
    {},
  ];

  const balances = useGetUserBalance({
    only_crypto_balance: true,
  });

  const formMethods = useForm<CreateGameSchemaType>({
    mode: "onChange",
    defaultValues: {
      name: "",
      contract_addresses: [],
      game_length: 0,
      winners_places: [],
      winners_distribution: [],
      blinds: { without_blinds: true, blind: 0 },
    },
    resolver: zodResolver(
      createGameSchema.superRefine((data, ctx) => {
        if (!data.blinds.without_blinds) {
          if (data.blinds.blind > Number(balances.solana)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Blind cannot exceed the available tokens",
              path: ["blinds.blind"],
            });
          }
        }
      })
    ),
  });

  type FieldName = keyof CreateGameSchemaType;

  const next = async () => {
    const fields = steps[currentStage].fields;

    if (currentStage === 7) {
      await formMethods.handleSubmit(onSubmit)();

      return;
    }

    if (!fields && currentStage === 3) {
      setPreviousStage(currentStage);
      setCurrentStage((step) => step + 1);
      return;
    }

    const output = await formMethods.trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    if (!output) return;

    setPreviousStage(currentStage);
    setCurrentStage((step) => step + 1);
  };

  const prev = () => {
    if (currentStage > 0) {
      setPreviousStage(currentStage);
      setCurrentStage((step) => step - 1);
    }
  };

  React.useEffect(() => {
    const subscription = formMethods.watch((value, { name, type }) => {});
    return () => subscription.unsubscribe();
  }, [formMethods.watch]);

  return {
    formMethods,
    currentStage,
    next,
    prev,
    balanceSolana: balances.solana,
  };
};
