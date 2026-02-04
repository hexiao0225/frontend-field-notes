"use client";

import { useToastActions } from "@/components/ui";
import { DemoCard } from "./DemoCard";

const toastSource = `// components/ui/Toast.tsx - Key parts
import { createPortal } from "react-dom";

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastProvider({ children, position = "bottom-right", maxToasts = 3 }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options) => {
    const id = generateUniqueId();
    const toast = { ...options, id, duration: options.duration ?? 5000 };

    setToasts((prev) => {
      // Remove oldest if at max capacity (FIFO)
      const updated = prev.length >= maxToasts ? prev.slice(1) : prev;
      return [...updated, toast];
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, position }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, position } = useToast();

  return createPortal(
    <div className={\`fixed \${positionClasses[position]} z-50\`}>
      {/* Screen reader live region */}
      <div className="sr-only" role="status" aria-live="polite">
        {toasts[toasts.length - 1]?.title}
      </div>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast }) {
  const { removeToast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef();

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration > 0) {
      timerRef.current = setTimeout(() => removeToast(toast.id), toast.duration);
      return () => clearTimeout(timerRef.current);
    }
  }, [toast.duration, toast.id]);

  // Pause on hover
  const handleMouseEnter = () => clearTimeout(timerRef.current);
  const handleMouseLeave = () => {
    if (toast.duration > 0) {
      timerRef.current = setTimeout(() => removeToast(toast.id), 1000);
    }
  };

  return (
    <div
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "p-4 rounded-lg shadow-lg",
        !prefersReducedMotion && "animate-slide-in"
      )}
    >
      <span>{toast.title}</span>
      {toast.description && <p>{toast.description}</p>}
      <button onClick={() => removeToast(toast.id)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

// Convenience hook
function useToastActions() {
  const { addToast } = useToast();
  return {
    info: (title, description) => addToast({ type: "info", title, description }),
    success: (title, description) => addToast({ type: "success", title, description }),
    warning: (title, description) => addToast({ type: "warning", title, description }),
    error: (title, description) => addToast({ type: "error", title, description }),
  };
}`;

export function ToastDemo() {
  const toast = useToastActions();

  return (
    <DemoCard
      title="Toast"
      description="Notification system with queue management. Max 3 visible, auto-dismiss, and accessible announcements."
      sourceFiles={[{ filename: "components/ui/Toast.tsx", code: toastSource }]}
    >
      <div className="space-y-6">
        {/* Toast types */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Toast Types</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                toast.info("Information", "This is an informational message.")
              }
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              Info
            </button>
            <button
              onClick={() =>
                toast.success("Success!", "Your changes have been saved.")
              }
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            >
              Success
            </button>
            <button
              onClick={() =>
                toast.warning("Warning", "Please review before continuing.")
              }
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
            >
              Warning
            </button>
            <button
              onClick={() =>
                toast.error("Error", "Something went wrong. Please try again.")
              }
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Error
            </button>
          </div>
        </div>

        {/* Queue demo */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Queue Behavior</h3>
          <p className="text-xs text-gray-500 mb-2">
            Click rapidly to see queue limiting (max 3 visible)
          </p>
          <button
            onClick={() => {
              for (let i = 1; i <= 5; i++) {
                setTimeout(() => {
                  toast.info(`Toast ${i}`, `This is toast number ${i}`);
                }, i * 200);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          >
            Trigger 5 Toasts
          </button>
        </div>

        {/* Features */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Features:</p>
          <ul className="space-y-1 text-xs">
            <li>• Auto-dismiss after 5 seconds (configurable)</li>
            <li>• Hover to pause auto-dismiss timer</li>
            <li>• Queue management with max visible limit</li>
            <li>• Screen reader announcements via aria-live</li>
            <li>• Respects reduced motion preferences</li>
            <li>• Click X or wait to dismiss</li>
          </ul>
        </div>
      </div>
    </DemoCard>
  );
}
