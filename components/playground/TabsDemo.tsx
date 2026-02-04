"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui";
import { DemoCard } from "./DemoCard";

const tabsSource = `// components/ui/Tabs.tsx - Key parts
const TabsContext = createContext<TabsContextValue | null>(null);

function Tabs({ value, defaultValue, onValueChange, children }) {
  const [activeTab, setActiveTab] = useControllable({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, ... }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabsList({ children }) {
  const { tabs, setActiveTab, activeTab } = useTabsContext();

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        // Move to previous tab (wrap around)
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case "ArrowRight":
        // Move to next tab (wrap around)
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
    }
    setActiveTab(tabs[nextIndex]);
    tabElements[nextIndex].focus(); // Move focus with selection
  };

  return (
    <div role="tablist" onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={\`panel-\${value}\`}
      tabIndex={isActive ? 0 : -1}  // Roving tabindex
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" aria-labelledby={\`tab-\${value}\`} tabIndex={0}>
      {children}
    </div>
  );
}`;

export function TabsDemo() {
  const [controlledTab, setControlledTab] = useState("overview");

  return (
    <DemoCard
      title="Tabs"
      description="Keyboard-navigable tabs with roving tabindex. Use Arrow keys, Home, and End."
      sourceFiles={[{ filename: "components/ui/Tabs.tsx", code: tabsSource }]}
    >
      <div className="space-y-8">
        {/* Uncontrolled example */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Uncontrolled (internal state)
          </h3>
          <Tabs defaultValue="tab1" aria-label="Demo tabs">
            <Tabs.List aria-label="Features">
              <Tabs.Tab value="tab1">Overview</Tabs.Tab>
              <Tabs.Tab value="tab2">Features</Tabs.Tab>
              <Tabs.Tab value="tab3">Pricing</Tabs.Tab>
              <Tabs.Tab value="tab4" disabled>
                Coming Soon
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="tab1">
              <p className="text-gray-600">
                Welcome to the overview panel. This tab component uses the
                compound component pattern for flexible composition.
              </p>
            </Tabs.Panel>
            <Tabs.Panel value="tab2">
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Keyboard navigation (Arrow keys)</li>
                <li>Home/End key support</li>
                <li>Roving tabindex</li>
                <li>Proper ARIA attributes</li>
              </ul>
            </Tabs.Panel>
            <Tabs.Panel value="tab3">
              <p className="text-gray-600">
                Check out our flexible pricing options tailored to your needs.
              </p>
            </Tabs.Panel>
            <Tabs.Panel value="tab4">
              <p className="text-gray-600">More features coming soon!</p>
            </Tabs.Panel>
          </Tabs>
        </div>

        {/* Controlled example */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Controlled (external state)
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            Current tab: <code className="bg-gray-100 px-1 rounded">{controlledTab}</code>
          </p>
          <Tabs
            value={controlledTab}
            onValueChange={setControlledTab}
          >
            <Tabs.List aria-label="Account sections">
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
              <Tabs.Tab value="billing">Billing</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview">
              <p className="text-gray-600">
                Your account overview with key metrics and recent activity.
              </p>
            </Tabs.Panel>
            <Tabs.Panel value="settings">
              <p className="text-gray-600">
                Manage your account settings and preferences.
              </p>
            </Tabs.Panel>
            <Tabs.Panel value="billing">
              <p className="text-gray-600">
                View and manage your billing information and invoices.
              </p>
            </Tabs.Panel>
          </Tabs>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setControlledTab("overview")}
              className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
            >
              Go to Overview
            </button>
            <button
              onClick={() => setControlledTab("billing")}
              className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
            >
              Go to Billing
            </button>
          </div>
        </div>
      </div>
    </DemoCard>
  );
}
