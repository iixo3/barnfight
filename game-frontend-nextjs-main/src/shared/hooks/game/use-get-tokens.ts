import { env } from "@/shared/lib/config/env";
import { Game, GameToken } from "@/shared/types/games/games";
import { firestore } from "@/shared/utils/firebase";
import { revalidatePath, unstable_noStore } from "next/cache";
import { Query, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  limit,
  DocumentData,
  documentId,
} from "@firebase/firestore";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { useFirestoreDocumentData } from "@/shared/utils/use-query-firebase";

const predefined_tokens_list_dev = [
  "bzSvVHBjJFE3jDNJ5fhgNG23HZBW2jDUWHUaYLYdbv5",
  "GoMNscKYCyVfhPiB9G1krh5FeDcGBYH3J4jhJ1jeShNp",
  "HrXSsRa3zKsAPNkdu9ZSsZvQXAfuZejvcCb2K3wox3Gz",
  "FV6etEFawMhJrGB656y6Bb6vGfi7qicq6iNk6x86NFWT",
];

const predefined_tokens_list = [
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
  "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump",
  "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
  "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
  "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
  "A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump",
  "GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump",
  "5LafQUrVco6o7KMz42eqVEJ9LW31StPyGjeeu5sKoMtA",
  "8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn",
  "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
  "23CTZMjEYNNZUE4itfn3iv6kgM4xn7X7dx1kVX1Gr8Xi",
  "CeK6k4BMmiqkxkzYAbQuUp3hrVFSHxuQ1LJXmNybc3vz",
  "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9",
  "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY",
  "5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC",
  "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
  "79yTpy8uwmAkrdgZdq6ZSBTvxKsgPrNqTLvYQBh1pump",
  "43VWkd99HjqkhFTZbWBpMpRhjG469nWa7x7uEsgSH7We",
  "5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp",
  "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3",
  "CBdCxKo9QavR9hfShgpEBG3zekorAeD7W1jfq2o3pump",
];

export const useGetTokens = (search?: string) => {
  const fetchTokens = async (search?: string) => {
    const tokens =
      process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet"
        ? predefined_tokens_list_dev
        : predefined_tokens_list;

    try {
      const tokensCollection = collection(firestore, "tokens");

      let tokensQuery = query(tokensCollection, limit(24));

      if (search && search.length > 0) {
        tokensQuery = query(
          tokensCollection,
          where(documentId(), "==", search),
          limit(24)
        );
      } else {
        tokensQuery = query(
          tokensCollection,
          where(documentId(), "in", tokens),
          limit(50)
        );
      }

      const tokensSnapshot = await getDocs(tokensQuery);

      // const get_size = tokensSnapshot.size;

      const find_missing = tokens.filter((token) => {
        const mapped = tokensSnapshot.docs
          .map((doc) => doc.data())
          .map((t) => t.address);

        return !mapped.includes(token);
      });

      return tokensSnapshot.docs.map((doc) => doc.data() as GameToken);
    } catch (error) {
      console.error("Error getting tokens from Firestore", error);
      return [];
    }
  };

  return useQuery<GameToken[]>({
    queryKey: ["token", search],
    queryFn: () => fetchTokens(search),
    staleTime: 1000 * 60,
    retry: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetToken = (tokenId: string) => {
  return useQuery<GameToken>({
    queryKey: ["token", tokenId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/tokens/${tokenId}/metadata`);
        return res.json();
      } catch (err) {
        throw Error("Error fetching token metadata");
      }
    },
    refetchInterval: (query) => {
      if (query.state.error) {
        return 1000 * 60;
      }
      return false;
    },
    refetchOnWindowFocus: false,
  });
};
