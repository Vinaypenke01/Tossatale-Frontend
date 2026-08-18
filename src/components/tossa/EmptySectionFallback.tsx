import { BookOpen, Sparkles, Feather, Film, Newspaper, Layers, Search, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptySectionFallbackProps {
  icon?: "book" | "write" | "video" | "blog" | "category" | "search" | "series" | "bookmark" | "sparkles";
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptySectionFallback({
  icon = "book",
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptySectionFallbackProps) {
  const IconComponent =
    icon === "write"
      ? Feather
      : icon === "video"
      ? Film
      : icon === "blog"
      ? Newspaper
      : icon === "category"
      ? Layers
      : icon === "search"
      ? Search
      : icon === "series" || icon === "sparkles"
      ? Sparkles
      : icon === "bookmark"
      ? Bookmark
      : BookOpen;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-surface/60 px-6 py-12 text-center paper-gradient overflow-hidden my-4",
        className,
      )}
    >
      {/* Animated background glow orb */}
      <div className="absolute -top-12 size-36 rounded-full bg-primary-light/40 blur-2xl pointer-events-none" />

      {/* Floating Animated Icon Badge */}
      <div className="relative mb-4 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-surface shadow-paper animate-bounce duration-[3000ms]">
        <IconComponent className="size-8 text-primary" />
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary animate-ping opacity-75" />
      </div>

      <h3 className="font-display text-[1.25rem] font-bold text-heading">{title}</h3>
      <p className="mt-1.5 max-w-md text-[0.875rem] leading-relaxed text-subtle">{description}</p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 font-sans text-[0.8125rem] font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
