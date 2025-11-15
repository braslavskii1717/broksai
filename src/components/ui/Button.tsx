import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white shadow-md hover:bg-primary-dark",
  secondary: "bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-300",
  ghost: "bg-transparent text-neutral-700 hover:text-neutral-900",
  accent: "bg-accent-mint text-neutral-900 shadow-md hover:bg-accent-orange hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { children, className, variant = "primary", size = "md", fullWidth, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        { "w-full": Boolean(fullWidth) },
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
