import { readJSON, removeItem, writeJSON } from "../storage/safe-json-storage";

/**
 * Clé distincte de celle des réponses au questionnaire : c'est un consentement
 * légal, pas une donnée de questionnaire — cycle de vie différent (non effacé
 * par "Recommencer", seulement par l'effacement manuel depuis /à-propos).
 */
export const DISCLAIMER_STORAGE_KEY = "appfiscale.disclaimer-acknowledged.v1";

export function loadDisclaimerAcknowledged(): boolean {
  return readJSON<boolean>(DISCLAIMER_STORAGE_KEY, false);
}

export function saveDisclaimerAcknowledged(acknowledged: boolean): void {
  writeJSON(DISCLAIMER_STORAGE_KEY, acknowledged);
}

export function clearDisclaimerAcknowledged(): void {
  removeItem(DISCLAIMER_STORAGE_KEY);
}
