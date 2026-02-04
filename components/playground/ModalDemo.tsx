"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { DemoCard } from "./DemoCard";

export function ModalDemo() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <DemoCard
      title="Modal"
      description="Dialog with focus trap, Escape key handling, and proper ARIA. Focus is trapped and restored on close."
    >
      <div className="space-y-6">
        {/* Basic modal */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Basic Modal</h3>
          <Modal>
            <Modal.Trigger>Open Modal</Modal.Trigger>
            <Modal.Content>
              <Modal.Close />
              <Modal.Title>Welcome to the Modal</Modal.Title>
              <Modal.Description>
                This modal demonstrates focus trapping. Try pressing Tab to
                cycle through focusable elements - focus stays within the modal.
              </Modal.Description>
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-600">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Esc</kbd> to
                  close, or click the overlay.
                </p>
                <input
                  type="text"
                  placeholder="Try focusing here..."
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Modal.Footer>
                <Modal.Trigger className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Cancel
                </Modal.Trigger>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Continue
                </button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        </div>

        {/* Controlled confirmation modal */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Controlled Confirmation Dialog
          </h3>
          <div className="flex items-center gap-4">
            <Modal open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <Modal.Trigger
                onClick={() => setIsConfirmOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Item
              </Modal.Trigger>
              <Modal.Content className="max-w-md">
                <Modal.Title>Are you sure?</Modal.Title>
                <Modal.Description>
                  This action cannot be undone. This will permanently delete the
                  item and remove all associated data.
                </Modal.Description>
                <Modal.Footer>
                  <button
                    onClick={() => {
                      setIsConfirmOpen(false);
                      setResult("Cancelled");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsConfirmOpen(false);
                      setResult("Deleted");
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
            {result && (
              <span className="text-sm text-gray-500">
                Result: <code className="bg-gray-100 px-1 rounded">{result}</code>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable modal */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Scrollable Content</h3>
          <Modal>
            <Modal.Trigger className="bg-gray-600 hover:bg-gray-700">
              Open Long Content
            </Modal.Trigger>
            <Modal.Content>
              <Modal.Close />
              <Modal.Title>Terms of Service</Modal.Title>
              <div className="mt-4 max-h-60 overflow-y-auto pr-2 text-sm text-gray-600 space-y-4">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur.
                </p>
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum.
                </p>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium.
                </p>
                <p>
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
                  odit aut fugit, sed quia consequuntur magni dolores.
                </p>
              </div>
              <Modal.Footer>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  I Agree
                </button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        </div>
      </div>
    </DemoCard>
  );
}
