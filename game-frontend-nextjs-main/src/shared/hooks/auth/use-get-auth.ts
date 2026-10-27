import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useMemo } from "react";
import { useGetAccountUserData } from "../user/use-get-user-data";
import { User } from "@/shared/types/user/user";
import { useMemetankProgram } from "@/contract/memetank-data-access";

export const useGetAuth = (): {
  isAuthenticated: boolean;
  isLoadingAuthentication: boolean;
  user: User | undefined;
  userPDA: string | null;
} => {
  const [userPDA, setUserPDA] = useState<string | null>(null);
  const { publicKey, connecting } = useWallet();
  const [isLoadingWindow, setIsLoadingWindow] = useState(true);
  const { getMemeTankUserPDA } = useMemetankProgram();
  const { data: userData, isLoading: isUserDataLoading } =
    useGetAccountUserData(publicKey?.toString() || "");

  useEffect(() => {
    if (publicKey) {
      getMemeTankUserPDA(publicKey)
        .then((pda) => {
          setUserPDA(pda.toString());
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setUserPDA(null);
    }
  }, [publicKey]);

  useEffect(() => {
    setIsLoadingWindow(false);
  }, []);

  const isAuthenticated = !!publicKey;

  return {
    isAuthenticated,
    isLoadingAuthentication: connecting || isUserDataLoading || isLoadingWindow,
    user: userData,
    userPDA,
  };
};
