"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/hooks";

// ============================================================================
// Context
// ============================================================================

type DropdownContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  items: string[];
  registerItem: (label: string) => number;
  triggerId: string;
  menuId: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown provider");
  }
  return context;
}

// ============================================================================
// Dropdown Root
// ============================================================================

type DropdownProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Dropdown root component. Provides context and handles click-outside.
 */
function Dropdown({ children, className }: DropdownProps) {
  const baseId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemsRef = useRef<string[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
  }, isOpen);

  const registerItem = useCallback((label: string) => {
    const index = itemsRef.current.indexOf(label);
    if (index === -1) {
      itemsRef.current.push(label);
      return itemsRef.current.length - 1;
    }
    return index;
  }, []);

  // Reset active index when closed
  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        setIsOpen,
        activeIndex,
        setActiveIndex,
        items: itemsRef.current,
        registerItem,
        triggerId: `${baseId}-trigger`,
        menuId: `${baseId}-menu`,
        triggerRef,
      }}
    >
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// ============================================================================
// Dropdown Trigger
// ============================================================================

type DropdownTriggerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Button that toggles the dropdown menu.
 */
function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { isOpen, setIsOpen, triggerId, menuId, triggerRef, setActiveIndex, items } =
    useDropdownContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex(0);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(items.length - 1);
        } else {
          setActiveIndex(items.length - 1);
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
    }
  };

  return (
    <button
      ref={triggerRef}
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2",
        "text-sm font-medium rounded-md",
        "bg-white border border-gray-300 shadow-sm",
        "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
    >
      {children}
      <svg
        className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// ============================================================================
// Dropdown Menu
// ============================================================================

type DropdownMenuProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Container for dropdown items.
 * Handles keyboard navigation within the menu.
 */
function DropdownMenu({ children, className }: DropdownMenuProps) {
  const {
    isOpen,
    setIsOpen,
    menuId,
    triggerId,
    activeIndex,
    setActiveIndex,
    items,
    triggerRef,
  } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchStringRef = useRef("");

  // Focus management: focus first item when menu opens
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && menuRef.current) {
      const itemElements = menuRef.current.querySelectorAll('[role="menuitem"]');
      (itemElements[activeIndex] as HTMLElement)?.focus();
    }
  }, [isOpen, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex(activeIndex < items.length - 1 ? activeIndex + 1 : 0);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(activeIndex > 0 ? activeIndex - 1 : items.length - 1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        // Close menu on tab and let focus move naturally
        setIsOpen(false);
        break;
      default:
        // Typeahead: jump to item starting with typed character
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          clearTimeout(searchTimeoutRef.current);
          searchStringRef.current += event.key.toLowerCase();

          const matchIndex = items.findIndex((item) =>
            item.toLowerCase().startsWith(searchStringRef.current)
          );

          if (matchIndex !== -1) {
            setActiveIndex(matchIndex);
          }

          searchTimeoutRef.current = setTimeout(() => {
            searchStringRef.current = "";
          }, 500);
        }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute z-50 mt-1 min-w-[160px] py-1",
        "bg-white rounded-md shadow-lg border border-gray-200",
        "animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Dropdown Item
// ============================================================================

type DropdownItemProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Individual menu item.
 * Can be clicked or activated via keyboard.
 */
function DropdownItem({
  children,
  onClick,
  disabled = false,
  className,
}: DropdownItemProps) {
  const { setIsOpen, registerItem, activeIndex, setActiveIndex, triggerRef } =
    useDropdownContext();
  const itemRef = useRef<HTMLButtonElement>(null);

  // Register this item and get its index
  const label = typeof children === "string" ? children : "";
  const itemIndex = registerItem(label);
  const isActive = activeIndex === itemIndex;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={itemRef}
      role="menuitem"
      type="button"
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setActiveIndex(itemIndex)}
      className={cn(
        "w-full px-4 py-2 text-left text-sm",
        "focus:outline-none",
        isActive && "bg-gray-100",
        disabled
          ? "text-gray-400 cursor-not-allowed"
          : "text-gray-700 hover:bg-gray-100",
        className
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Dropdown Separator
// ============================================================================

function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn("my-1 h-px bg-gray-200", className)}
    />
  );
}

// ============================================================================
// Export
// ============================================================================

const DropdownComponent = Object.assign(Dropdown, {
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
  Separator: DropdownSeparator,
});

export { DropdownComponent as Dropdown };
