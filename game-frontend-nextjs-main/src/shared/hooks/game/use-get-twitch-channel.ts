import { useQuery } from "@tanstack/react-query";

export const useGetTwitchChannel = (channelId: string) => {
  return useQuery({
    queryKey: ["twitch", "channel", channelId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/twitch/channel?username=${channelId}`
        );

        return response.json();
      } catch (err) {
        throw Error("Unable to fetch Twitch channel data");
      }
    },
    refetchInterval: (query) => {
      if (query.state.error) {
        return 1000 * 60;
      }
      return false;
    },
    enabled: !!channelId,
    refetchOnWindowFocus: false,
  });
};
