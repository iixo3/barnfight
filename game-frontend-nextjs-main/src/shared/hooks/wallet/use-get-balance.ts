"use client";

import { getQueryClient } from "@/shared/utils/get-query-client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export async function revalidateBalance() {
  const queryClient = getQueryClient();

  await queryClient.invalidateQueries({
    queryKey: ["get-balance"],
    refetchType: "active",
  });

  await queryClient.invalidateQueries({
    queryKey: ["user-account"],
    refetchType: "active",
  });
}

export function useGetBalance() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const enableQuery = useMemo(() => {
    return connected && !!publicKey;
  }, [connected, publicKey]);

  return useQuery({
    refetchOnWindowFocus: true,
    queryKey: [
      "get-balance",
      { endpoint: connection?.rpcEndpoint, address: publicKey?.toString() },
    ],
    queryFn: async () => {
      return await connection.getBalance(publicKey as PublicKey);
    },
    enabled: enableQuery,
    placeholderData: 0,
  });
}
