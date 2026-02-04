"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type DemoCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

/**
 * Wrapper card for each component demo.
 */
export function DemoCard({
  title,
  description,
  children,
  className,
}: DemoCardProps) {
  return (
    <section
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden",
        className
      )}
    >
      <header className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}
