import Loader from "@/shared/ui/components/loaders/loader";
import React, { useMemo, useState } from "react";

type YoutubeChatProps = {
  videoId: string;
};

const YoutubeChat: React.FC<YoutubeChatProps> = ({ videoId }) => {
  const [readyChat, setReadyChat] = useState(false);

  return useMemo(() => {
    return (
      <>
        {!readyChat && (
          <div className="absolute bg-component-main top-0 left-0 w-full h-full flex items-center justify-center">
            <Loader />
          </div>
        )}

        <iframe
          referrerPolicy="origin"
          src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`}
          className="w-full h-full"
          onLoad={() => setReadyChat(true)}
        />
      </>
    );
  }, [readyChat]);
};

export default YoutubeChat;
