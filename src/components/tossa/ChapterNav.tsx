import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterNavProps {
  storySlug: string;
  storyTitle: string;
  currentOrder: number;
  totalChapters: number;
  prevChapter?: { order: number; title: string } | null;
  nextChapter?: { order: number; title: string } | null;
  onOpenToC?: () => void;
  className?: string;
}

export function ChapterNav({
  storySlug,
  storyTitle,
  currentOrder,
  totalChapters,
  prevChapter,
  nextChapter,
  onOpenToC,
  className,
}: ChapterNavProps) {
  const isFinalChapter = currentOrder >= totalChapters;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm transition-all",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous Chapter */}
        <div className="w-full sm:w-1/3 flex justify-start">
          {prevChapter ? (
            <Link
              to="/stories/$slug/chapters/$chapterOrder"
              params={{ slug: storySlug, chapterOrder: String(prevChapter.order) }}
              className="group inline-flex items-center gap-2.5 text-sm font-sans font-medium text-body hover:text-heading transition-colors"
            >
              <span className="grid size-8 place-items-center rounded-full border border-border bg-surface-alt/70 text-subtle group-hover:bg-primary/10 group-hover:border-primary/40 group-hover:text-primary transition-all shrink-0">
                <ArrowLeft className="size-4" />
              </span>
              <div className="min-w-0 text-left">
                <span className="block text-[0.6875rem] uppercase tracking-wider text-subtle font-bold">
                  Previous
                </span>
                <span className="block text-xs sm:text-sm font-bold truncate max-w-[140px] sm:max-w-[180px]">
                  {prevChapter.title || `Chapter ${prevChapter.order}`}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/stories/$slug"
              params={{ slug: storySlug }}
              className="inline-flex items-center gap-2 text-xs font-medium text-subtle hover:text-heading transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Story Overview</span>
            </Link>
          )}
        </div>

        {/* Center Indicator / ToC Trigger */}
        <div className="flex items-center gap-2">
          {onOpenToC ? (
            <button
              type="button"
              onClick={onOpenToC}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface-alt/60 px-3.5 py-1.5 text-xs font-semibold text-heading hover:bg-surface-hover hover:border-primary/40 transition-all cursor-pointer shadow-xs"
              title="View Table of Contents"
            >
              <List className="size-3.5 text-primary" />
              <span>
                Chapter {currentOrder} of {totalChapters}
              </span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-subtle">
              <BookOpen className="size-3.5 text-primary" />
              Chapter {currentOrder} of {totalChapters}
            </span>
          )}
        </div>

        {/* Next Chapter or Story Completed */}
        <div className="w-full sm:w-1/3 flex justify-end">
          {nextChapter ? (
            <Link
              to="/stories/$slug/chapters/$chapterOrder"
              params={{ slug: storySlug, chapterOrder: String(nextChapter.order) }}
              className="group inline-flex items-center gap-2.5 text-sm font-sans font-medium text-body hover:text-heading transition-colors text-right"
            >
              <div className="min-w-0 text-right">
                <span className="block text-[0.6875rem] uppercase tracking-wider text-subtle font-bold">
                  Next Chapter
                </span>
                <span className="block text-xs sm:text-sm font-bold truncate max-w-[140px] sm:max-w-[180px] text-primary">
                  {nextChapter.title || `Chapter ${nextChapter.order}`}
                </span>
              </div>
              <span className="grid size-8 place-items-center rounded-full bg-primary text-white group-hover:bg-primary-hover transition-all shrink-0 shadow-xs">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ) : isFinalChapter ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-success">
              <CheckCircle2 className="size-4" />
              <span>Finale reached</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
