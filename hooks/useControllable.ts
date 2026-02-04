import { useState, useCallback, SetStateAction, Dispatch } from "react";

type UseControllableStateOptions<T> = {
  /** The controlled value from props */
  value?: T;
  /** The default value for uncontrolled mode */
  defaultValue: T;
  /** Callback when value changes (for controlled mode) */
  onChange?: (value: T) => void;
};

/**
 * Hook that supports both controlled and uncontrolled component patterns.
 * If `value` is provided, component is controlled. Otherwise, uses internal state.
 *
 * This pattern allows components to be flexible - consumers can choose
 * whether to manage state themselves or let the component handle it.
 */
export function useControllable<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);

  // Determine if we're in controlled mode
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback(
    (nextValue: SetStateAction<T>) => {
      // Resolve the next value (handle function updates)
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (prev: T) => T)(value)
          : nextValue;

      // In uncontrolled mode, update internal state
      if (!isControlled) {
        setInternalValue(resolvedValue);
      }

      // Always call onChange if provided
      onChange?.(resolvedValue);
    },
    [isControlled, onChange, value]
  );

  return [value, setValue];
}
