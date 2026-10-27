import { useEffect, useState } from "react";

export const useHandleStream = () => {
  const [mainStreamActive, setMainStreamActive] = useState<string>("");
  const [nextStreamActive, setNextStreamActive] = useState<string | undefined>(
    ""
  );
  const [nextStreamPlatform, setNextStreamPlatform] = useState<string | undefined>('twitch');

  const handleSelectStream = (
    stream?: string,
    newNextStream?: string,
    platform?: "twitch" | "youtube"
  ) => {
    if (stream) {
      if (mainStreamActive === stream) return;

      // Update main stream
      setMainStreamActive(stream);

      // Set next stream to previous main stream
      if (mainStreamActive) {
        setNextStreamActive(mainStreamActive);
      }

      // Update chat-container attribute
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        chatContainer.setAttribute("data-channel", stream);

        if (platform) {
          chatContainer.setAttribute("data-channel-platform", platform);
        }
      }
    }

    if (newNextStream && newNextStream !== mainStreamActive) {
      setNextStreamPlatform(platform || 'twitch');
      setNextStreamActive(newNextStream);
    }
  };

  useEffect(() => {
    if (nextStreamActive) {
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        chatContainer.setAttribute("data-next-channel", nextStreamActive || "");
        chatContainer.setAttribute(
          "data-next-channel-platform",
          nextStreamPlatform || ""
        );
      }

      const timeout = setTimeout(() => {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) {
          chatContainer.removeAttribute("data-next-channel");
          chatContainer.removeAttribute("data-next-channel-platform");
        }
        setNextStreamActive(undefined);
      }, 1000 * 60);

      return () => clearTimeout(timeout);
    }
  }, [nextStreamActive]);

  return {
    mainStreamActive,
    handleSelectStream,
  };
};
