import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      {
        "border-transparent bg-blue-500 text-white hover:bg-blue-600": variant === "default",
        "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
        "border-transparent bg-red-500 text-white hover:bg-red-600": variant === "destructive",
        "border-gray-200 bg-transparent text-gray-900 hover:bg-gray-100": variant === "outline",
      },
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge }
