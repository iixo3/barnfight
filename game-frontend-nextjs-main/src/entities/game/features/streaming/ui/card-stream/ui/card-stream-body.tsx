import { useGetTwitchChannel } from "@/shared/hooks/game/use-get-twitch-channel";
import { useGetTwitchUser } from "@/shared/hooks/game/use-get-twitch-user";
import { useToggle } from "@/shared/hooks/use-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import { cn } from "@/shared/utils";
import React, { useMemo, useState } from "react";
import BeginStream from "../../begin-stream/begin-stream";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";

type CardStreamerBodyProps = {
  id: string;
  muted: boolean;
  setMuted: (value: boolean) => void;
  privateStream: boolean;
};

const CardStreamerBody: React.FC<CardStreamerBodyProps> = ({
  id,
  muted: isMuted,
  setMuted: toggleMuted,
  privateStream,
}) => {
  const { data: streamData } = useGetTwitchChannel(id);
  const { data: streamUser } = useGetTwitchUser(id);

  const name = useMemo(() => {
    return streamUser?.display_name || streamData?.user_name || id;
  }, [streamUser, streamData, id]);

  const viewers = useMemo(() => {
    return streamData?.viewer_count
      ? streamData.viewer_count
          .toLocaleString("en-US", {
            useGrouping: true,
            maximumFractionDigits: 0,
          })
          .replace(/,/g, ".")
      : "0";
  }, [streamData]);

  const avatar_url = useMemo(() => {
    return streamUser?.profile_image_url;
  }, [streamUser]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between w-full gap-x-3">
        <div className="flex items-center gap-x-[6px] flex-1 overflow-hidden">
          {avatar_url && (
            <Avatar className="w-3 h-3 flex-shrink-0">
              <AvatarImage src={avatar_url} />
              <AvatarFallback>
                <PlaceholderAvatar />
              </AvatarFallback>
            </Avatar>
          )}

          <span
            className={cn(
              "handjet-bold-14 inline-block uppercase truncate",
              name
                ? "bg-gradient-to-b from-brand-gradient-red-1 to-brand-gradient-red-2 text-transparent bg-clip-text"
                : "text-white"
            )}
          >
            {name ? name : `+ START STREAMING`}
          </span>
        </div>

        {id && (
          <Button
            size="icon"
            variant="ghosted"
            onClick={() => toggleMuted(!isMuted)}
            className="flex-shrink-0"
          >
            <Icon
              icon={isMuted ? "mute-on" : "mute-off"}
              width={14}
              height={14}
              className={cn(
                isMuted
                  ? "fill-text-offset group-hover:fill-text-secondary"
                  : "fill-text-secondary group-hover:fill-text-offset",
                "duration-100"
              )}
            />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-x-2">
        <span className="handjet-bold-13 text-text-secondary uppercase">
          {viewers && id ? viewers + " VIEWERS" : `FREE SPOT`}
        </span>

        {!id && !privateStream && <BeginStream />}
      </div>
    </div>
  );
};

export default CardStreamerBody;
