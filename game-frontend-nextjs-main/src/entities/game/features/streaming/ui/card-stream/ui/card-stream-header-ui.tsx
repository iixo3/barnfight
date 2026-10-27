import Icon from "@/shared/ui/components/icon/icon";
import Loader from "@/shared/ui/components/loaders/loader";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { TwitchEmbed, TwitchPlayerInstance } from "react-twitch-embed";
import YouTubeEmbed, { YouTubeProps } from "react-youtube";
import { YouTubePlayer } from "react-youtube";

interface CardStreamHeaderUIProps {
  isSelected: boolean;
  streamer: string;
  handleSelectStream: (stream?: string, nextStream?: string, platform?: string) => void;
  setEmbed: (e: any) => void;
  embed: any | null;
  mainStreamSize: { width: number; height: number };
  mainStreamActive: string;
  isMuted: boolean;
  platform: "twitch" | "youtube";
}

const CardStreamHeaderUI: React.FC<CardStreamHeaderUIProps> = ({
  isSelected,
  streamer,
  handleSelectStream,
  setEmbed,
  embed,
  mainStreamSize,
  mainStreamActive,
  isMuted,
  platform,
}) => {
  // const PlayerComponent =
  //   platform === "twitch" ? TwitchEmbed : YouTubeEmbed;

  // const refYbe = useRef<YouTubePlayer | null>(null);
  // const [testst, setTestst] = useState<YouTubePlayer | null>(null);
  // const opts: YouTubeProps["opts"] = useMemo(
  //   () => ({
  //     playerVars: {
  //       autoplay: 1,
  //       mute: isMuted ? 0 : 1,
  //     },
  //   }),
  //   [isMuted]
  // );

  // const handleMute = () => {
  //   if (!testst) return;

  //   if (isMuted) {
  //     testst.mute();
  //   } else {
  //     testst.unMute();
  //   }
  // };

  // useEffect(() => {
  //   if (testst) {
  //     console.log("abecedar_tests", testst);
  //   }
  // }, [testst]);

  // useEffect(() => {
  //   handleMute();
  // }, [isMuted]);

  // useEffect(() => {
  //   console.log("abecedar_event_useEffect", {
  //     ref: refYbe.current,
  //     isMuted,
  //   });

  //   if (refYbe.current) {
  //     refYbe.current.internalPlayer.playVideo();

  //     if (isMuted) {
  //       refYbe.current.internalPlayer.mute();
  //     } else {
  //       refYbe.current.internalPlayer.unMute();
  //     }
  //   }
  // }, [isMuted, refYbe]);

  return !streamer ? (
    <div className="w-full aspect-[16_/_8] relative rounded-lg overflow-hidden border border-text-secondary border-dashed bg-component-main flex items-center justify-center">
      <Icon icon="camera" width={28} height={17} className="fill-text-offset" />
    </div>
  ) : (
    <>
      {isSelected && (
        <div className="relative aspect-[16_/_8] rounded-lg overflow-hidden bg-component-main flex gap-x-2 items-center justify-center">
          <span className="handjet-bold-16 text-white uppercase">Live</span>
          <div className="bg-red-500 rounded-full w-2 h-2"></div>
        </div>
      )}

      <motion.div
        className="w-full aspect-[16_/_8] rounded-lg overflow-hidden"
        animate={{
          width: isSelected ? mainStreamSize.width : "100%",
          height: isSelected ? mainStreamSize.height : "100%",
          bottom: 0,
          left: 0,
          position: isSelected ? "absolute" : "relative",
        }}
        transition={{ duration: 0 }}
        onMouseEnter={() => handleSelectStream(undefined, streamer, platform)}
        onClick={() => handleSelectStream(streamer, undefined, platform)}
      >
        <div className="bg-transparent w-full h-full absolute top-0 left-0 z-30 cursor-pointer" />

        {streamer &&
          useMemo(
            () => (
              <>
                {!embed && (
                  <div className="absolute top-0 left-0 z-20 w-full h-full bg-black flex items-center justify-center">
                    <Loader size={20} />
                  </div>
                )}

                {platform === "youtube" ? (
                  <YouTubeEmbed
                    videoId={streamer}
                    id={streamer}
                    className={"absolute top-0 z-10 left-0 w-full h-full"}
                    iframeClassName={"absolute top-0 z-10 left-0 w-full h-full"}
                    title={streamer}
                    autoplay={true}
                    onReady={(e: { target: YouTubePlayer }) => {
                      e.target.playVideo();
                      e.target.mutedAutoplay();
                      // setTestst(e.target);
                      setEmbed(e.target);
                    }}
                    opts={{
                      playerVars: {
                        autoplay: 1,
                        mute: !isSelected ? 0 : 1,
                        controls: 0,
                      },
                    }}
                  />
                ) : (
                  <TwitchEmbed
                    id={streamer}
                    className={"absolute top-0 z-10 left-0 w-full h-full"}
                    width="100%"
                    height="100%"
                    withChat={false}
                    hideControls={true}
                    allowFullscreen={false}
                    channel={streamer}
                    autoplay
                    muted={!isSelected}
                    onVideoReady={setEmbed}
                  />
                )}
              </>
            ),
            [streamer, embed]
          )}
      </motion.div>
    </>
  );
};

export default CardStreamHeaderUI;
