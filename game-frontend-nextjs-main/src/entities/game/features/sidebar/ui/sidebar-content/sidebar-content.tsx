"use client";
import { Game, GamesHistory } from "@/shared/types/games/games";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import { Button } from "@/shared/ui/components/button/button";
import { formatAddress } from "@/shared/utils/format-address";
import GamesList from "@/widgets/games-list/games-list";
import Link from "next/link";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SidebarSettings from "../sidebar-settings/sidebar-setttings";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { User } from "@/shared/types/user/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGameQuery } from "@/shared/hooks/game/use-games";
import { create } from "domain";

type SidebarContentProps = {
  user?: User;
};

const SidebarContent: React.FC<SidebarContentProps> = ({ user }) => {
  const [openSettings, setSettings] = useState(false);
  const [gameSettingsData, setGameSettingsData] = useState<Game | null>(null);

  const handleGameSettings = (game: Game) => {
    setSettings(true);
    setGameSettingsData(game);
  };

  return (
    <div className="w-full pt-[36px] px-4 flex flex-col gap-y-12 h-full">
      <div className="flex items-center gap-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.avatar || undefined} />
          <AvatarFallback>
            <PlaceholderAvatar />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-start max-w-full min-w-0 pr-8">
          <span className="text-white handjet-bold-20 truncate max-w-full">
            {user?.username || "NONE"}
          </span>
          <Button
            variant="ghosted"
            size="link"
            className="handjet-bold-16 text-text-offset"
            asChild
          >
            <Link href="/games/popular">View all games</Link>
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!openSettings ? (
          <motion.div
            key="gamesList"
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center w-full overflow-hidden"
          >
            <div className="h-full flex overflow-hidden shadow-scroll-sidebar w-full">
              <div className="no-scrollbar overflow-y-auto pb-[4vh] w-full grow">
                <GamesList handleGameSettings={handleGameSettings} />
              </div>
            </div>

            <div className="w-full flex shrink-0 basis-[130px] grow-0 items-center justify-center">
              <Button className="uppercase max-w-[141px] w-full" asChild>
                <Link href="/games/history">{`View history ->`}</Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <SidebarSettings
            gameSettings={gameSettingsData}
            handleCloseSettings={() => setSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
export default SidebarContent;
