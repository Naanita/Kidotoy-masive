import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Avisos en línea (DESIGN §4): en vez de un borde izquierdo cuadrado, el gesto
// del sistema —una cápsula corta de extremos redondeados en el color— como riel
// izquierdo (`before:`). Fondo del color al ~8%, ícono en color, texto legible.
const alertVariants = cva(
  "relative w-full rounded-md border pl-11 pr-4 py-3 text-sm before:absolute before:left-2 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:content-[''] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-border bg-card text-card-foreground before:bg-border [&>svg]:text-muted-foreground",
        info: "border-border bg-accent/60 text-foreground before:bg-primary [&>svg]:text-primary",
        success:
          "border-border bg-success/[0.08] text-foreground before:bg-success [&>svg]:text-success",
        warning:
          "border-border bg-warning/[0.08] text-foreground before:bg-warning [&>svg]:text-warning",
        destructive:
          "border-border bg-destructive/[0.08] text-foreground before:bg-destructive [&>svg]:text-destructive",
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
