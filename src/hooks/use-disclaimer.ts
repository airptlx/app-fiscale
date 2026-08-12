"use client";

import { useEffect, useState } from "react";
import {
  clearDisclaimerAcknowledged,
  loadDisclaimerAcknowledged,
  saveDisclaimerAcknowledged,
} from "@/lib/disclaimer/storage";

export function useDisclaimer() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Lecture unique de localStorage au montage — cf. plan incrément 3, décision n°2.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAcknowledged(loadDisclaimerAcknowledged());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  const acknowledge = (value: boolean) => {
    setAcknowledged(value);
    saveDisclaimerAcknowledged(value);
  };

  const clear = () => {
    setAcknowledged(false);
    clearDisclaimerAcknowledged();
  };

  return { acknowledged, isHydrated, acknowledge, clear };
}
