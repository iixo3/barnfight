import { useGetTwitchChannel } from "@/shared/hooks/game/use-get-twitch-channel";
import { useGetTwitchUser } from "@/shared/hooks/game/use-get-twitch-user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import { cn } from "@/shared/utils";
import { useMemo } from "react";
import BeginStream from "../../begin-stream/begin-stream";
import { useGetYoutubeInfo } from "@/shared/hooks/game/use-get-youtube-info";

interface CardStreamBodyUIProps {
  id: string;
  muted: boolean;
  toggleMuteStreamer: (streamer: string) => void;
  privateStream: boolean;
  platform: "twitch" | "youtube";
}

const CardStreamBodyUI: React.FC<CardStreamBodyUIProps> = ({
  id,
  muted: isMuted,
  toggleMuteStreamer,
  privateStream,
  platform,
}) => {
  const { data: streamData } = useGetTwitchChannel(
    platform === "twitch" ? id : ""
  );
  const { data: streamUser } = useGetTwitchUser(
    platform === "twitch" ? id : ""
  );
  const { data: streamInfo } = useGetYoutubeInfo(
    platform === "youtube" ? id : ""
  );

  const name = useMemo(() => {
    if (platform === "twitch") {
      return streamUser?.display_name || streamData?.user_name || id;
    } else {
      return streamInfo?.channel_name || id;
    }
  }, [streamUser, streamData, streamInfo, id]);

  const viewers = useMemo(() => {
    if (platform === "twitch") {
      return streamData?.viewer_count
        ? streamData.viewer_count
            .toLocaleString("en-US", {
              useGrouping: true,
              maximumFractionDigits: 0,
            })
            .replace(/,/g, ".")
        : "0";
    } else {
      return streamInfo?.views
        ? streamInfo.views
            .toLocaleString("en-US", {
              useGrouping: true,
              maximumFractionDigits: 0,
            })
            .replace(/,/g, ".")
        : "0";
    }
  }, [streamData, streamInfo]);

  const avatar_url = useMemo(() => {
    if (platform === "twitch") {
      return streamUser?.profile_image_url;
    } else {
      return streamInfo?.channel_profile_url;
    }
  }, [streamUser, streamInfo]);

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
            onClick={() => toggleMuteStreamer(id)}
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

export default CardStreamBodyUI;
