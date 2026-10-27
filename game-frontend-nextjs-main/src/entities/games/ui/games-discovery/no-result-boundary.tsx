import React from "react";
import { useHits, useInstantSearch } from "react-instantsearch";
import EmptyGames from "../empty-games/empty-games";

type NoResultsBoundaryProps = {
  children: React.ReactNode;
  type: "hosted" | "history" | "popular";
};

const NoResultsBoundary: React.FC<NoResultsBoundaryProps> = ({
  children,
  type,
}) => {
  const { results } = useInstantSearch();
  const { results: hitsResult } = useHits();

  const isNoResults =
    !results.__isArtificial &&
    (results.nbHits === 0 || hitsResult?.nbHits === 0);

  if (isNoResults) {
    return (
      <>
        <EmptyGames
          hostedCard={type === "hosted"}
          title="Not found"
          description="No games found here"
        />
        <div hidden>{children}</div>
      </>
    );
  }

  return children;
};
export default NoResultsBoundary;
