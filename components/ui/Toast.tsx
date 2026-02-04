"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks";

// ============================================================================
// Types
// ============================================================================

type ToastType = "info" | "success" | "warning" | "error";

type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
};

type ToastOptions = Omit<Toast, "id">;

type ToastContextValue = {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  position: ToastPosition;
};

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

type ToastProviderProps = {
  children: ReactNode;
  /** Position of toast container */
  position?: ToastPosition;
  /** Maximum number of visible toasts */
  maxToasts?: number;
  /** Default duration in ms (0 = no auto-dismiss) */
  defaultDuration?: number;
};

/**
 * Toast provider. Wrap your app to enable toast notifications.
 */
export function ToastProvider({
  children,
  position = "bottom-right",
  maxToasts = 3,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback(
    (options: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: Toast = {
        ...options,
        id,
        duration: options.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        // Remove oldest if at max capacity
        const updated = prev.length >= maxToasts ? prev.slice(1) : prev;
        return [...updated, toast];
      });

      return id;
    },
    [defaultDuration, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, position }}>
      {children}
      {mounted && <ToastContainer />}
    </ToastContext.Provider>
  );
}

// ============================================================================
// Container
// ============================================================================

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
};

function ToastContainer() {
  const { toasts, position } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 w-full max-w-sm",
        positionClasses[position]
      )}
      role="region"
      aria-label="Notifications"
    >
      {/* Live region for screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {toasts.length > 0 && `${toasts[toasts.length - 1].title}`}
      </div>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
}

// ============================================================================
// Toast Item
// ============================================================================

const typeStyles: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "ℹ",
    iconColor: "text-blue-500",
  },
  success: {
    bg: "bg-green-50 border-green-200",
    icon: "✓",
    iconColor: "text-green-500",
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-200",
    icon: "⚠",
    iconColor: "text-yellow-500",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "✕",
    iconColor: "text-red-500",
  },
};

type ToastItemProps = {
  toast: Toast;
};

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast, position } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const { bg, icon, iconColor } = typeStyles[toast.type];
  const isTop = position.startsWith("top");

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [toast.duration, toast.id]);

  const handleClose = () => {
    if (prefersReducedMotion) {
      removeToast(toast.id);
    } else {
      setIsExiting(true);
      setTimeout(() => {
        removeToast(toast.id);
      }, 200);
    }
  };

  // Pause auto-dismiss on hover
  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(handleClose, 1000);
    }
  };

  return (
    <div
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
        bg,
        !prefersReducedMotion && [
          isExiting
            ? isTop
              ? "animate-fade-out"
              : "animate-slide-out"
            : isTop
            ? "animate-fade-in"
            : "animate-slide-in",
        ]
      )}
    >
      <span className={cn("text-lg flex-shrink-0", iconColor)} aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleClose}
        className={cn(
          "flex-shrink-0 p-1 rounded text-gray-400",
          "hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        )}
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// Convenience hooks
// ============================================================================

/**
 * Convenience hook with pre-configured toast methods.
 */
export function useToastActions() {
  const { addToast } = useToast();

  return {
    info: (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
    success: (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
  };
}
