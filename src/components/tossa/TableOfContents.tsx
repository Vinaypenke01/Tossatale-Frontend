import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { type StoryChapter } from "@/lib/data";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  storySlug: string;
  chapters: StoryChapter[];
  activeOrder?: number;
  onSelectChapter?: (order: number) => void;
  className?: string;
}

export function TableOfContents({
  storySlug,
  chapters,
  activeOrder,
  onSelectChapter,
  className,
}: TableOfContentsProps) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-subtle">
        No chapters published yet.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between pb-2">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
          <BookOpen className="size-4.5 text-primary" />
          <span>Table of Contents</span>
        </h3>
        <span className="text-xs font-semibold text-subtle">
          {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
        </span>
      </div>

      <div className="divide-y divide-border/60 rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        {chapters.map((chapter, idx) => {
          const formattedOrder = String(idx + 1).padStart(2, "0");
          const isActive = activeOrder === idx + 1 || activeOrder === chapter.order;

          return (
            <Link
              key={chapter.id || chapter.order || idx}
              to="/stories/$slug/chapters/$chapterOrder"
              params={{ slug: storySlug, chapterOrder: String(chapter.order || idx + 1) }}
              onClick={() => onSelectChapter && onSelectChapter(chapter.order || idx + 1)}
              className={cn(
                "group flex items-center justify-between gap-4 p-4 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-surface-alt/60 text-heading"
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-lg font-mono text-xs font-bold shrink-0",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-surface-alt text-subtle group-hover:text-heading"
                  )}
                >
                  {formattedOrder}
                </span>

                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-display text-sm sm:text-base font-semibold truncate transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-heading group-hover:text-primary"
                    )}
                  >
                    {chapter.title || `Chapter ${chapter.order}`}
                  </p>
                  {chapter.word_count > 0 && (
                    <p className="text-[0.75rem] text-subtle mt-0.5">
                      {chapter.word_count.toLocaleString()} words
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-subtle shrink-0">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Clock className="size-3" />
                  {chapter.estimated_reading_time || 5} min
                </span>
                <ChevronRight
                  className={cn(
                    "size-4 transition-transform group-hover:translate-x-0.5",
                    isActive ? "text-primary" : "text-subtle"
                  )}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
