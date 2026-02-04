"use client";

import { ToastProvider } from "@/components/ui";
import {
  SkeletonDemo,
  TabsDemo,
  DropdownDemo,
  ModalDemo,
  ToastDemo,
  FormDemo,
  PatternsSection,
} from "@/components/playground";

export default function PlaygroundPage() {
  return (
    <ToastProvider position="bottom-right" maxToasts={3}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Component Playground
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              6 accessible UI primitives built with modern React patterns
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Patterns overview - interactive! */}
          <PatternsSection />

          {/* Component demos grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonDemo />
            <TabsDemo />
            <DropdownDemo />
            <ModalDemo />
            <ToastDemo />
            <FormDemo />
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
            <p className="text-xs text-gray-400 mt-1">
              All components are keyboard accessible and respect user preferences
            </p>
          </footer>
        </main>
      </div>
    </ToastProvider>
  );
}
