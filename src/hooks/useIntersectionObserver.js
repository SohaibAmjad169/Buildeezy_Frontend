// hooks/useIntersectionObserver.js
import { useEffect, useRef, useState } from 'react';

const useIntersectionObserver = ({
  threshold = 0.8, // 80% of the element must be visible
  root = null,
  rootMargin = '0px',
  onIntersect,
  once = true, // Fire only once
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const node = targetRef.current;
    if (!node || (once && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold;
        
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasTriggered) {
          onIntersect?.(entry);
          if (once) {
            setHasTriggered(true);
          }
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, onIntersect, once, hasTriggered]);

  return [targetRef, isIntersecting, hasTriggered];
};

export default useIntersectionObserver;