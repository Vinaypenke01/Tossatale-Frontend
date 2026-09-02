import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, ChevronRight, User } from "lucide-react";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
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
        sm: "h-8 px-3.5 text-[0.8125rem]",
        md: "h-10 px-5 text-[0.875rem]",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-9",
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
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error" | "info";
  className?: string;
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
        className,
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
      <span className="grid size-3.5 place-items-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-2" strokeWidth={3.5} />
      </span>
      {label && <span className="text-[0.75rem] font-bold">Verified</span>}
    </span>
  );
}

/* ---------------------------------- Avatar --------------------------------- */

export function Avatar({
  src,
  gender,
  initials,
  useIcon = true,
  size = "md",
  className,
}: {
  src?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  initials?: string;
  useIcon?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "size-6 text-[0.5625rem]",
    sm: "size-8 text-[0.6875rem]",
    md: "size-10 text-xs",
    lg: "size-14 text-sm",
    xl: "size-24 text-xl",
  } as const;

  const iconSizes = {
    xs: "size-3",
    sm: "size-4",
    md: "size-5",
    lg: "size-7",
    xl: "size-12",
  } as const;

  if (src) {
    return (
      <img
        src={src}
        alt={initials || "Avatar"}
        className={cn(
          "shrink-0 rounded-full object-cover shadow-paper border border-border/50",
          sizes[size],
          className
        )}
      />
    );
  }

  const normalizedGender = gender?.toUpperCase();

  // Distinct stylized gradient and icons based on gender
  if (normalizedGender === "FEMALE") {
    return (
      <span
        title="Female Writer"
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white shadow-paper font-sans font-black",
          sizes[size],
          className
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(iconSizes[size], "opacity-95")}
        >
          {/* Female silhouette with hair curve */}
          <path d="M12 3a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5-3 1.2-5 4.1-5 7.5h14c0-3.4-2-6.3-5-7.5 1.2-.7 2-2 2-3.5a4 4 0 0 0-4-4z" />
          <path d="M8 8c0 2 1.8 3.5 4 3.5s4-1.5 4-3.5" />
          <path d="M8 7c.5 1 2 1.5 4 1.5s3.5-.5 4-1.5" />
        </svg>
      </span>
    );
  }

  if (normalizedGender === "MALE") {
    return (
      <span
        title="Male Writer"
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 text-white shadow-paper font-sans font-black",
          sizes[size],
          className
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(iconSizes[size], "opacity-95")}
        >
          {/* Male silhouette */}
          <path d="M12 3a4 4 0 0 0-4 4c0 1.8 1.2 3.3 2.8 3.8-3.3 1.3-4.8 4.2-4.8 7.2h12c0-3-1.5-5.9-4.8-7.2A4 4 0 0 0 16 7a4 4 0 0 0-4-4z" />
          <path d="M9 10.5h6" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full ink-gradient font-sans font-black tracking-widest text-primary-foreground shadow-paper",
        sizes[size],
        className,
      )}
    >
      {useIcon ? (
        <User className={cn(iconSizes[size], "opacity-90")} />
      ) : (
        initials
      )}
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
  hint?: ReactNode;
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

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-3.5 font-sans text-[0.875rem] font-medium text-heading shadow-xs transition-all hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={cn("size-4 text-subtle transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 max-h-60 w-full overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-lift backdrop-blur-md animate-in fade-in-50 zoom-in-95">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-[0.875rem] font-medium transition-colors text-left",
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-heading hover:bg-surface-hover hover:text-primary"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="size-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
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

export function XIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
