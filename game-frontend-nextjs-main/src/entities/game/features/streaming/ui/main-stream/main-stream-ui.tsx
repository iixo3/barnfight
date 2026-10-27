import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import { cn } from "@/shared/utils";
import { useMemo } from "react";

interface MainStreamUIProps {
  containerMainStreamRef: React.RefObject<HTMLDivElement>;
  mainStreamActive: string;
  getStreamers: {
    streamer: string;
    platform: "twitch" | "youtube";
  }[];
  privateStream: boolean;
  toggleMute: () => void;
  isMuted: boolean;
}

const MainStreamUI: React.FC<MainStreamUIProps> = ({
  containerMainStreamRef,
  mainStreamActive,
  getStreamers,
  privateStream,
  toggleMute,
  isMuted,
}) => {
  const isAnyoneStreaming = useMemo(() => {
    return getStreamers.some((streamer) => streamer.streamer !== "");
  }, [getStreamers]);

  return (
    <div
      ref={containerMainStreamRef}
      id="main-stream"
      className={cn(
        "flex-1 bg-component-main aspect-[16_/_8] rounded-2xl relative w-full overflow-hidden",
        !mainStreamActive &&
          "border border-stroke-main flex items-center justify-center"
      )}
    >
      {!mainStreamActive ? (
        <div className="flex items-center justify-center flex-col gap-y-5">
          <Icon
            icon="camera-lg"
            width={66}
            height={39}
            className="fill-icons"
          />

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
      ) : (
        <div className="z-50 absolute top-0 left-0 w-full h-full group flex items-end justify-end p-4">
          <Button
            onClick={toggleMute}
            className="group-hover:flex hidden"
            variant="solid"
            size="outer_icon"
          >
            <Icon
              icon={isMuted ? "mute-on" : "mute-off"}
              width={16}
              height={16}
              className="fill-text-secondary"
            />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MainStreamUI;
