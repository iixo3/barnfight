import { useCluster } from "@/shared/providers/cluster-provider";
import { getQueryClient } from "@/shared/utils/get-query-client";
import { useQuery } from "@tanstack/react-query";

type Network = "mainnet-beta" | "testnet" | "devnet" | "custom";

const nonMainnetAddressesMap: { [key: string]: string } = {
  bzSvVHBjJFE3jDNJ5fhgNG23HZBW2jDUWHUaYLYdbv5:
    "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
  jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL:
    "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
  GoMNscKYCyVfhPiB9G1krh5FeDcGBYH3J4jhJ1jeShNp:
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  HrXSsRa3zKsAPNkdu9ZSsZvQXAfuZejvcCb2K3wox3Gz:
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  FV6etEFawMhJrGB656y6Bb6vGfi7qicq6iNk6x86NFWT:
    "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
  HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3:
    "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
};

export const useGetTokenPrice = (tokenAddress: string) => {
  const queryClient = getQueryClient();
  const { cluster } = useCluster();

  const network = "mainnet-beta";

  return useQuery<
    | any
    | {
        price: number;
        impactBuyPoints: { 10: number; 100: number; 1000: number };
      }
  >({
    queryKey: ["get-token-price", tokenAddress, network],
    queryFn: async () => {
      try {
        let tokenAddressToUse = tokenAddress;

        if (network !== "mainnet-beta") {
          if (nonMainnetAddressesMap[tokenAddress]) {
            tokenAddressToUse = nonMainnetAddressesMap[tokenAddress];
          } else {
            tokenAddressToUse =
              nonMainnetAddressesMap[Object.keys(nonMainnetAddressesMap)[0]];
          }
        }

        const dataTokenAddress = await (
          await fetch(
            `https://api.jup.ag/price/v2?ids=${tokenAddressToUse}&vsToken=So11111111111111111111111111111111111111112`
          )
        ).json();

        const getImpactBuy = await (
          await fetch(
            "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112&showExtraInfo=true"
          )
        ).json();

        const impactBuyPoints = getImpactBuy?.data?.[
          "So11111111111111111111111111111111111111112"
        ]?.extraInfo?.depth?.buyPriceImpactRatio?.depth ?? {
          10: 0,
          100: 0,
          1000: 0,
        };

        const price = dataTokenAddress?.data?.[tokenAddressToUse]?.price;

        if (!price) {
          throw new Error("Something went wrong");
        }

        return {
          price,
          impactBuyPoints,
        };
      } catch (err) {
        const lastData = queryClient.getQueryData([
          "get-token-price",
          tokenAddress,
          network,
        ]);

        if (lastData && lastData !== undefined) {
          return lastData;
        } else {
          return {
            price: 0,
            impactBuyPoints: {
              10: 0,
              100: 0,
              1000: 0,
            },
          };
        }
      }
    },
    enabled: !!tokenAddress,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: () =>
      queryClient.getQueryData(["get-token-price", tokenAddress, network]),
  });
};
