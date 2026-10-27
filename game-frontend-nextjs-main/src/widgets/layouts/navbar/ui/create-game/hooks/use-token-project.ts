import { firestore } from "@/shared/utils/firebase";
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useState } from "react";

export const useTokenProject = (contractAddressValue: string) => {
  const [projectToken, setProjectToken] = useState<{
    id: string;
    address: string;
    logoURI: string;
    name: string;
    symbol: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorProjectToken, setErrorProjectToken] = useState<string | null>(
    null
  );

  const handleGetProjectToken = useCallback(async () => {
    setIsLoading(true);

    try {
      const findTokenByAddress = query(
        collection(firestore, "tokens"),
        where(documentId(), "==", contractAddressValue)
      );

      const res = (await getDocs(findTokenByAddress)).docs.map((doc) => {
        const extractedData = doc.data();
        return {
          id: doc.id || "",
          address: extractedData?.address || "",
          logoURI: extractedData?.logoURI || "",
          name: extractedData?.name || "",
          symbol: extractedData?.symbol || "",
        };
      })[0];

      if (
        !res ||
        !res.address ||
        !res.logoURI ||
        !res.name ||
        !res.symbol ||
        !res.id
      ) {
        throw new Error("Cannot find the token");
      }

      setProjectToken(res);
      setIsLoading(false);
      setErrorProjectToken(null);

      return res;
    } catch (err) {
      setErrorProjectToken("Cannot find the token");
      setIsLoading(false);
      setProjectToken(null);
    }
  }, [contractAddressValue]);

  const handleClearProjectTokenError = useCallback(() => {
    setErrorProjectToken(null);
  }, []);

  return {
    handle: handleGetProjectToken,
    isLoading,
    error: errorProjectToken,
    data: projectToken,
    clearError: handleClearProjectTokenError,
    clearProjectToken: () => setProjectToken(null),
  };
};
