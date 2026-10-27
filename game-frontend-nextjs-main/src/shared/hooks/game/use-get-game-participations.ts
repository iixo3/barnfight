import { Game } from "@/shared/types/games/games";
import { firestore } from "@/shared/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";

export const useGetGameParticipationsToken = (
  gameId: Game["id"],
  tokensList: Game["tokens"][0]["token_address"][]
) => {
  return useQuery({
    queryKey: ["game-participations-token", gameId, tokensList.join(",")],
    queryFn: async () => {
      try {
        const participationsCollection = collection(firestore, `participation`);
        const participationsQuery = query(
          participationsCollection,
          where("game_id", "==", gameId),
          where("token_address", "in", tokensList)
        );

        const participations = (await getDocs(participationsQuery)).docs.map(
          (doc) => doc.data()
        );

        const distinct = tokensList.reduce((acc, token) => {
          return {
            ...acc,
            [token]: Array.from(
              new Set(
                participations
                  ?.filter((p) => p?.token_address === token)
                  ?.map((p) => p?.user_pubkey) ?? []
              )
            ),
          };
        }, {});

        console.log("initialParticipations", {
          participations,
          distinct,
          partx: participations.map((user) => user?.user_pubkey),
          part: new Set(participations.map((user) => user?.user_pubkey)),
        });

        return distinct;
      } catch (err) {
        console.error("Error fetching participations", err);
        return tokensList.reduce((acc, token) => {
          return {
            ...acc,
            [token]: 0,
          };
        }, {});
      }
    },
    enabled: !!gameId && !!tokensList.length,
  });
};
