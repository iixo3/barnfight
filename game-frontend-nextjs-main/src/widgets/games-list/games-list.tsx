import { Game, GamesHistory } from "@/shared/types/games/games";
import React, { useMemo } from "react";
import { useSectionGamesList } from "./hooks/use-section-games-list/use-section-games-list";
import GameHistorySectionCard from "./ui/game-history-section-card/game-history-section-card";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGameQuery } from "@/shared/hooks/game/use-games";
import GameHistorySectionCardEmpty from "./ui/game-history-section-card-empty/game-history-section-card-empty";
import GamesListEmpty from "./ui/games-list-empty/games-list-empty";

type GamesListProps = {
  handleGameSettings: (game: Game) => void;
};

const GamesList: React.FC<GamesListProps> = ({ handleGameSettings }) => {
  const { publicKey } = useWallet();

  const { data: createdGames } = useGameQuery({
    type: "hosted",
    creator: publicKey?.toString() || "a",
  });

  const games = useMemo(() => {
    return [
      ...(createdGames || []).map((game) => ({ ...game, hosted_by_me: true })),
    ];
  }, [createdGames]);

  const sectionGames = useSectionGamesList({
    games,
  });

  return (
    <div className="flex flex-col gap-y-8">
      {sectionGames.length > 0 ? (
        sectionGames.map((section, index) => (
          <div key={index} className="flex flex-col gap-y-4">
            <span className="handjet-bold-18 text-text-secondary uppercase">
              {section.title}
            </span>

            {section.data.map((sectionData, index) => (
              <GameHistorySectionCard
                game={sectionData}
                key={index}
                handleGameSettings={handleGameSettings}
              />
            ))}
          </div>
        ))
      ) : (
        <GamesListEmpty />
      )}
    </div>
  );
};
export default GamesList;
