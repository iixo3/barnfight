import { useQuery } from "@tanstack/react-query";

export const useGetTwitchUser = (username: string) => {
  return useQuery({
    queryKey: ["twitch", "user", username],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/twitch/user?username=${username}`);

        return response.json();
      } catch (err) {
        throw Error("Unable to fetch Twitch user data");
      }
    },
    refetchInterval: (query) => {
      if (query.state.error) {
        return 1000 * 60;
      }
      return false;
    },
    refetchOnWindowFocus: false,
    enabled: !!username,
  });
};
