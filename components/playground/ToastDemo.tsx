"use client";

import { useToastActions } from "@/components/ui";
import { DemoCard } from "./DemoCard";

export function ToastDemo() {
  const toast = useToastActions();

  return (
    <DemoCard
      title="Toast"
      description="Notification system with queue management. Max 3 visible, auto-dismiss, and accessible announcements."
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
