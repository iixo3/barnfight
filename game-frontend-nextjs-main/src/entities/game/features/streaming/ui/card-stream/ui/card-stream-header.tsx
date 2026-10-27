import Icon from "@/shared/ui/components/icon/icon";
import Loader from "@/shared/ui/components/loaders/loader";
import { cn } from "@/shared/utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TwitchEmbed } from "react-twitch-embed";

type CardStreamHeaderProps = {
  url_stream: string;
  setEmbed: (e: any) => void;
  embed: any | null;
  handleSelectStream: (stream?: string, next_stream?: string) => void;
  mainStreamActive: string;
};

const CardStreamHeader: React.FC<CardStreamHeaderProps> = ({
  url_stream,
  setEmbed,
  embed,
  handleSelectStream,
  mainStreamActive,
}) => {
  const isActiveStream = useMemo(() => {
    return mainStreamActive === url_stream;
  }, [mainStreamActive, url_stream]);

  return url_stream ? (
    <div
      onClick={() => handleSelectStream(url_stream)}
      onMouseEnter={() => handleSelectStream(undefined, url_stream)}
      className={cn(
        isActiveStream && "border border-white",
        "w-full aspect-[16_/_8] relative rounded-lg overflow-hidden"
      )}
    >
      <div className="bg-transparent w-full h-full absolute top-0 left-0 z-10 cursor-pointer"></div>

      {isActiveStream ? (
        <div className="absolute top-0 left-0 w-full h-full bg-component-main flex gap-x-2 items-center justify-center">
          <span className="handjet-bold-16 text-white uppercase">Live</span>
          <div className="bg-red-500 rounded-full w-2 h-2"></div>
        </div>
      ) : (
        <>
          {!embed && (
            <div className="absolute top-0 left-0 w-full h-full bg-component-main flex items-center justify-center">
              <Loader size={20} />
            </div>
          )}

          <TwitchEmbed
            id={url_stream}
            className="absolute top-0 left-0 w-full h-full"
            width={"100%"}
            height={"100%"}
            withChat={false}
            hideControls={true}
            allowFullscreen={false}
            channel={url_stream}
            autoplay
            onVideoReady={setEmbed}
          />
        </>
      )}
    </div>
  ) : (
    <div className="w-full aspect-[16_/_8] relative rounded-lg overflow-hidden border border-text-secondary border-dashed bg-component-main flex items-center justify-center">
      <Icon icon="camera" width={28} height={17} className="fill-text-offset" />
    </div>
  );
};
export default React.memo(CardStreamHeader);
