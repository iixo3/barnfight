import { Game, GamesHistory } from "@/shared/types/games/games";
import { firestore, functions } from "@/shared/utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useId, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { httpsCallable } from "@firebase/functions";
import { useWallet } from "@solana/wallet-adapter-react";
import { encode } from "bs58";

export const useSidebarSettings = (gameSettings: Game | null) => {
  const { signMessage, publicKey } = useWallet();

  // Add streaming accounts
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<string>("twitch");
  const [errorSearch, setErrorSearch] = useState("");
  const streamingAccounts: { streamer: string; platform: string }[] =
    gameSettings?.streamers || [];
  const anyoneCanStream = !gameSettings?.private_stream;

  const handleToggleAnyoneCanStream = async (type: "on" | "off") => {
    if (gameSettings?.id) {
      if (type === "on") {
        await updateData(false, streamingAccounts);
      } else {
        await updateData(true, streamingAccounts);
      }
    }
  };

  const updateData = async (
    private_stream: boolean,
    streamers: { streamer: string; platform: string }[]
  ) => {
    if (signMessage) {
      const payload = JSON.stringify({
        gameId: gameSettings?.id,
        private_stream,
        streamers,
        publicKey: publicKey?.toString(),
      });
      const message = new TextEncoder().encode(payload);
      const signature = await signMessage(message);
      const setGameSettingsRequest = httpsCallable(
        functions,
        "game-setGameSettings"
      );
      const {
        data: { status, message: messageError },
      } = (await setGameSettingsRequest({
        payload,
        signature: encode(signature),
      })) as {
        data: { status: string; message: string };
      };

      if (status !== "success") {
        setErrorSearch(messageError);
      }
    }
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 0) {
      setErrorSearch("");
    }

    setSearch(e.target.value);
  };

  const handleSaveStreamingAccounts = async () => {
    if (streamingAccounts.length > 4) return;

    if (search.length <= 1) {
      setErrorSearch("Minimum 2 characters");
      return;
    }

    await updateData(anyoneCanStream, [
      ...streamingAccounts,
      { streamer: search, platform },
    ]);

    setSearch("");
    setErrorSearch("");
  };

  const handleRemoveStreamingAccount = async (streamer: {
    streamer: string;
    platform: "twitch" | "youtube";
  }) => {
    const filteredStreamingAccounts = streamingAccounts.filter(
      (streamerAccount) =>
        streamerAccount.streamer !== streamer.streamer ||
        streamerAccount.platform !== streamer.platform
    );

    await updateData(anyoneCanStream, filteredStreamingAccounts);
  };

  return {
    search,
    handleToggleAnyoneCanStream,
    anyoneCanStream,
    searchField: {
      value: search,
      onChange: handleSearch,
      error: errorSearch,
    },
    platformField: {
      value: platform,
      onChange: setPlatform,
    },
    streamingAccounts: streamingAccounts as {
      streamer: string;
      platform: string;
    }[],
    handleSaveStreamingAccounts,
    handleRemoveStreamingAccount,
  };
};
