"use client";

import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks";

type SkeletonProps = {
  className?: string;
  /** Width of the skeleton. Can be any valid CSS value. */
  width?: string | number;
  /** Height of the skeleton. Can be any valid CSS value. */
  height?: string | number;
};

/**
 * Base Skeleton component with pulse animation.
 * Use for custom shapes or as building block.
 */
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
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

type SkeletonTextProps = {
  /** Number of text lines to render */
  lines?: number;
  /** Width of the last line (for realistic paragraph appearance) */
  lastLineWidth?: string;
  className?: string;
};

/**
 * Skeleton for text content.
 * Renders multiple lines with the last line shorter for realism.
 */
function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className,
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
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

type SkeletonCircleProps = {
  /** Diameter of the circle in pixels */
  size?: number;
  className?: string;
};

/**
 * Skeleton for avatars and circular elements.
 */
function SkeletonCircle({ size = 40, className }: SkeletonCircleProps) {
  return (
    <Skeleton
      width={size}
      height={size}
      className={cn("rounded-full", className)}
    />
  );
}

type SkeletonCardProps = {
  /** Show avatar placeholder */
  hasAvatar?: boolean;
  /** Number of text lines */
  lines?: number;
  className?: string;
};

/**
 * Skeleton for card-like content with optional avatar.
 * Common pattern for list items and cards.
 */
function SkeletonCard({
  hasAvatar = true,
  lines = 2,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn("flex items-start gap-3 p-4", className)}
      aria-hidden="true"
    >
      {hasAvatar && <SkeletonCircle size={40} />}
      <div className="flex-1 space-y-2">
        <Skeleton height={16} className="w-3/4" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <Skeleton
            key={i}
            height={14}
            className={i === lines - 2 ? "w-1/2" : "w-full"}
          />
        ))}
      </div>
    </div>
  );
}

// Extend base component with subcomponents
const SkeletonComponent = Object.assign(Skeleton, {
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Card: SkeletonCard,
});

export { SkeletonComponent as Skeleton };
