import * as React from "react"
import { cn } from "@/lib/utils"

interface MultiRadioGroupProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
  className?: string
  children: React.ReactNode
}

interface MultiRadioItemProps {
  value: string
  id: string
  className?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const MultiRadioGroup = React.forwardRef<
  HTMLDivElement,
  MultiRadioGroupProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
})
MultiRadioGroup.displayName = "MultiRadioGroup"

const MultiRadioItem = React.forwardRef<
  HTMLButtonElement,
  MultiRadioItemProps
>(({ className, value, id, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-university-primary text-university-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-university-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {checked && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      )}
    </button>
  )
})
MultiRadioItem.displayName = "MultiRadioItem"

export { MultiRadioGroup, MultiRadioItem }
