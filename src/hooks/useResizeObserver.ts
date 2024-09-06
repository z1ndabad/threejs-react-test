import { useLayoutEffect, useRef, useState } from "react";

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function useResizeObserver<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [dimensions, setDimensions] = useState<DOMRectReadOnly>();

  useLayoutEffect(() => {
    if (containerRef.current) {
      const debouncedSetDimensions = debounce(
        (entries: ResizeObserverEntry[]) => {
          const box = entries[0].contentRect;
          setDimensions(box);
        },
        100,
      );

      const resizeObserver = new ResizeObserver(debouncedSetDimensions);
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerRef]);

  return { containerRef, dimensions };
}

export { useResizeObserver };
