import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Avisos en línea (DESIGN §4): borde izquierdo de 4px en el color pleno, fondo
// del color al ~8%, ícono en color, texto oscuro legible. Cuatro tipos.
const alertVariants = cva(
  "relative w-full rounded-md border border-l-4 pl-11 pr-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground [&>svg]:text-muted-foreground",
        info: "border-border border-l-primary bg-accent/60 text-foreground [&>svg]:text-primary",
        success:
          "border-border border-l-success bg-success/[0.08] text-foreground [&>svg]:text-success",
        warning:
          "border-border border-l-warning bg-warning/[0.08] text-foreground [&>svg]:text-warning",
        destructive:
          "border-border border-l-destructive bg-destructive/[0.08] text-foreground [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
