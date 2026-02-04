"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui";
import { DemoCard } from "./DemoCard";

const skeletonSource = `// components/ui/Skeleton.tsx
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks";

type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
};

function Skeleton({ className, width, height }: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-gray-200 rounded",
        !prefersReducedMotion && "animate-pulse",
        className
      )}
      style={{
        width: typeof width === "number" ? \`\${width}px\` : width,
        height: typeof height === "number" ? \`\${height}px\` : height,
      }}
    />
  );
}

// Compound components for common patterns
function SkeletonText({ lines = 3, lastLineWidth = "60%" }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
}

function SkeletonCircle({ size = 40 }) {
  return <Skeleton width={size} height={size} className="rounded-full" />;
}

function SkeletonCard({ hasAvatar = true, lines = 2 }) {
  return (
    <div className="flex items-start gap-3 p-4" aria-hidden="true">
      {hasAvatar && <SkeletonCircle size={40} />}
      <div className="flex-1 space-y-2">
        <Skeleton height={16} className="w-3/4" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <Skeleton key={i} height={14} className="w-1/2" />
        ))}
      </div>
    </div>
  );
}

export const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Card: SkeletonCard,
});`;

export function SkeletonDemo() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <DemoCard
      title="Skeleton"
      description="Loading placeholders with pulse animation. Respects reduced motion preferences."
      sourceFiles={[{ filename: "components/ui/Skeleton.tsx", code: skeletonSource }]}
    >
      <div className="space-y-6">
        {/* Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Toggle Loading
          </button>
          <span className="text-sm text-gray-500">
            {isLoading ? "Loading..." : "Loaded"}
          </span>
        </div>

        {/* Shape variants */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Shape Variants</h3>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <>
                <Skeleton width={80} height={80} className="rounded-lg" />
                <Skeleton.Circle size={60} />
                <Skeleton width={120} height={32} className="rounded-full" />
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">
                  Image
                </div>
                <div className="w-15 h-15 w-[60px] h-[60px] bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs">
                  Avatar
                </div>
                <div className="px-4 py-2 bg-purple-100 rounded-full text-purple-600 text-xs">
                  Badge
                </div>
              </>
            )}
          </div>
        </div>

        {/* Text skeleton */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Text Content</h3>
          {isLoading ? (
            <Skeleton.Text lines={3} lastLineWidth="40%" />
          ) : (
            <p className="text-sm text-gray-600">
              This is some loaded content. The skeleton loader shows a pulsing
              placeholder while content is being fetched. It respects the
              user&apos;s reduced motion preferences.
            </p>
          )}
        </div>

        {/* Card skeleton */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Card Layout</h3>
          <div className="border rounded-lg">
            {isLoading ? (
              <Skeleton.Card hasAvatar lines={3} />
            ) : (
              <div className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                  JD
                </div>
                <div>
                  <p className="font-medium text-gray-900">Jane Doe</p>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                  <p className="text-sm text-gray-400 mt-1">Active 2 hours ago</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DemoCard>
  );
}
