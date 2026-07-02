import { useState, useEffect } from 'react';

// Returns a "delayed" copy of a value that only updates after the user stops
// changing it for `delay` ms. Great for search boxes: the input stays instant,
// but we only hit the server once typing pauses (instead of every keystroke).
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cancel if value changes before the delay
  }, [value, delay]);

  return debounced;
}
