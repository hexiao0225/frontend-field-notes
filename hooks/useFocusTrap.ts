import { useEffect, useRef, RefObject, useCallback } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * Hook that traps focus within a container element.
 * Essential for modal accessibility - prevents focus from escaping.
 *
 * @param enabled - Whether the focus trap is active
 * @param initialFocusRef - Optional ref to element that should receive initial focus
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  enabled: boolean = true,
  initialFocusRef?: RefObject<HTMLElement>
): RefObject<T> {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => el.offsetParent !== null); // Filter out hidden elements
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Store the previously focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> focus last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to previously active element
      previousActiveElement.current?.focus();
    };
  }, [enabled, getFocusableElements, initialFocusRef]);

  return containerRef;
}
