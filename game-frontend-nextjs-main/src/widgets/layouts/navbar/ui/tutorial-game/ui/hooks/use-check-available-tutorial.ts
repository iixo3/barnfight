import { useEffect, useMemo, useState } from "react";

export const useCheckAvailableTutorial = () => {
  const tutorialId = "dHV0b3JpYWwtZ2FtZS1hdmFpbGFibGU=";
  const [seenTutorial, setGetSeenTutorial] = useState<boolean | null>(null);

  const getTutorialId = localStorage.getItem(tutorialId);

  const getSeenTutorial = useMemo(() => {
    if (!getTutorialId) return false;

    if (getTutorialId === "true") return true;

    return false;
  }, [getTutorialId]);

  const setSeenTutorial = (value: boolean) => {
    localStorage.setItem(tutorialId, value ? "true" : "false");
    setGetSeenTutorial(value);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tutorialValue = localStorage.getItem(tutorialId);
      setGetSeenTutorial(tutorialValue === "true");
    }
  }, []);

  return {
    getSeenTutorial,
    setSeenTutorial,
    isLoading: seenTutorial === null,
  };
};
