import React from "react";
import SkeletonDiscoveryGameCard from "../discovery-game-card/skeleton-discovery-game-card";

export default function SkeletonGamesDiscoveryCards() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((game, index) => (
        <SkeletonDiscoveryGameCard key={index} />
      ))}
    </>
  );
}
