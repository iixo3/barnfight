"use client";
import GamesHistory from "@/entities/games/features/games-history/games-history";
import EmptyGames from "@/entities/games/ui/empty-games/empty-games";
import GamesDiscovery from "@/entities/games/ui/games-discovery/games-discovery";
import SkeletonGamesDiscovery from "@/entities/games/ui/skeleton-games-discovery/skeleton-games-discovery";
import { useGetUserParticipations } from "@/shared/hooks/user/use-get-user-participations";
import { useWallet } from "@solana/wallet-adapter-react";
import { Suspense } from "react";

export default function HistoryGamesPage() {
  const { publicKey } = useWallet();
  const { data: participations } = useGetUserParticipations(
    publicKey?.toString()
  );
  const gameIds = participations?.map((participation) => participation.game_id);
  if (!gameIds || gameIds?.length == 0) {
    return (
      <EmptyGames
        hostedCard={false}
        title="Not found"
        description="No games found here"
      />
    );
  }
  return (
    <Suspense fallback={<SkeletonGamesDiscovery />}>
      <GamesDiscovery type="history" gameIds={gameIds} />
    </Suspense>
  );
}
