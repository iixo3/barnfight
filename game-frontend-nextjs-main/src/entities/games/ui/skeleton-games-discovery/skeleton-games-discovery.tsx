import React from "react";
import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";
import SkeletonDiscoveryGameCard from "../discovery-game-card/skeleton-discovery-game-card";

type SkeletonGamesDiscoveryProps = {};

const SkeletonGamesDiscovery: React.FC<SkeletonGamesDiscoveryProps> = () => {
  return (
    <div className="flex flex-col gap-y-14 w-full items-center justify-center">
      <div className="max-w-[370px] w-full">
        <Skeleton className="max-w-[370px] w-full h-[36px] rounded-full" />
      </div>

      <div className="w-full flex flex-col gap-y-3">
        {[1, 2, 3, 4, 5, 6].map((game, index) => (
          <SkeletonDiscoveryGameCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default SkeletonGamesDiscovery;
