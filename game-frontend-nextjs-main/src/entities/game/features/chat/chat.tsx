"use client";

import { useMutationObserver } from "@/shared/hooks/basic/use-mutation-observer";
import Loader from "@/shared/ui/components/loaders/loader";
import { cn } from "@/shared/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import TwitchLazyChat from "./ui/twitch-lazy-chat";
import { MessageSquare } from "lucide-react";
import YoutubeChat from "./ui/youtube-chat";

type ChatProps = {
  game: string;
};

const Chat: React.FC<ChatProps> = ({ game }) => {
  const [readyChat, setReadyChat] = useState(false);
  const [channel, setChannel] = useState("");
  const [nextChannel, setNextChannel] = useState<string | null>(null);
  const [renderedChats, setRenderedChats] = useState<(string | null)[]>([]);
  const [activeChat, setActiveChat] = useState(0);
  const [platformMapping, setPlatformMapping] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    let newRenderedChats = [...renderedChats];
    if (channel) {
      if (renderedChats.includes(channel)) {
        const index = renderedChats.indexOf(channel);
        if (activeChat !== index) {
          setActiveChat(index);
        }
      } else {
        //chat is new, replace the current active chat
        //set chat at the same index in renderedChats
        const newChats = [...renderedChats];
        newChats[activeChat] = channel;
        newRenderedChats = newChats;
      }
    }

    if (nextChannel) {
      if (!renderedChats.includes(nextChannel)) {
        if (renderedChats.length > 0) {
          const newChats = [...renderedChats];
          newChats[activeChat == 0 ? 1 : 0] = nextChannel;
          newRenderedChats = newChats;
        }
      }
    } else {
      if (renderedChats.length > 1) {
        const newChats = [...renderedChats];
        newChats[activeChat == 0 ? 1 : 0] = null;
        newRenderedChats = newChats;
      }
    }
    if (JSON.stringify(newRenderedChats) !== JSON.stringify(renderedChats)) {
      setRenderedChats(newRenderedChats);
    }
  }, [channel, nextChannel, renderedChats, activeChat]);
  const containerRef = useMutationObserver<HTMLDivElement>((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-next-channel"
      ) {
        const nextChannel = (mutation.target as HTMLDivElement).getAttribute(
          "data-next-channel"
        );
        const nextPlatform = (mutation.target as HTMLDivElement).getAttribute(
          "data-next-channel-platform"
        );
        if (nextPlatform) {
          setPlatformMapping((prev) => ({
            ...prev,
            [nextChannel ?? ""]: nextPlatform,
          }));
        }
        setNextChannel(nextChannel ?? null);
      }
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-channel"
      ) {
        const channel = (mutation.target as HTMLDivElement).getAttribute(
          "data-channel"
        )
        const platform = (mutation.target as HTMLDivElement).getAttribute(
          "data-channel-platform"
        );
        if (platform) {
          setPlatformMapping((prev) => ({
            ...prev,
            [channel ?? ""]: platform,
          }));
        }
        setChannel(channel ?? "");
        
      }

    }
  });

  const validRenderedChats = renderedChats.filter((channel) => platformMapping[channel ?? ""]);

  console.log("validRenderedChats", validRenderedChats, platformMapping);
  return (
    <div
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden",
        channel && "border border-stroke-main"
      )}
      ref={containerRef}
      data-channel={""}
      id="chat-container"
    >
      {validRenderedChats.map((channel: string | null, i) => {
        if (!channel) return null;
        return (
          <div
            key={channel}
            className={`absolute top-0 left-0 w-full h-full ${
              activeChat === i ? "z-10" : "z-0"
            }`}
          >
            {platformMapping[channel] === "twitch" ? (
              <TwitchLazyChat channel={channel} />
            ) : (
              <YoutubeChat videoId={channel} />
            )}
          </div>
        );
      })}
      {validRenderedChats.length === 0 && (
        <div className="bg-component-main w-full h-full flex items-center justify-center flex-col gap-y-5">
          <MessageSquare
            width={60}
            height={60}
            strokeWidth={2.5}
            className="stroke-icons"
          />
          <div className="flex flex-col gap-y-1.5 items-center justify-center text-center">
            <span className="hanjdet-bold-16 text-white">
              Empty stream selected
            </span>
            <span className="aeonik-light-11 text-text-secondary">
              Select an available stream to begin chatting
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default React.memo(Chat);
