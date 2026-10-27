import { getMemetankProgram } from "@/contract/idl/idl-export";
import { Game } from "@/shared/types/games/games";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

const sumTicketRanges = (ranges: any[]): number => {
  return ranges.reduce(
    (total, range) => total + (range.end - range.start + 1),
    0
  );
};

export const useGetSpent = (
  gameId: Game["id"],
  tokens: Game["tokens"],
  exchangeRates: {
    solana: { rate: number; currency: string };
    tickets: { rate: string; currency: string };
  },
  provider: AnchorProvider,
  type: "history" | "popular" | "hosted" | string
) => {
  const tokensList =
    tokens?.map((token) => new PublicKey(token.token_address)) || [];

  return useQuery({
    queryKey: ["game-spent", gameId],
    queryFn: async () => {
      const ticketsBought = await getSpent(gameId, tokensList, provider);

      const exchangeRateTicket = exchangeRates?.tickets?.rate ?? 0;
      const exchangeRateSolana = exchangeRates?.solana?.rate ?? 0;

      const ticketsInSol = Number(ticketsBought) * Number(exchangeRateTicket);
      const ticketsInUsd = ticketsInSol * Number(exchangeRateSolana);

      return ticketsInUsd.toFixed(2) || 0;
    },
    enabled: !!gameId && !!tokens && tokens.length > 0 && type === "history",
    refetchOnWindowFocus: false,
  });
};

async function getSpent(
  gameId: Game["id"],
  tokensList: PublicKey[],
  provider: any
) {
  const program = getMemetankProgram(provider);

  try {
    let participations = [];

    for (const tokenAddress of tokensList) {
      const [participationPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("participation"),
          new PublicKey(gameId).toBuffer(),
          provider.wallet.publicKey.toBuffer(),
          tokenAddress.toBuffer(),
        ],
        program.programId
      );

      const participation = await program.account.participation.fetchNullable(
        participationPda
      );
      const ticketsBought = participation
        ? sumTicketRanges(participation.ranges)
        : 0;
      const ranges = participation ? participation.ranges : [];

      participations.push({ tokenAddress, ticketsBought, ranges });
    }

    if (!participations || participations.length === 0) return 0;

    const ticketsBought = participations
      .map((participation) => participation.ticketsBought)
      .reduce((acc, curr) => acc + curr, 0);

    return ticketsBought;
  } catch (error) {
    return 0;
  }
}

export default getSpent;
