import { useEffect, useMemo, useState } from "react";
import CardStreamHeaderUI from "./ui/card-stream-header-ui";
import CardStreamBodyUI from "./ui/card-stream-body-ui";
import { YouTubePlayer } from "react-youtube";
import { TwitchPlayerInstance } from "react-twitch-embed";

interface CardStreamUIProps {
  streamer: string;
  emptySlot: boolean;
  mainStreamActive: string;
  handleSelectStream: (stream?: string, nextStream?: string) => void;
  privateStream: boolean;
  mainStreamSize: { width: number; height: number };
  toggleMuteStreamer: (streamer: string) => void;
  isMuted: boolean;
  platform: "twitch" | "youtube";
}

const CardStreamUI: React.FC<CardStreamUIProps> = ({
  streamer,
  mainStreamActive,
  handleSelectStream,
  privateStream,
  mainStreamSize,
  toggleMuteStreamer,
  isMuted,
  platform,
}) => {
  const [embed, setEmbed] = useState<
    YouTubePlayer | TwitchPlayerInstance | null
  >(null);

  const isActiveStream = useMemo(() => {
    return mainStreamActive === streamer;
  }, [mainStreamActive, streamer]);

  useEffect(() => {
    if (embed) {
      //@ts-ignore
      // embed.setMuted(isMuted);

      if (platform === "twitch") {
        embed.setMuted(isMuted);
      }

      if (platform === "youtube") {
        if (embed.getPlayerState() === 1 || !!embed.g) {
          embed.playVideo();
          embed.clearVideo();

          if (isMuted) {
            embed.mute();
          } else {
            embed.unMute();
          }
        }
      }
    }
  }, [isMuted, embed, platform]);

  return (
    <div className="flex flex-col gap-y-2.5 w-full h-full">
      <CardStreamHeaderUI
        isSelected={isActiveStream}
        handleSelectStream={handleSelectStream}
        mainStreamSize={mainStreamSize}
        streamer={streamer}
        mainStreamActive={mainStreamActive}
        setEmbed={setEmbed}
        embed={embed}
        isMuted={isMuted}
        platform={platform}
      />
      <CardStreamBodyUI
        id={streamer}
        muted={isMuted}
        toggleMuteStreamer={toggleMuteStreamer}
        privateStream={privateStream}
        platform={platform}
      />
    </div>
  );
};

export default CardStreamUI;
