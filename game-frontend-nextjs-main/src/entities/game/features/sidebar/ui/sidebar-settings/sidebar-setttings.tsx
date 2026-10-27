import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/components/button/button";
import { Game, GamesHistory } from "@/shared/types/games/games";
import { Input } from "@/shared/ui/components/input/input";
import Icon from "@/shared/ui/components/icon/icon";
import { Save as SaveIcon } from "lucide-react";
import { useSidebarSettings } from "./hook/use-sidebar-settings";
import { cn } from "@/shared/utils";
import { useGetGame } from "@/shared/hooks/game/use-games";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select/select";
import { useGetYoutubeInfo } from "@/shared/hooks/game/use-get-youtube-info";

type SidebarSettingsProps = {
  gameSettings: Game | null;
  handleCloseSettings: () => void;
};

const SidebarSettings: React.FC<SidebarSettingsProps> = ({
  gameSettings,
  handleCloseSettings,
}) => {
  const { data: gameData } = useGetGame(gameSettings?.id as string);

  const {
    searchField,
    platformField,
    handleToggleAnyoneCanStream,
    anyoneCanStream,
    streamingAccounts,
    handleSaveStreamingAccounts,
    handleRemoveStreamingAccount,
  } = useSidebarSettings((gameData as Game) || null);

  const Divider = () => {
    return (
      <div className="h-full flex flex-col gap-y-[3px] w-[1px]">
        <div className="w-full h-[5.3px] bg-transparent"></div>
        <div className="w-full h-[3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[3px] bg-text-offset"></div>
        <div className="w-full h-[5.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
        <div className="w-full h-[3.3px] bg-text-offset"></div>
      </div>
    );
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: "100%" }}
      exit={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col wf gap-y-1.5"
    >
      <div className="flex items-center gap-x-2">
        <span className="handjet-bold-18 uppercase text-text-secondary">
          ROOM SETTINGS
        </span>
        <Button
          onClick={handleCloseSettings}
          variant="ghosted"
          size="link"
          className="uppercase handjet-bold-18"
        >
          (Close x)
        </Button>
      </div>

      <div className="flex flex-col gap-y-2.5">
        <Divider />

        <div className="flex items-center gap-x-2.5">
          <span className="handjet-bold-18 text-text-secondary uppercase">
            ANYONE CAN STREAM
          </span>
          <div className="flex items-center gap-x-1 handjet-bold-18 uppercase text-text-secondary">
            <Button
              onClick={() => handleToggleAnyoneCanStream("on")}
              variant={anyoneCanStream ? "link_action" : "ghosted"}
              size="link"
              className="uppercase handjet-bold-18"
            >
              ON
            </Button>
            /
            <Button
              onClick={() => handleToggleAnyoneCanStream("off")}
              variant={anyoneCanStream ? "ghosted" : "link_action"}
              size="link"
              className="uppercase handjet-bold-18"
            >
              OFF
            </Button>
          </div>
        </div>

        <Divider />

        <div className={cn("flex flex-col gap-y-5 w-full")}>
          <div className="flex flex-col gap-y-2 w-full">
            <div className="flex flex-col gap-y-[2px]">
              <span className="handjet-bold-18 text-text-secondary">
                + STREAMING ACCOUNTS
              </span>
              <span className="aeonik-light-11 text-text-secondary">
                Maximum 4 streaming accounts
              </span>
            </div>

            <div className="flex flex-col gap-y-1">
              <div className="flex items-center gap-x-2 w-full">
                <div className="flex items-center gap-x-2 flex-1">
                  <Input
                    className="flex-1"
                    value={searchField.value}
                    onChange={searchField.onChange}
                    leftIcon={
                      <Icon
                        icon="search"
                        width={12}
                        height={12}
                        className="fill-text-secondary"
                      />
                    }
                    size="rounded"
                  />

                  <Select
                    value={platformField.value}
                    onValueChange={platformField.onChange}
                  >
                    <SelectTrigger className="max-w-[80px]">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitch">Twitch</SelectItem>
                      <SelectItem value="youtube">Youtube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  disabled={streamingAccounts.length >= 4}
                  onClick={handleSaveStreamingAccounts}
                  variant="default"
                  size="outer_icon"
                  className="rounded-full"
                >
                  <SaveIcon
                    width={16}
                    height={16}
                    strokeWidth={1}
                    color="white"
                  />
                </Button>
              </div>

              {searchField.error && (
                <span className="aeonik-light-11 text-brand-gradient-red-1">
                  {searchField.error}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 w-full">
            {Boolean(streamingAccounts) &&
              streamingAccounts.map((streamerAccount, index) => (
                <SidebarStreamingItems
                  key={index}
                  streamerAccount={
                    streamerAccount as {
                      streamer: string;
                      platform: "youtube" | "twitch";
                    }
                  }
                  handleRemoveStreamingAccount={handleRemoveStreamingAccount}
                />
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SidebarStreamingItems = ({
  streamerAccount,
  handleRemoveStreamingAccount,
}: {
  streamerAccount: { streamer: string; platform: "youtube" | "twitch" };
  handleRemoveStreamingAccount: (streamer: {
    streamer: string;
    platform: "youtube" | "twitch";
  }) => void;
}) => {
  const { data: youtubeInfo } = useGetYoutubeInfo(
    streamerAccount.platform === "youtube" ? streamerAccount.streamer : ""
  );

  const name = useMemo(() => {
    if (streamerAccount.platform === "youtube") {
      return youtubeInfo?.channel_name || streamerAccount.streamer;
    } else {
      return streamerAccount.streamer;
    }
  }, [streamerAccount.platform, youtubeInfo]);

  return (
    <div className="rounded-md py-1.5 px-2 bg-component-highlight flex items-center gap-x-2 max-w-full">
      <span className="handjet-bold-18 truncate w-full uppercase bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
        {name} ({streamerAccount.platform})
      </span>
      <Button
        onClick={() => handleRemoveStreamingAccount(streamerAccount)}
        variant="highlight"
        size="xxs"
        className="h-[17px] px-1"
      >
        <Icon
          icon="cross-icon-bold"
          width={7}
          height={7}
          className="fill-brand-gradient-green-1"
        />
      </Button>
    </div>
  );
};

export default SidebarSettings;
