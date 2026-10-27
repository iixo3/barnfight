import GamesDiscovery from "@/entities/games/ui/games-discovery/games-discovery";
import SkeletonGamesDiscovery from "@/entities/games/ui/skeleton-games-discovery/skeleton-games-discovery";
import { Suspense } from "react";

export default function PopularGamesPage() {
  return (
    <Suspense fallback={<SkeletonGamesDiscovery />}>
      <GamesDiscovery type="popular" />
    </Suspense>
  );
}
