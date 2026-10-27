import { useQuery } from "@tanstack/react-query";

export const useGetYoutubeInfo = (videoId: string) => {
  return useQuery({
    queryKey: ["youtube", "info", videoId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/youtube/channel?videoID=${videoId}`);

        return response.json();
      } catch (err) {
        throw Error("Unable to fetch Youtube info");
      }
    },
    refetchInterval: (query) => {
      if (query.state.error) {
        return 1000 * 60;
      }
      return false;
    },
    enabled: !!videoId,
    refetchOnWindowFocus: false,
  });
};
