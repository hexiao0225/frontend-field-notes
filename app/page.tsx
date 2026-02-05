"use client";

import { ToastProvider, ThemeProvider, ThemeToggle } from "@/components/ui";
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
    <ThemeProvider defaultTheme="system">
      <ToastProvider position="bottom-right" maxToasts={3}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Component Playground
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    6 accessible UI primitives built with modern React patterns
                  </p>
                </div>
                <ThemeToggle />
              </div>
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
            <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Built with Next.js, TypeScript, and Tailwind CSS
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                All components are keyboard accessible and respect user preferences
              </p>
            </footer>
          </main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
