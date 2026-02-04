import { useEffect, useRef, RefObject } from "react";

/**
 * Hook that triggers a callback when clicking outside the referenced element.
 * Useful for closing dropdowns, modals, and other overlay components.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      // Check if click is outside the referenced element
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    }

    // Use mousedown instead of click to handle before focus changes
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}
