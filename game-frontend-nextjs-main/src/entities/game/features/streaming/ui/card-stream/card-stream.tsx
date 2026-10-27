"use client";

import React, { useEffect, useMemo } from "react";
import CardStreamerBody from "./ui/card-stream-body";
import CardStreamHeader from "./ui/card-stream-header";
import { useHandleStream } from "../../hooks/use-handle-stream";

type CardStreamProps = {
  emptySlot: boolean;
  mainStreamActive: string;
  streamer: string;
  handleSelectStream: (stream?: string, nextStream?: string) => void;
  privateStream: boolean;
};

const CardStream: React.FC<CardStreamProps> = ({
  emptySlot,
  streamer,
  mainStreamActive,
  handleSelectStream,
  privateStream,
}) => {
  const [embed, setEmbed] = React.useState(null);
  const [muted, setMuted] = React.useState(true);

  // const { data: user, isLoading } = useGetAccountUserData(
  //   streamer.account,
  //   !emptySlot
  // );


  useEffect(() => {
    setMuted(true);
  }, [streamer]);

  useEffect(() => {
    if (embed) {
      //@ts-ignore
      embed.setMuted(muted);
    }
  }, [muted, embed]);

  return useMemo(() => {
    return (
      <div className="flex flex-col gap-y-2.5 w-full h-full">
        <CardStreamHeader
          url_stream={streamer}
          mainStreamActive={mainStreamActive}
          setEmbed={setEmbed}
          embed={embed}
          handleSelectStream={handleSelectStream}
        />
        <CardStreamerBody
          id={streamer}
          muted={muted}
          setMuted={setMuted}
          privateStream={privateStream}
        />
      </div>
    );
  }, [streamer, embed, muted, handleSelectStream]);
};
export default CardStream;
