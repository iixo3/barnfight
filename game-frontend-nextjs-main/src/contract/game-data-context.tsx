"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { GameDataFromContract, Participation } from "@/shared/types/games/games";

interface GameDataContextType {
  gameData: GameDataFromContract | null;
  setGameData: (data: GameDataFromContract | null) => void;
  participations: Participation[];
  setParticipations: React.Dispatch<React.SetStateAction<Participation[]>>;
  participationsTokensWinner: string[];
  setParticipationTokensWinner: React.Dispatch<React.SetStateAction<string[]>>;

clearData: () => void;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

interface GameDataProviderProps {
  children: ReactNode;
}

export const GameDataProvider: React.FC<GameDataProviderProps> = ({ children }) => {
  const [gameData, setGameDataState] = useState<GameDataFromContract | null>(null);
  const [participations, setParticipationsState] = useState<Participation[]>([]);
  const [participationsTokensWinner, setParticipationTokensWinnerState] = useState<string[]>([]);

  const setGameData = (data: GameDataFromContract | null) => {
    setGameDataState(data);
  };

  const setParticipations: React.Dispatch<React.SetStateAction<Participation[]>> = setParticipationsState;

  const setParticipationTokensWinner: React.Dispatch<React.SetStateAction<string[]>> = setParticipationTokensWinnerState;

  const clearData = () => {
    setGameDataState(null);
    setParticipationsState([]);
  };

  const value = useMemo(
    () => ({
      gameData,
      setGameData,
      participations,
      setParticipations,
      clearData,
      participationsTokensWinner,
      setParticipationTokensWinner
    }),
    [gameData, participations, participationsTokensWinner]
  );

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
};

export const useGameDataContext = () => {
  const context = useContext(GameDataContext);
  if (!context) throw new Error("useGameDataContext must be used within a GameDataProvider");
  return context;
};
