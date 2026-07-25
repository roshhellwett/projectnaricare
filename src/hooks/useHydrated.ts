import { useEffect, useState } from "react";

/**
 * Returns true after the component has hydrated on the client.
 * Use this to gate render output that depends on Math.random(), Date.now(),
 * localStorage, or window — anything that would otherwise cause a
 * hydration mismatch between the SSR HTML and the first client render.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
