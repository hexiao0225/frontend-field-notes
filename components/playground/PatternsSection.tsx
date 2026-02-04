"use client";

import { useState } from "react";
import { Modal, CodeBlock } from "@/components/ui";

type Pattern = {
  name: string;
  description: string;
  why: string;
  example: {
    file: string;
    code: string;
  };
};

const patterns: Pattern[] = [
  {
    name: "Compound Components",
    description:
      "A pattern where a parent component shares state with its children through Context, allowing flexible composition without prop drilling.",
    why: "Consumers get an intuitive API like <Tabs.Tab> instead of passing complex config objects. Each subcomponent handles its own rendering while sharing state.",
    example: {
      file: "components/ui/Tabs.tsx",
      code: `// Parent provides context
function Tabs({ children, ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

// Children consume context
function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

// Usage - clean, composable API
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">First</Tabs.Tab>
    <Tabs.Tab value="tab2">Second</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>`,
    },
  },
  {
    name: "Context for State",
    description:
      "Using React Context to share state between components without passing props through every level of the tree.",
    why: "Avoids 'prop drilling' where you'd need to pass state through many intermediate components. Essential for compound components and global state like toasts.",
    example: {
      file: "components/ui/Toast.tsx",
      code: `// Create typed context
const ToastContext = createContext<ToastContextValue | null>(null);

// Provider manages state
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options) => {
    const id = generateId();
    setToasts(prev => [...prev, { ...options, id }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <ToastContainer /> {/* Renders all toasts */}
    </ToastContext.Provider>
  );
}

// Hook for consuming - with safety check
function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be within ToastProvider");
  }
  return context;
}`,
    },
  },
  {
    name: "Controlled/Uncontrolled",
    description:
      "Supporting both controlled mode (parent owns state) and uncontrolled mode (component owns state) with a single API.",
    why: "Flexibility for consumers. Simple use cases can use uncontrolled (just works), while complex integrations can control state externally.",
    example: {
      file: "hooks/useControllable.ts",
      code: `function useControllable<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Controlled if value prop is provided
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback((next) => {
    // Only update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(next);
    }
    // Always notify parent
    onChange?.(next);
  }, [isControlled, onChange]);

  return [value, setValue];
}

// Usage in Tabs
const [activeTab, setActiveTab] = useControllable({
  value: props.value,        // controlled
  defaultValue: props.defaultValue,  // uncontrolled
  onChange: props.onValueChange,
});`,
    },
  },
  {
    name: "Custom Hooks",
    description:
      "Extracting reusable stateful logic into functions that can be shared across components.",
    why: "DRY principle for behavior. useClickOutside is used by Dropdown, useFocusTrap by Modal. Logic is tested once, used everywhere.",
    example: {
      file: "hooks/useClickOutside.ts",
      code: `function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    // mousedown fires before focus changes
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}

// Usage in Dropdown
const containerRef = useClickOutside(() => {
  setIsOpen(false);
}, isOpen);`,
    },
  },
  {
    name: "Portal Rendering",
    description:
      "Rendering components outside the DOM hierarchy using React's createPortal, typically at document.body.",
    why: "Escapes parent CSS constraints (overflow: hidden, z-index stacking contexts). Modals and toasts render at the root to avoid clipping.",
    example: {
      file: "components/ui/Modal.tsx",
      code: `import { createPortal } from "react-dom";

function ModalPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // SSR safety
  }, []);

  if (!mounted) return null;

  // Render children at document.body
  return createPortal(children, document.body);
}

// Usage in ModalContent
function ModalContent({ children }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50" /> {/* Overlay */}
      <div role="dialog" aria-modal="true">
        {children}
      </div>
    </ModalPortal>
  );
}`,
    },
  },
  {
    name: "Focus Management",
    description:
      "Programmatically controlling keyboard focus for accessibility. Includes focus trapping (keeping focus inside a container) and focus restoration.",
    why: "Screen reader and keyboard users must be able to navigate modals without focus escaping. When closed, focus should return to the trigger.",
    example: {
      file: "hooks/useFocusTrap.ts",
      code: `function useFocusTrap(enabled: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled) return;

    // Remember what was focused before
    previousActiveElement.current = document.activeElement;

    // Focus first focusable element
    const focusables = containerRef.current
      ?.querySelectorAll(FOCUSABLE_SELECTORS);
    focusables?.[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      // Wrap focus at boundaries
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus on cleanup
      previousActiveElement.current?.focus();
    };
  }, [enabled]);

  return containerRef;
}`,
    },
  },
  {
    name: "ARIA Attributes",
    description:
      "Accessible Rich Internet Applications attributes that communicate state, relationships, and roles to assistive technologies.",
    why: "Screen readers can't see visual cues. ARIA tells them 'this tab is selected', 'this controls that panel', 'this dialog is modal'.",
    example: {
      file: "components/ui/Tabs.tsx",
      code: `// Tab button - communicates state and relationships
<button
  role="tab"
  id="tab-1"
  aria-selected={isActive}      // "Is this the active tab?"
  aria-controls="panel-1"       // "I control this panel"
  tabIndex={isActive ? 0 : -1}  // Roving tabindex
>
  {children}
</button>

// Tab panel - linked back to its tab
<div
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"  // "Tab 1 is my label"
  tabIndex={0}             // Focusable for keyboard users
>
  {content}
</div>

// Modal - announces as modal dialog
<div
  role="dialog"
  aria-modal="true"           // "Focus is trapped here"
  aria-labelledby={titleId}   // "My title is..."
  aria-describedby={descId}   // "My description is..."
>`,
    },
  },
  {
    name: "Reduced Motion",
    description:
      "Respecting the user's OS preference for reduced motion, typically by disabling or simplifying animations.",
    why: "Vestibular disorders, motion sensitivity, or user preference. Some people get dizzy or nauseous from animations.",
    example: {
      file: "hooks/useReducedMotion.ts",
      code: `function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    setPrefersReducedMotion(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setPrefersReducedMotion(e.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// Usage - conditionally apply animation
const prefersReducedMotion = useReducedMotion();

<div className={cn(
  "transition-transform",
  !prefersReducedMotion && "animate-slide-in"
)}>

// Also in CSS (globals.css)
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`,
    },
  },
];

export function PatternsSection() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  return (
    <>
      <section className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Patterns Used{" "}
          <span className="font-normal text-gray-500">(click to learn)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {patterns.map((pattern) => (
            <button
              key={pattern.name}
              onClick={() => setSelectedPattern(pattern)}
              className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {pattern.name}
            </button>
          ))}
        </div>
      </section>

      {/* Pattern Detail Modal */}
      <Modal
        open={selectedPattern !== null}
        onOpenChange={(open) => !open && setSelectedPattern(null)}
      >
        <Modal.Content className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <Modal.Close />
          <Modal.Title>{selectedPattern?.name}</Modal.Title>
          <Modal.Description>{selectedPattern?.description}</Modal.Description>

          <div className="mt-4 flex-1 overflow-y-auto space-y-4">
            {/* Why section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Why use it?
              </h3>
              <p className="text-sm text-gray-600">{selectedPattern?.why}</p>
            </div>

            {/* Code example */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Example from this project
              </h3>
              {selectedPattern && (
                <CodeBlock
                  code={selectedPattern.example.code}
                  filename={selectedPattern.example.file}
                  language="tsx"
                  maxHeight="300px"
                />
              )}
            </div>
          </div>

          <Modal.Footer>
            <button
              onClick={() => setSelectedPattern(null)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Got it
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
}
