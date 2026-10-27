import { Button } from "@/shared/ui/components/button/button";
import { WalletName } from "@solana/wallet-adapter-base";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { Wallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import React, { useMemo, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

// Utility to detect mobile devices
const isMobileDevice = () => {
  if (typeof window !== "undefined") {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  return false;
};

type SignInButtonProps = {};

const SignInButton: React.FC<SignInButtonProps> = () => {
  const [walletModalConfig, setWalletModalConfig] = useState<Readonly<{
    onSelectWallet(walletName: WalletName): void;
    wallets: Wallet[];
  }> | null>(null);

  const { setVisible } = useWalletModal();
  const wallet = useWallet();
  const isMobile = isMobileDevice();

  const { buttonState } = useWalletMultiButton({
    onSelectWallet: setWalletModalConfig,
  });

  const label = useMemo(() => {
    switch (buttonState) {
      case "connected":
        return wallet ? `${wallet.publicKey?.toString().substring(0, 6)}...${wallet.publicKey?.toString().substring(wallet.publicKey.toString().length - 6)}` : "Disconnect";
      case "connecting":
        return "CONNECTING";
      case "disconnecting":
        return "Disconnecting";
      case "has-wallet":
        return "CONNECT WALLET";
      case "no-wallet":
        return "CONNECT WALLET";
      default:
        return "CONNECT WALLET";
    }
  }, [buttonState, wallet]);
  
  const handleConnect = async () => {  
    try {
      if (!wallet.connected) {
        if (isMobile) {
          if (wallet.wallets.length > 0) {
            // Priority selection: Phantom > Solflare > Backpack > first available wallet
            const walletToSelect = wallet.wallets.find(
              (w) =>
                w.adapter.name === "Phantom" ||
                w.adapter.name === "Solflare" ||
                w.adapter.name === "Backpack"
            ) || wallet.wallets[0];
  
            if (walletToSelect) {
              wallet.select(walletToSelect.adapter.name);
              await wallet.connect();
            } else {
              console.error("No suitable wallets available to connect.");
            }
          } else {
            console.error("No wallets available to connect.");
          }
        } else {
          setVisible(true);
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
  
 
  return (
    <Button
      variant="action_outlined"
      disabled={buttonState === "connecting" || buttonState === "disconnecting"}
      onClick={handleConnect}
    >
      {label}
    </Button>
  );
};
export default SignInButton;
