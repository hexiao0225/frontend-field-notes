"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui";
import { DemoCard } from "./DemoCard";

export function DropdownDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (item: string) => {
    setSelected(item);
  };

  return (
    <DemoCard
      title="Dropdown"
      description="Menu with click-outside, keyboard navigation, and typeahead. Try Arrow keys and typing to search."
    >
      <div className="space-y-6">
        {/* Basic dropdown */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Basic Menu</h3>
          <div className="flex items-center gap-4">
            <Dropdown>
              <Dropdown.Trigger>Options</Dropdown.Trigger>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleSelect("Edit")}>
                  Edit
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelect("Duplicate")}>
                  Duplicate
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item onClick={() => handleSelect("Archive")}>
                  Archive
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelect("Delete")} disabled>
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {selected && (
              <span className="text-sm text-gray-500">
                Selected: <code className="bg-gray-100 px-1 rounded">{selected}</code>
              </span>
            )}
          </div>
        </div>

        {/* Account dropdown */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Account Menu</h3>
          <Dropdown>
            <Dropdown.Trigger className="gap-3">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                JD
              </span>
              <span>John Doe</span>
            </Dropdown.Trigger>
            <Dropdown.Menu className="w-48">
              <Dropdown.Item onClick={() => handleSelect("Profile")}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSelect("Settings")}>
                Settings
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSelect("Keyboard shortcuts")}>
                Keyboard shortcuts
              </Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item onClick={() => handleSelect("Help")}>
                Help & Support
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSelect("Sign out")}>
                Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Keyboard hints */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Keyboard Navigation:</p>
          <ul className="space-y-1 text-xs">
            <li>
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">↓</kbd>{" "}
              Navigate items
            </li>
            <li>
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Enter</kbd>{" "}
              Select item
            </li>
            <li>
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Esc</kbd>{" "}
              Close menu
            </li>
            <li>
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Home</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">End</kbd>{" "}
              Jump to first/last
            </li>
            <li>
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">A-Z</kbd>{" "}
              Typeahead search
            </li>
          </ul>
        </div>
      </div>
    </DemoCard>
  );
}
