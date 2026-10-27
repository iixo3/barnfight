"use client";
import { useGetGame } from "@/shared/hooks/game/use-games";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHandleStream } from "./hooks/use-handle-stream";
import { useResizeObserver } from "./hooks/use-resize-observer";
import CardStreamUI from "./ui/card-stream/card-stream-ui";
import MainStreamUI from "./ui/main-stream/main-stream-ui";
import SkeletonStreaming from "./ui/skeleton-streaming";

type StreamingProps = {
  game: string;
};
export default function Streaming(props: StreamingProps) {
  const { mainStreamActive, handleSelectStream } = useHandleStream();

  const { data: game, isLoading } = useGetGame(props.game, true);

  const getStreamersView: {
    streamer: string;
    platform: "twitch" | "youtube";
  }[] = useMemo(() => {
    const streamers = game?.streamers ?? [];

    const result = [
      ...streamers,
      ...Array(Math.max(0, 4 - streamers.length)).fill({
        streamer: "",
        platform: "twitch",
      }),
    ];

    return result.slice(0, 4);
  }, [game]);

  // const getStreamersView = useMemo(() => {
  //   const streamers = ["HuFYqnbVbzY", "kkBWC3khzhM"];

  //   const result = [
  //     ...streamers,
  //     ...Array(Math.max(0, 4 - streamers.length)).fill(""),
  //   ];

  //   return result.slice(0, 4);
  // }, []);

  const privateStream = useMemo(() => {
    return game?.private_stream ?? false;
  }, [game?.private_stream]);

  const containerMainStreamRef = useRef<HTMLDivElement>(null);
  const [mainStreamSize, setMainStreamSize] = useState({ width: 0, height: 0 });

  const muteStreamersInitial = getStreamersView.reduce((acc, streamer) => {
    acc[streamer.streamer] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const [mutedStreamers, setMutedStreamers] =
    useState<Record<string, boolean>>(muteStreamersInitial);

  const toggleMuteMainStream = () => {
    setMutedStreamers((prev) => ({
      ...prev,
      [mainStreamActive]: !prev[mainStreamActive],
    }));
  };

  const toggleMuteStreamer = (streamer: string) => {
    setMutedStreamers((prev) => ({
      ...prev,
      [streamer]: !prev[streamer],
    }));
  };

  useResizeObserver(containerMainStreamRef, (entry) => {
    setMainStreamSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });

  return (
    <>
      {!containerMainStreamRef.current && (
        <div className="w-full h-full z-20">
          <SkeletonStreaming />
        </div>
      )}

      <AnimatePresence mode="sync">
        <div className={"flex flex-col gap-y-4 h-full flex-1 relative"}>
          <div className="grid grid-cols-2 min-[540px]:grid-cols-4 md-game:grid-cols-2 lg-game:grid-cols-4 gap-[13px]">
            {getStreamersView.map((streamer, index) => (
              <CardStreamUI
                key={streamer.streamer || index}
                streamer={streamer.streamer}
                platform={streamer.platform}
                mainStreamActive={mainStreamActive}
                emptySlot={!Boolean(streamer.streamer)}
                handleSelectStream={handleSelectStream}
                privateStream={privateStream}
                mainStreamSize={mainStreamSize}
                toggleMuteStreamer={toggleMuteStreamer}
                isMuted={mutedStreamers[streamer.streamer]}
              />
            ))}
          </div>

          <MainStreamUI
            containerMainStreamRef={containerMainStreamRef}
            mainStreamActive={mainStreamActive}
            getStreamers={getStreamersView}
            privateStream={privateStream}
            toggleMute={toggleMuteMainStream}
            isMuted={mutedStreamers[mainStreamActive]}
          />
        </div>
      </AnimatePresence>
    </>
  );
}
