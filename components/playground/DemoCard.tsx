"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Tabs, CodeBlock } from "@/components/ui";

type SourceFile = {
  filename: string;
  code: string;
};

type DemoCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  /** Source code files to display in the Source tab */
  sourceFiles?: SourceFile[];
  className?: string;
};

/**
 * Wrapper card for each component demo.
 * When sourceFiles is provided, shows Demo/Source tabs.
 */
export function DemoCard({
  title,
  description,
  children,
  sourceFiles,
  className,
}: DemoCardProps) {
  const hasSource = sourceFiles && sourceFiles.length > 0;

  return (
    <section
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors",
        className
      )}
    >
      <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </header>

      {hasSource ? (
        <Tabs defaultValue="demo">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <Tabs.List className="px-6 border-b-0" aria-label="Demo or Source view">
              <Tabs.Tab value="demo">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Demo
                </span>
              </Tabs.Tab>
              <Tabs.Tab value="source">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Source
                </span>
              </Tabs.Tab>
            </Tabs.List>
          </div>
          <Tabs.Panel value="demo" className="p-6">
            {children}
          </Tabs.Panel>
          <Tabs.Panel value="source" className="p-4 bg-gray-900">
            <div className="space-y-4">
              {sourceFiles.map((file, index) => (
                <CodeBlock
                  key={index}
                  code={file.code}
                  filename={file.filename}
                  language="tsx"
                  maxHeight="350px"
                />
              ))}
            </div>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <div className="p-6">{children}</div>
      )}
    </section>
  );
}
