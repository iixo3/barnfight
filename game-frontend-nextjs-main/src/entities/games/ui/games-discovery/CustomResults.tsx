import React from "react";
import { useInstantSearch } from "react-instantsearch";
import EmptyGames from "../empty-games/empty-games";
import { ReactNode } from "react";
import SkeletonGamesDiscoveryCards from "../skeleton-games-discovery-cards/skeleton-games-discovery-cards";

export default ({ children }: { children: ReactNode }) => {
  const { results, status } = useInstantSearch();
  const hasResults = results?.nbHits !== 0;

  console.log("HAS RESULTS?", hasResults)
  if (status === "loading" && !hasResults) {
    return (
      <div className="w-full flex flex-col gap-y-3">
        <SkeletonGamesDiscoveryCards />
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="w-full flex flex-col gap-y-3">
        <EmptyGames title="Not found" description="No games found here" />
      </div>
    );
  }

  return children;
};
