"use client";

import { useState } from "react";
import { Form, validators } from "@/components/ui";
import { DemoCard } from "./DemoCard";

const formSource = `// components/ui/Form.tsx - Key parts
const FormContext = createContext<FormContextValue | null>(null);

// Built-in validators
export const validators = {
  required: (message = "Required") => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),
  email: (message = "Invalid email") => ({
    validate: (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value),
    message,
  }),
  minLength: (length, message) => ({
    validate: (value) => value.length >= length,
    message: message || \`Min \${length} characters\`,
  }),
  pattern: (regex, message) => ({
    validate: (value) => regex.test(value),
    message,
  }),
};

function Form({ children, onSubmit }) {
  const [values, setValues] = useState({});
  const [rules, setRules] = useState({});

  const validateField = (name) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allValid = Object.keys(rules).every(validateField);
    if (allValid) await onSubmit(extractValues(values));
  };

  return (
    <FormContext.Provider value={{ values, validateField, ... }}>
      <form onSubmit={handleSubmit} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}

function FormField({ name, label, rules = [], ...inputProps }) {
  const { values, setFieldValue, validateField } = useFormContext();
  const field = values[name] || { value: "", error: null, touched: false };
  const showError = field.touched && field.error;

  // Register rules on mount
  useEffect(() => registerField(name, rules), []);

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        value={field.value}
        onChange={(e) => setFieldValue(name, e.target.value)}
        onBlur={() => {
          setFieldTouched(name);
          validateField(name); // Validate on blur
        }}
        aria-invalid={showError ? "true" : undefined}
        aria-describedby={showError ? errorId : undefined}
        {...inputProps}
      />
      {showError && (
        <p id={errorId} role="alert" className="text-red-600">
          {field.error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ children }) {
  const { isSubmitting } = useFormContext();
  return (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? <Spinner /> : children}
    </button>
  );
}`;

export function FormDemo() {
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    string
  > | null>(null);

  const handleSubmit = async (values: Record<string, string>) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmittedData(values);
  };

  return (
    <DemoCard
      title="Form Validation"
      description="Client-side validation with accessible error messages. Validates on blur and submit."
      sourceFiles={[{ filename: "components/ui/Form.tsx", code: formSource }]}
    >
      <div className="space-y-6">
        <Form onSubmit={handleSubmit} className="space-y-4">
          <Form.Field
            name="name"
            label="Full Name"
            placeholder="John Doe"
            rules={[
              validators.required("Name is required"),
              validators.minLength(2, "Name must be at least 2 characters"),
            ]}
          />

          <Form.Field
            name="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            rules={[
              validators.required("Email is required"),
              validators.email("Please enter a valid email address"),
            ]}
            helpText="We'll never share your email with anyone."
          />

          <Form.Field
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            rules={[
              validators.required("Password is required"),
              validators.minLength(8, "Password must be at least 8 characters"),
              validators.pattern(
                /[A-Z]/,
                "Password must contain at least one uppercase letter"
              ),
              validators.pattern(
                /[0-9]/,
                "Password must contain at least one number"
              ),
            ]}
          />

          <Form.Field
            name="website"
            label="Website"
            type="url"
            placeholder="https://example.com"
            rules={[
              validators.pattern(
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                "Please enter a valid URL"
              ),
            ]}
            helpText="Optional. Include https://"
          />

          <Form.Actions>
            <button
              type="button"
              onClick={() => setSubmittedData(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Reset
            </button>
            <Form.Submit>Create Account</Form.Submit>
          </Form.Actions>
        </Form>

        {/* Submitted data display */}
        {submittedData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">
              Form submitted successfully!
            </p>
            <pre className="text-xs text-green-700 overflow-x-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}

        {/* Validation hints */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Validation Features:</p>
          <ul className="space-y-1 text-xs">
            <li>• Validates on blur (when leaving field)</li>
            <li>• Validates all fields on submit</li>
            <li>• aria-invalid and aria-describedby for screen readers</li>
            <li>• Error messages announced via role=&quot;alert&quot;</li>
            <li>• Loading state with spinner during submission</li>
            <li>• Built-in validators: required, email, minLength, pattern, match</li>
          </ul>
        </div>
      </div>
    </DemoCard>
  );
}
