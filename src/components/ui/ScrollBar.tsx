"useme"

import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import clsx from "clsx";
import { ReactNode } from "react";

export type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "both";
  scrollHideDelay?: number; // temps avant disparition de la barre
  size?: "sm" | "md" | "lg"; // taille de la barre
};

/**
 * ScrollArea — Standard 2026
 */
export function ScrollArea({
  children,
  className,
  orientation = "vertical",
  scrollHideDelay = 600,
  size = "md",
}: ScrollAreaProps) {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <RadixScrollArea.Root
      type="auto"
      scrollHideDelay={scrollHideDelay}
      className={clsx("relative overflow-hidden", className)}
    >
      <RadixScrollArea.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </RadixScrollArea.Viewport>

      {(orientation === "vertical" || orientation === "both") && (
        <RadixScrollArea.Scrollbar
          orientation="vertical"
          className="flex touch-none select-none transition-colors"
        >
          <RadixScrollArea.Thumb
            className={clsx(
              "flex-1 rounded-full bg-neutral-400 hover:bg-neutral-600 transition-colors",
              sizeClasses[size]
            )}
          />
        </RadixScrollArea.Scrollbar>
      )}

      {(orientation === "horizontal" || orientation === "both") && (
        <RadixScrollArea.Scrollbar
          orientation="horizontal"
          className="flex touch-none select-none transition-colors"
        >
          <RadixScrollArea.Thumb
            className={clsx(
              "flex-1 rounded-full bg-neutral-400 hover:bg-neutral-600 transition-colors",
              sizeClasses[size]
            )}
          />
        </RadixScrollArea.Scrollbar>
      )}

      <RadixScrollArea.Corner className="bg-neutral-200" />
    </RadixScrollArea.Root>
  );
}
// Source: https://www.radix-ui.com/docs/primitives/components/scroll-area