import {
  BLIND_REQUIRED,
  CONTRACT_ADDRESS_REQUIRED,
  GAME_LENGTH_REQUIRED,
  MAX_CONTRACT_ADDRESS_REQUIRED,
  MAX_LENGHT,
  MIN_CONTRACT_ADDRESS_REQUIRED,
  MULTIPLY_REQUIRED,
  MUST_BE_NUMBER,
  NAME_REQUIRED,
  PERCENTAGE_REQUIRED,
  PERCENTAGE_TOTAL_REQUIRED,
  PLACE_REQUIRED,
  TICKET_NAME_REQUIRED,
  WINNERS_MAX_REQUIRED,
  WINNERS_PLACES_REQUIRED,
  WINNING_DISTRIBUTION_REQUIRED,
} from "@/shared/assets/constants/create-game-schema-errors";
import * as z from "zod";

export const validateContractAddress = (contractAddress: string) => {
  return z
    .string()
    .refine((value) => value?.length === 0 || value?.length >= 5, {
      message: MAX_LENGHT(5),
    })
    .safeParse(contractAddress);
};

const schemaWinnersDistribution = z
  .object({
    place: z.number().min(1, { message: PLACE_REQUIRED }),
    winning_equally: z.boolean(),
    tickets: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        multiply: z.string(),
        percentage: z.string(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    const totalPercentage = data?.tickets.reduce(
      (sum, ticket) =>
        sum + Number(ticket.percentage) * Number(ticket.multiply),
      0
    );

    if (!data.winning_equally && totalPercentage === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: WINNING_DISTRIBUTION_REQUIRED,
        path: ["tickets"],
      });
    }

    if (!data.winning_equally) {
      if (Number(totalPercentage) !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: PERCENTAGE_TOTAL_REQUIRED,
          path: ["tickets"],
        });
      }

      data.tickets.forEach((ticket, index) => {
        if (!ticket.name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: TICKET_NAME_REQUIRED,
            path: ["tickets", index, "name"],
          });
        }
        if (Number(ticket.multiply) < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: MULTIPLY_REQUIRED,
            path: ["tickets", index, "multiply"],
          });
        }
        if (Number(ticket.percentage) < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: PERCENTAGE_REQUIRED,
            path: ["tickets", index, "percentage"],
          });
        }
      });
    }
  });

const schemaBlinds = z
  .object({
    without_blinds: z.boolean(),
    blind: z.coerce.number({ message: MUST_BE_NUMBER }),
  })
  .superRefine((data, ctx) => {
    if (!data.without_blinds) {
      if (data.blind < 0.1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: BLIND_REQUIRED,
          path: ["blind"],
        });
      }
    }
  });

export const createGameSchema = z.object({
  name: z.string().min(1, NAME_REQUIRED),
  contract_addresses: z
    .array(z.object({ contract: z.string().min(1, CONTRACT_ADDRESS_REQUIRED) }))
    .min(1, MIN_CONTRACT_ADDRESS_REQUIRED)
    .max(6, MAX_CONTRACT_ADDRESS_REQUIRED),
  game_length: z.number().min(1, { message: GAME_LENGTH_REQUIRED }),
  winners_places: z
    .array(z.object({ place: z.number() }))
    .min(1, { message: WINNERS_PLACES_REQUIRED }),
  winners_distribution: z
    .array(schemaWinnersDistribution)
    .max(6, { message: WINNERS_MAX_REQUIRED })
    .min(1, { message: WINNERS_PLACES_REQUIRED }),
  blinds: schemaBlinds,
});
