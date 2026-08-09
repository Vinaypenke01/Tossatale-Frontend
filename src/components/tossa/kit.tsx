import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronRight } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/* ---------------------------------- Button --------------------------------- */

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-bold tracking-tight transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-paper hover:bg-primary-hover hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0",
        ghostOutline:
          "border border-border bg-surface text-heading hover:border-primary hover:text-primary hover:-translate-y-0.5",
        quiet: "text-primary hover:bg-primary-light",
        soft: "bg-primary-light text-primary-hover hover:bg-primary hover:text-primary-foreground",
        inkOnDark:
          "border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-primary-hover",
        danger: "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem]",
        md: "h-11 px-6 text-[0.9375rem]",
        lg: "h-14 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button suppressHydrationWarning className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

const LinkAny = Link as unknown as React.ComponentType<Record<string, unknown>>;

export function ButtonLink({
  className,
  variant,
  size,
  children,
  to,
  params,
  onClick,
}: VariantProps<typeof buttonVariants> & {
  className?: string;
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <LinkAny to={to} params={params} onClick={onClick} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </LinkAny>
  );
}



/* ----------------------------------- Pills ---------------------------------- */

export function CategoryPill({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "solid" | "onImage";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-sans text-[0.6875rem] font-bold tracking-[0.14em] uppercase",
        tone === "light" && "bg-primary-light text-primary-hover",
        tone === "solid" && "bg-primary text-primary-foreground",
        tone === "onImage" && "bg-white/90 text-primary-hover backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-[0.8125rem] text-subtle transition-colors hover:border-primary hover:text-primary">
      #{children}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error" | "info";
}) {
  const tones = {
    neutral: "bg-surface-alt text-subtle",
    success: "bg-success/10 text-success",
    warning: "bg-warning/12 text-warning",
    error: "bg-destructive/10 text-destructive",
    info: "bg-primary-light text-primary-hover",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ label = false }: { label?: boolean }) {
  return (
    <span
      title="Verified writer"
      className="inline-flex items-center gap-1 text-primary"
      aria-label="Verified writer"
    >
      <span className="grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-2.5" strokeWidth={3.5} />
      </span>
      {label && <span className="text-[0.8125rem] font-bold">Verified</span>}
    </span>
  );
}

/* ---------------------------------- Avatar --------------------------------- */

export function Avatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "size-8 text-[0.6875rem]",
    md: "size-10 text-xs",
    lg: "size-14 text-sm",
    xl: "size-24 text-xl",
  } as const;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full ink-gradient font-sans font-black tracking-widest text-primary-foreground shadow-paper",
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* ----------------------------------- Card ---------------------------------- */

export function Panel({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-paper",
        hover &&
          "transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- Inputs --------------------------------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-[0.8125rem] font-bold tracking-wide text-heading">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[0.8125rem] text-subtle">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      suppressHydrationWarning
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-heading transition-all placeholder:text-subtle/70 hover:border-subtle/50 focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  rows = 5,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      suppressHydrationWarning
      rows={rows}
      className={cn(
        "w-full rounded-xl border border-border bg-surface px-4 py-3 text-[0.9375rem] leading-relaxed text-heading transition-all placeholder:text-subtle/70 hover:border-subtle/50 focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------ Section header ----------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  blurb,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  blurb?: string;
  action?: { label: string; to: string };
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <p className="mb-3 font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[clamp(1.75rem,3.2vw,2.6rem)] leading-[1.12]">{title}</h2>
        {blurb && <p className="mt-3 text-[1.0625rem] text-body">{blurb}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-1.5 font-sans text-[0.9375rem] font-bold text-primary"
        >
          {action.label}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

/* ------------------------------ Empty / Skeleton ---------------------------- */

export function EmptyState({
  title,
  blurb,
  icon,
  action,
}: {
  title: string;
  blurb: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface-alt/60 px-8 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary-light text-primary">
        {icon}
      </div>
      <h3 className="mt-5 text-xl">{title}</h3>
      <p className="mt-2 max-w-sm text-[0.9375rem] text-subtle">{blurb}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-sheen rounded-xl", className)} />;
}
