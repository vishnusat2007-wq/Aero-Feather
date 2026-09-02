import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-af-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-af-bg disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "af-btn-primary rounded-lg",
        cyan: "af-btn-primary rounded-lg",
        ghost: "af-btn-ghost rounded-lg",
        outline:
          "rounded-lg border border-af-cyan/25 bg-transparent text-af-text hover:border-af-cyan/50 hover:bg-af-surface",
        subtle:
          "rounded-lg bg-af-surface text-af-muted hover:bg-af-surface-elevated hover:text-af-text",
        destructive: "rounded-lg bg-red-600/90 text-white hover:bg-red-600",
        link: "text-af-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
