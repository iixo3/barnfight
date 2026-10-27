import { User } from "@/shared/types/user/user";
import { firestore } from "@/shared/utils/firebase";
import { useFirestoreDocumentData } from "@/shared/utils/use-query-firebase";
import { doc, DocumentData } from "@firebase/firestore";
import { useCallback } from "react";

export const useGetAccountUserData = (
  account?: string,
  subscribe?: boolean
) => {
  const processUserData = useCallback(
    (user: User | undefined): User => {
      return {
        avatar: user?.avatar || null,
        username: user?.username || account || null,
        last_updated_time: user?.last_updated_time || null,
        number_game_created: user?.number_game_created || 0,
        number_tickets: user?.number_tickets || 0,
        user_pubkey: user?.user_pubkey || "",
        twitch: user?.twitch || null,
      };
    },
    [account]
  );

  const ref = doc(firestore, "users", account || "a");
  const { data, ...rest } = useFirestoreDocumentData<User | DocumentData>(
    ["users", account || "a"],
    ref,
    { subscribe },
    {
      queryKey: ["users", account],
      enabled: Boolean(account),
      placeholderData: {} as User,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    }
  );

  return { data: processUserData(data as User | undefined), ...rest };
};
