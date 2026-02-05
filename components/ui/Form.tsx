"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  useCallback,
  ReactNode,
  FormEvent,
  InputHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/cn";

// ============================================================================
// Types
// ============================================================================

type ValidationRule = {
  validate: (value: string) => boolean;
  message: string;
};

type FieldState = {
  value: string;
  error: string | null;
  touched: boolean;
};

type FormState = Record<string, FieldState>;

type FormContextValue = {
  values: FormState;
  setFieldValue: (name: string, value: string) => void;
  setFieldError: (name: string, error: string | null) => void;
  setFieldTouched: (name: string) => void;
  validateField: (name: string) => boolean;
  validateAllFields: () => boolean;
  registerField: (name: string, rules: ValidationRule[]) => void;
  isSubmitting: boolean;
};

// ============================================================================
// Context
// ============================================================================

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("Form components must be used within a Form provider");
  }
  return context;
}

// ============================================================================
// Common Validators
// ============================================================================

export const validators = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  email: (message = "Please enter a valid email"): ValidationRule => ({
    validate: (value) =>
      value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    validate: (value) => value === "" || value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= length,
    message: message || `Must be no more than ${length} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => value === "" || regex.test(value),
    message,
  }),

  match: (
    getOtherValue: () => string,
    message = "Fields must match"
  ): ValidationRule => ({
    validate: (value) => value === getOtherValue(),
    message,
  }),
};

// ============================================================================
// Form Root
// ============================================================================

type FormProps = {
  children: ReactNode;
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
  className?: string;
};

/**
 * Form component with built-in validation.
 * Validates on blur and submit.
 */
function Form({ children, onSubmit, className }: FormProps) {
  const [values, setValues] = useState<FormState>({});
  const [rules, setRules] = useState<Record<string, ValidationRule[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerField = useCallback((name: string, fieldRules: ValidationRule[]) => {
    setRules((prev) => ({ ...prev, [name]: fieldRules }));
    setValues((prev) => {
      if (prev[name]) return prev;
      return {
        ...prev,
        [name]: { value: "", error: null, touched: false },
      };
    });
  }, []);

  const setFieldValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: { ...prev[name], value },
    }));
  }, []);

  const setFieldError = useCallback((name: string, error: string | null) => {
    setValues((prev) => ({
      ...prev,
      [name]: { ...prev[name], error },
    }));
  }, []);

  const setFieldTouched = useCallback((name: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: { ...prev[name], touched: true },
    }));
  }, []);

  const validateField = useCallback(
    (name: string): boolean => {
      const fieldRules = rules[name] || [];
      const value = values[name]?.value || "";

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          setFieldError(name, rule.message);
          return false;
        }
      }

      setFieldError(name, null);
      return true;
    },
    [rules, values, setFieldError]
  );

  const validateAllFields = useCallback((): boolean => {
    let isValid = true;

    Object.keys(rules).forEach((name) => {
      const fieldValid = validateField(name);
      if (!fieldValid) isValid = false;
      setFieldTouched(name);
    });

    return isValid;
  }, [rules, validateField, setFieldTouched]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = validateAllFields();
    if (!isValid || !onSubmit) return;

    setIsSubmitting(true);

    try {
      const formValues = Object.entries(values).reduce(
        (acc, [key, field]) => ({ ...acc, [key]: field.value }),
        {} as Record<string, string>
      );
      await onSubmit(formValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        values,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        validateField,
        validateAllFields,
        registerField,
        isSubmitting,
      }}
    >
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// ============================================================================
// Form Field
// ============================================================================

type FormFieldProps = {
  /** Unique field name */
  name: string;
  /** Label text */
  label: string;
  /** Validation rules */
  rules?: ValidationRule[];
  /** Help text shown below the input */
  helpText?: string;
  children?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

/**
 * Form field with label, input, and error handling.
 * Validates on blur.
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    { name, label, rules = [], helpText, children, className, type = "text", ...inputProps },
    ref
  ) {
    const baseId = useId();
    const inputId = `${baseId}-input`;
    const errorId = `${baseId}-error`;
    const helpId = `${baseId}-help`;

    const {
      values,
      setFieldValue,
      setFieldTouched,
      validateField,
      registerField,
    } = useFormContext();

    // Register field on mount
    useState(() => {
      registerField(name, rules);
    });

    const field = values[name] || { value: "", error: null, touched: false };
    const showError = field.touched && field.error;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue(name, e.target.value);
      // Clear error while typing
      if (field.error) {
        validateField(name);
      }
    };

    const handleBlur = () => {
      setFieldTouched(name);
      validateField(name);
    };

    const describedBy = [
      showError ? errorId : null,
      helpText ? helpId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className={cn("space-y-1", className)}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
          {rules.some((r) => r.message.toLowerCase().includes("required")) && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {children || (
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={field.value}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={showError ? "true" : undefined}
            aria-describedby={describedBy}
            className={cn(
              "block w-full px-3 py-2 text-sm rounded-md border",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              "focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-gray-900",
              showError
                ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            )}
            {...inputProps}
          />
        )}

        {helpText && !showError && (
          <p id={helpId} className="text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}

        {showError && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {field.error}
          </p>
        )}
      </div>
    );
  }
);

// ============================================================================
// Form Actions
// ============================================================================

type FormActionsProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Container for form submit/cancel buttons.
 */
function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex justify-end gap-3 pt-4", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Submit Button
// ============================================================================

type SubmitButtonProps = {
  children: ReactNode;
  className?: string;
  loadingText?: string;
};

/**
 * Submit button that shows loading state.
 */
function SubmitButton({
  children,
  className,
  loadingText = "Submitting...",
}: SubmitButtonProps) {
  const { isSubmitting } = useFormContext();

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2",
        "text-sm font-medium rounded-md",
        "bg-blue-600 text-white",
        "hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isSubmitting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================================================
// Export
// ============================================================================

const FormComponent = Object.assign(Form, {
  Field: FormField,
  Actions: FormActions,
  Submit: SubmitButton,
});

export { FormComponent as Form };
