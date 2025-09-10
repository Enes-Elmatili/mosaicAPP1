import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to combine Tailwind classes with conditional logic.
 * Example: cn("px-4", isActive && "bg-black")
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
