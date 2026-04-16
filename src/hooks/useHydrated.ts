import { useState, useEffect } from "react";

/**
 * Returns true only after hydration is complete (client-side).
 * Use to guard code that depends on browser APIs (localStorage, Date, etc.)
 * and would cause hydration mismatches if rendered on the server.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
