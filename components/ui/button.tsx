import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Radio 8px, foco visible (ring-2 + offset), micro-interacción al presionar.
  // Deshabilitado en gris (superficie + texto apagado), no solo opacidad.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:border-transparent disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primario: azul sólido, hover a primario oscuro.
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark",
        // Peligro: liberar, revertir. Solo acciones irreversibles.
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Secundario: blanco con contorno azul.
        outline:
          "border border-primary bg-card text-primary shadow-sm hover:bg-accent hover:text-primary-dark",
        // Superficie suave (filtros, chips de acción).
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70",
        // Terciario: texto/fantasma.
        ghost: "text-primary hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
