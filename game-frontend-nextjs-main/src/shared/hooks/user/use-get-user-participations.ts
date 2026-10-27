import { useQuery } from "@tanstack/react-query";
import { User } from "@/shared/types/user/user";
import { firestore } from "@/shared/utils/firebase";
import {
  doc,
  getDocs,
  DocumentData,
  query,
  collection,
  where,
  orderBy,
  limit,
} from "@firebase/firestore";

const useGetUserParticipations = (account?: string) => {
  return useQuery({
    queryKey: ["users", account, "participations"],
    queryFn: async () => {
      try {
        const firebaseQuery = query(
          collection(firestore, "participation"),
          where("user_pubkey", "==", account),
          orderBy("last_updated_time", "desc"),
          limit(50)
        );
        const data = await getDocs(firebaseQuery);
        if (data.empty) {
          return [];
        }
        return data.docs.map((doc) => {
          return {
            id: doc.id,
            game_id: doc.data().game_id,
          } as {
            id: string;
            game_id: string;
          };
        });
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    enabled: !!account,
    placeholderData: [],
  });
};

const useGetUserParticipationForAGame = (
  account?: string,
  gameAddress?: string
) => {
  return useQuery({
    queryKey: ["users", account, "participations", gameAddress],
    queryFn: async () => {
      try {
        const firebaseQuery = query(
          collection(firestore, "participation"),
          where("user_pubkey", "==", account),
          where("game_id", "==", gameAddress),
          orderBy("last_updated_time", "desc"),
          limit(50)
        );

        const data = await getDocs(firebaseQuery);
        if (data.empty) {
          return [];
        }
        return data.docs.map((doc) => doc);
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    enabled: !!account && !!gameAddress,
    placeholderData: [],
  });
};
export { useGetUserParticipations, useGetUserParticipationForAGame };
