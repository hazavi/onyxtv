"use client";

import { useRef, useCallback, type RefObject } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

/**
 * Lightweight touch-swipe hook.
 * Returns a ref to attach to the swipeable element and touch handlers.
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(
  options: SwipeOptions
): {
  ref: RefObject<T | null>;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
} {
  const ref = useRef<T | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      const threshold = options.threshold ?? 50;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) options.onSwipeLeft?.();
        else options.onSwipeRight?.();
      }
    },
    [options]
  );

  return { ref, onTouchStart, onTouchEnd };
}
