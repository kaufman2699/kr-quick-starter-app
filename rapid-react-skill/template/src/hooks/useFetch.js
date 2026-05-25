import { useEffect, useState } from 'react';

/**
 * Minimal data-fetching hook. Returns { data, loading, error }.
 *
 * Usage:
 *   const { data, loading, error } = useFetch('https://api.example.com/items');
 *
 * For Domo datasets, prefer the helpers in src/lib/domo.js — they handle the
 * window.domo runtime injection that Domo Custom Apps use.
 */
export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url, options)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error };
}
