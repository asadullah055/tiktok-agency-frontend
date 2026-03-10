import { useCallback, useState } from "react";

const useAsyncAction = (asyncFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        return await asyncFn(...args);
      } catch (err) {
        setError(err?.message || "Unexpected error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { run, loading, error };
};

export default useAsyncAction;
