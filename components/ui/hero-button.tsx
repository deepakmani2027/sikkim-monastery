import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const heroButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        hero: "bg-secondary text-secondary-foreground shadow-soft hover:shadow-elevated hover:scale-[1.02] hover:-translate-y-0.5 backdrop-blur-sm border border-secondary/20",
  "hero-outline": "border-2 border-white/40 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/60 shadow-soft",
        primary: "bg-primary text-primary-foreground shadow-soft hover:shadow-elevated hover:bg-primary/90",
        saffron: "bg-gradient-saffron text-secondary-foreground shadow-soft hover:shadow-elevated hover:scale-[1.02]",
        monastery: "bg-gradient-monastery text-primary-foreground shadow-soft hover:shadow-elevated hover:scale-[1.02]",
      },
      size: {
        default: "h-12 px-8 py-3",
        lg: "h-14 px-10 py-4 text-lg",
        xl: "h-16 px-12 py-5 text-xl",
      },
    },
    defaultVariants: {
      variant: "hero",
      size: "default",
    },
  }
)

export interface HeroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof heroButtonVariants> {
  asChild?: boolean
}

const HeroButton = React.forwardRef<HTMLButtonElement, HeroButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(heroButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
HeroButton.displayName = "HeroButton"

export { HeroButton, heroButtonVariants }