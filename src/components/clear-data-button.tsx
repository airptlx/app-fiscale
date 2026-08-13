"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDisclaimer } from "@/hooks/use-disclaimer";
import { clearAnswers } from "@/lib/questionnaire/answers-storage";

export function ClearDataButton() {
  const disclaimer = useDisclaimer();
  const [cleared, setCleared] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => {
          clearAnswers();
          disclaimer.clear();
          setCleared(true);
        }}
      >
        Effacer mes données
      </Button>
      {cleared && (
        <p role="status" className="text-sm text-muted-foreground">
          Tes réponses et ton consentement ont été effacés de cet appareil.
        </p>
      )}
    </div>
  );
}
