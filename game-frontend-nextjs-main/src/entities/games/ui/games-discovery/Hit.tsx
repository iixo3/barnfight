import { Game } from "@/shared/types/games/games";
import { Hit as THit } from "algoliasearch";
import DiscoveryGameCard from "../discovery-game-card/discovery-game-card";
import { AnchorProvider } from "@coral-xyz/anchor";
import { ExchangeRates } from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";

interface HitProps {
  hit: THit;
  type: string;
  exchangeRates: ExchangeRates;
}

export default function Hit({ hit, type, exchangeRates }: HitProps) {
  return (
    <DiscoveryGameCard
      type={type ?? "popular"}
      game={hit as unknown as Game}
      listIndex={hit.__position}
      exchangeRates={exchangeRates}
    />
  );
}
