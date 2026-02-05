"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/hooks";

// ============================================================================
// Context
// ============================================================================

type ModalContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
};

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within a Modal provider");
  }
  return context;
}

// ============================================================================
// Modal Root
// ============================================================================

type ModalProps = {
  /** Controlled open state */
  open?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

/**
 * Modal root component. Provides context for child components.
 * Can be controlled or uncontrolled.
 */
function Modal({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: ModalProps) {
  const baseId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange]
  );

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        setIsOpen,
        titleId: `${baseId}-title`,
        descriptionId: `${baseId}-description`,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

// ============================================================================
// Modal Trigger
// ============================================================================

type ModalTriggerProps = {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
  onClick?: () => void;
};

/**
 * Button that opens the modal.
 * Use asChild to render your own trigger element.
 */
function ModalTrigger({ children, className, asChild, onClick }: ModalTriggerProps) {
  const { setIsOpen } = useModalContext();

  const handleClick = () => {
    setIsOpen(true);
    onClick?.();
  };

  if (asChild) {
    // Clone element and add onClick
    // For simplicity, we'll just wrap in a span
    return (
      <span onClick={handleClick} className={className}>
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2",
        "text-sm font-medium rounded-md",
        "bg-blue-600 text-white",
        "hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Modal Portal
// ============================================================================

type ModalPortalProps = {
  children: ReactNode;
};

/**
 * Portal wrapper for modal content.
 * Renders children at the end of document.body.
 */
function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

// ============================================================================
// Modal Overlay
// ============================================================================

type ModalOverlayProps = {
  className?: string;
};

/**
 * Semi-transparent backdrop behind the modal.
 * Clicking closes the modal.
 */
function ModalOverlay({ className }: ModalOverlayProps) {
  const { setIsOpen } = useModalContext();

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 z-50",
        "animate-overlay-show",
        className
      )}
      onClick={() => setIsOpen(false)}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Modal Content
// ============================================================================

type ModalContentProps = {
  children: ReactNode;
  className?: string;
  /** Called when the user tries to close (Escape key or overlay click) */
  onCloseAutoFocus?: () => void;
};

/**
 * The modal dialog content.
 * Handles focus trap, Escape key, and ARIA attributes.
 */
function ModalContent({
  children,
  className,
  onCloseAutoFocus,
}: ModalContentProps) {
  const { isOpen, setIsOpen, titleId, descriptionId } = useModalContext();
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        onCloseAutoFocus?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen, onCloseAutoFocus]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <ModalOverlay />
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "fixed left-1/2 top-1/2 z-50",
          "w-full max-w-lg max-h-[85vh] overflow-auto",
          "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6",
          "-translate-x-1/2 -translate-y-1/2",
          "animate-content-show",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </ModalPortal>
  );
}

// ============================================================================
// Modal Header Parts
// ============================================================================

type ModalTitleProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Modal title. Linked via aria-labelledby.
 */
function ModalTitle({ children, className }: ModalTitleProps) {
  const { titleId } = useModalContext();

  return (
    <h2
      id={titleId}
      className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}
    >
      {children}
    </h2>
  );
}

type ModalDescriptionProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Modal description. Linked via aria-describedby.
 */
function ModalDescription({ children, className }: ModalDescriptionProps) {
  const { descriptionId } = useModalContext();

  return (
    <p
      id={descriptionId}
      className={cn("mt-2 text-sm text-gray-500 dark:text-gray-400", className)}
    >
      {children}
    </p>
  );
}

// ============================================================================
// Modal Close
// ============================================================================

type ModalCloseProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Close button for the modal.
 * Renders an X icon by default.
 */
function ModalClose({ children, className }: ModalCloseProps) {
  const { setIsOpen } = useModalContext();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(false)}
      className={cn(
        "absolute right-4 top-4",
        "p-1 rounded-sm text-gray-400 dark:text-gray-500",
        "hover:text-gray-500 dark:hover:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
      aria-label="Close"
    >
      {children || (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
    </button>
  );
}

// ============================================================================
// Modal Footer
// ============================================================================

type ModalFooterProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Footer area for modal actions (buttons).
 */
function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "mt-6 flex justify-end gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

const ModalComponent = Object.assign(Modal, {
  Trigger: ModalTrigger,
  Content: ModalContent,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
  Footer: ModalFooter,
});

export { ModalComponent as Modal };
