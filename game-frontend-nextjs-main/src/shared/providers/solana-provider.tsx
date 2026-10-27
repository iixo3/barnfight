"use client";

import dynamic from "next/dynamic";
import { AnchorProvider } from "@coral-xyz/anchor";
import { WalletError, WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  AnchorWallet,
  useConnection,
  useWallet,
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { ReactNode, useCallback, useMemo } from "react";
import { useCluster } from "./cluster-provider";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

export const WalletButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// List of RPC endpoints (comma-separated in NEXT_PUBLIC_SOLANA_RPC_URLS)
const RPC_ENDPOINTS = (process.env.NEXT_PUBLIC_SOLANA_RPC_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

// Utility to randomly select an endpoint
function getRandomEndpoint() {
  const index = Math.floor(Math.random() * RPC_ENDPOINTS.length);
  return RPC_ENDPOINTS[index];
}

export function SolanaProvider({ children }: { children: ReactNode }) {
  const network =
    process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet") {
      return clusterApiUrl(network);
    }
    return getRandomEndpoint();
  }, [network]);
  const wallets = useMemo(
    () => [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: "confirmed",
  });
}
