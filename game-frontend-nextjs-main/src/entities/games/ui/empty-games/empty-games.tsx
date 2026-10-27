import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";
import { Button } from "@/shared/ui/components/button/button";
import Link from "next/link";
import React from "react";

type EmptyGamesProps = {
  title?: string;
  description?: string;
  hostedCard?: boolean;
};

const EmptyGames: React.FC<EmptyGamesProps> = ({
  title,
  description,
  hostedCard,
}) => {
  const { isAuthenticated } = useGetAuth();

  const handleCreateGame = () => {
    if (isAuthenticated) {
      const createGameDialog = document.getElementById("create-game-button");

      if (createGameDialog) {
        createGameDialog.click();
        return;
      }
    }
  };

  if (hostedCard) {
    return (
      <div className="bg-component-main flex-wrap w-full transition-all duration-300 cursor-pointer border border-dashed border-text-offset rounded-[20px] py-[17px] pl-9 pr-7 flex items-center justify-between gap-y-4 gap-x-2">
        <span className="handjet-bold-20 text-text-secondary uppercase">
          You don't have any games started
        </span>

        <Button onClick={handleCreateGame}>+ CREATE GAME</Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="handjet-bold-24 !text-[50px]">{title}</span>
      <p className="text-text-secondary handjet-bold-20">{description}</p>
    </div>
  );
};
export default EmptyGames;
