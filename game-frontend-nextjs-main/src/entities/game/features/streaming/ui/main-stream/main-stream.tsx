import { Game } from "@/shared/types/games/games";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import Loader from "@/shared/ui/components/loaders/loader";
import { cn } from "@/shared/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { TwitchEmbed, TwitchEmbedInstance } from "react-twitch-embed";

type MainStreamProps = {
  mainStreamActive: string;
  getStreamers: string[];
  privateStream: Game["private_stream"];
};

const MainStream: React.FC<MainStreamProps> = ({
  mainStreamActive,
  getStreamers,
  privateStream,
}) => {
  const [embed, setEmbed] = React.useState<TwitchEmbedInstance | null>(null);
  const [muted, setMuted] = React.useState(false);

  const isAnyoneStreaming = useMemo(() => {
    return getStreamers.some((streamer) => streamer !== "");
  }, [getStreamers]);

  useEffect(() => {
    if (embed) {
      //@ts-ignore
      embed.setMuted(muted);
    }
  }, [muted, embed]);

  return Boolean(mainStreamActive) ? (
    <div className="w-full aspect-video flex-1 relative rounded-2xl overflow-hidden">
      <div className="z-10 absolute top-0 left-0 w-full h-full group flex items-end justify-end p-4">
        <Button
          onClick={() => setMuted((prev) => !prev)}
          className="group-hover:flex hidden"
          variant="solid"
          size="outer_icon"
        >
          <Icon
            icon={muted ? "mute-on" : "mute-off"}
            width={16}
            height={16}
            className="fill-text-secondary"
          />
        </Button>
      </div>

      {!embed && (
        <div className="absolute top-0 left-0 w-full h-full bg-component-main flex items-center justify-center">
          <Loader size={40} />
        </div>
      )}
      {/* <div id={`twitch-embed-container-mainActive`}></div> */}
      <TwitchEmbed
        id={mainStreamActive}
        className="absolute top-0 left-0 w-full h-full"
        width={"100%"}
        height={"100%"}
        withChat={false}
        hideControls={true}
        channel={mainStreamActive}
        autoplay
        onVideoReady={setEmbed}
      />
    </div>
  ) : (
    <div className="w-full aspect-video relative overflow-hidden flex-1 rounded-2xl bg-component-main border border-stroke-main flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-y-5">
        <Icon icon="camera-lg" width={66} height={39} className="fill-icons" />

        <div className="flex flex-col gap-y-[6px] items-center justify-center text-center">
          <span className="handjet-bold-16 text-white uppercase">
            {isAnyoneStreaming
              ? "Select streamer"
              : "Looks like there's no one streaming"}
          </span>
          {isAnyoneStreaming ? (
            <span className="aeonik-light-11 text-text-secondary">
              Choose a streamer that interests you
            </span>
          ) : (
            !privateStream && (
              <span className="aeonik-light-11 text-text-secondary">
                Be the first one to kickstart the conversation
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MainStream);
