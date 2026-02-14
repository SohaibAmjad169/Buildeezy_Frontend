import { useEffect, useRef } from "react";

// Debounce function
const useDebounce = (callback, delay, dependencies) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(handler);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useDebounce;