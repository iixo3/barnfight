import { useEffect, useRef } from "react";

export function useMutationObserver<T extends HTMLElement>(
  callback: MutationCallback
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      const observer = new MutationObserver(callback);
      observer.observe(element, { attributes: true });
      return () => observer.disconnect();
    }
  }, [callback]);

  return ref;
}
