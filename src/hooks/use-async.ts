import { useCallback, useEffect, useState } from "react";

type State<T> = { data: T | null; error: Error | null; loading: boolean };

// Runs an async loader whenever its dependencies change, ignoring stale results.
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ data: s.data, error: null, loading: true }));
    loader()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error: Error) => active && setState({ data: null, error, loading: false }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, retry };
}
