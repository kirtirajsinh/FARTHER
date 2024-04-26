import { cn } from "@lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border backdrop-blur-md text-link bg-white/5 border-input hover:bg-white/10",
        error:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary:
          "backdrop-blur-md text-link border border-input hover:bg-accent hover:bg-white/5",
        ghost: "backdrop-blur-md text-link hover:bg-white/5 ",
        link: "hover:underline !p-0 dark:text-link dark:hover:text-link-hover transition-colors font-normal !h-auto font-normal",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      loadingText,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading ? "loading-ellipsis" : "",
        )}
        ref={ref}
        {...props}
      >
        {loading ? loadingText : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
