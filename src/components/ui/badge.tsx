import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-[var(--badge-default-border)] bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] [a&]:hover:bg-[var(--badge-default-hover-bg)]",
        secondary:
          "border-[var(--badge-secondary-border)] bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-text)] [a&]:hover:bg-[var(--badge-secondary-hover-bg)]",
        destructive:
          "border-[var(--badge-destructive-border)] bg-[var(--badge-destructive-bg)] text-[var(--badge-destructive-text)] [a&]:hover:bg-[var(--badge-destructive-hover-bg)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-[var(--badge-outline-border)] bg-[var(--badge-outline-bg)] text-[var(--badge-outline-text)] [a&]:hover:bg-[var(--badge-outline-hover-bg)] [a&]:hover:text-[var(--badge-outline-hover-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
