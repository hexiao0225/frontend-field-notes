"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  KeyboardEvent,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { useControllable } from "@/hooks";

// ============================================================================
// Context
// ============================================================================

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  baseId: string;
  registerTab: (value: string) => void;
  tabs: string[];
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// ============================================================================
// Tabs Root
// ============================================================================

type TabsProps = {
  /** Controlled active tab value */
  value?: string;
  /** Default tab for uncontrolled mode (required if value is not provided) */
  defaultValue?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
};

/**
 * Tabs root component. Provides context for all child components.
 * Supports both controlled and uncontrolled modes.
 */
function Tabs({
  value,
  defaultValue = "",
  onValueChange,
  children,
  className,
}: TabsProps) {
  const baseId = useId();
  const tabsRef = useRef<string[]>([]);

  const [activeTab, setActiveTab] = useControllable({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const registerTab = (tabValue: string) => {
    if (!tabsRef.current.includes(tabValue)) {
      tabsRef.current.push(tabValue);
    }
  };

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        baseId,
        registerTab,
        tabs: tabsRef.current,
      }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// Tabs List
// ============================================================================

type TabsListProps = {
  children: ReactNode;
  className?: string;
  /** Accessible label for the tablist */
  "aria-label"?: string;
};

/**
 * Container for tab buttons.
 * Handles keyboard navigation (arrow keys, Home, End).
 */
function TabsList({
  children,
  className,
  "aria-label": ariaLabel,
}: TabsListProps) {
  const { tabs, setActiveTab, activeTab } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowLeft":
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case "ArrowRight":
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      setActiveTab(tabs[nextIndex]);
      // Focus the newly active tab
      const tabElements = listRef.current?.querySelectorAll('[role="tab"]');
      (tabElements?.[nextIndex] as HTMLElement)?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex border-b border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Tab Button
// ============================================================================

type TabProps = {
  /** Unique value for this tab */
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

/**
 * Individual tab button.
 * Uses roving tabindex for keyboard navigation.
 */
function Tab({ value, children, className, disabled = false }: TabProps) {
  const { activeTab, setActiveTab, baseId, registerTab } = useTabsContext();
  const isActive = activeTab === value;

  // Register this tab on mount
  registerTab(value);

  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      id={tabId}
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        "border-b-2 -mb-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800",
        isActive
          ? "border-blue-500 text-blue-600 dark:text-blue-400"
          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Tab Panel
// ============================================================================

type TabPanelProps = {
  /** Must match the corresponding Tab value */
  value: string;
  children: ReactNode;
  className?: string;
};

/**
 * Content panel for a tab.
 * Only renders when its tab is active.
 */
function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeTab, baseId } = useTabsContext();
  const isActive = activeTab === value;

  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isActive) return null;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn("p-4 focus:outline-none", className)}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

const TabsComponent = Object.assign(Tabs, {
  List: TabsList,
  Tab: Tab,
  Panel: TabPanel,
});

export { TabsComponent as Tabs };
