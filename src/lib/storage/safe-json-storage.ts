/**
 * Wrapper générique autour de `localStorage`, tolérant aux environnements où
 * il n'est pas disponible ou fiable : SSR (`window` indéfini), navigation
 * privée (quota refusé), JSON corrompu. Ne lève jamais.
 */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota dépassé ou stockage indisponible (ex. navigation privée) : on abandonne silencieusement.
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // idem
  }
}
