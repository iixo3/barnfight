"use client";

import Loader from "@/shared/ui/components/loaders/loader";
import React, { useMemo, useRef, useState } from "react";
import { TwitchChat, TwitchChatProps } from "react-twitch-embed";
import { MessageSquare } from "lucide-react";

type TwitchLazyChat = {
  channel: string;
};

const TwitchLazyChat: React.FC<TwitchLazyChat> = ({ channel }) => {
  const [readyChat, setReadyChat] = useState(false);

  return useMemo(() => {
    return (
      <>
        {!readyChat && (
          <div className="absolute bg-component-main top-0 left-0 w-full h-full flex items-center justify-center">
            <Loader />
          </div>
        )}

        <TwitchChat
          channel={channel}
          className="absolute top-0 left-0 w-full h-full z-10"
          width={"100%"}
          height={"100%"}
          onLoad={() => setReadyChat(true)}
        />
      </>
    );
  }, [channel, readyChat]);
};
export default TwitchLazyChat;
