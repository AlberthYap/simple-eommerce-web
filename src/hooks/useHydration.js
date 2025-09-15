import { useEffect, useState } from "react";
import useStore from "@/store/useStore";

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Manually hydrate the store
    useStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
};
