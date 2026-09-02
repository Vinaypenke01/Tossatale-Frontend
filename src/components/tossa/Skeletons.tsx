import React from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

/**
 * Core Shimmer Skeleton Atom
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-zinc-800/80 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LANDING PAGE SKELETONS (Tailored to each section's exact layout)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Featured Stories Skeleton Cards — 2 Large Side-by-Side Horizontal Cards
 */
export function FeaturedStoriesSkeletonCards() {
  return (
    <div className="mt-10 grid gap-8 md:grid-cols-2">
      {[1, 2].map((idx) => (
        <div
          key={idx}
          className="flex flex-col justify-between h-full rounded-2xl bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-7 lg:p-9 border border-border/40"
        >
          <div>
            {/* Category Pill */}
            <Skeleton className="h-6 w-24 rounded-full" />

            {/* Title Bar */}
            <Skeleton className="h-7 w-5/6 mt-4" />

            {/* Multi-line Description Wave */}
            <div className="mt-4 space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="mt-8 flex items-center justify-between pt-5 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Featured Stories Section Skeleton
 */
export function FeaturedStoriesSkeleton() {
  return (
    <section className="bg-white dark:bg-zinc-950 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-8 w-56 sm:w-72 mt-1" />
          <Skeleton className="h-4 w-72 sm:w-96 mt-1" />
        </div>
        <FeaturedStoriesSkeletonCards />
      </div>
    </section>
  );
}

/**
 * Latest Stories Skeleton Cards — 3 Vertical Story Cards Grid
 */
export function LatestStoriesSkeletonCards() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((idx) => (
        <StoryCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Latest Stories Section Skeleton
 */
export function LatestStoriesSkeleton() {
  return (
    <section className="bg-slate-50 dark:bg-zinc-900/50 py-16 lg:py-20 border-y border-border/30">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-48 sm:w-64 mt-1" />
          <Skeleton className="h-4 w-64 sm:w-80 mt-1" />
        </div>
        <LatestStoriesSkeletonCards />
      </div>
    </section>
  );
}

/**
 * Single Story Card Skeleton
 */
export function StoryCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden border border-border/30">
      {/* Cover Image Placeholder */}
      <Skeleton className="w-full aspect-[16/10] rounded-none" />

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Top Row: Genre Pill + Bookmark */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="size-7 rounded-full" />
          </div>

          {/* Title Line */}
          <Skeleton className="h-5 w-4/5 mt-3" />

          {/* Excerpt Lines */}
          <div className="mt-2.5 space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Trending Stories Skeleton Rows — 3 Columns x 2 Rows with Big Numerals
 */
export function TrendingStoriesSkeletonRows() {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <div key={num} className="flex items-start gap-4">
          {/* Big Faint Number */}
          <span className="font-sans text-[2.1rem] font-black leading-none text-slate-200 dark:text-zinc-800 shrink-0 select-none w-10">
            {String(num).padStart(2, "0")}
          </span>

          {/* Content Placeholder */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Author Avatar + Name */}
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3.5 w-28" />
            </div>

            {/* Story Title */}
            <Skeleton className="h-5 w-5/6" />

            {/* Metadata Row */}
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-3 w-16" />
              <span className="text-slate-300 dark:text-zinc-700">·</span>
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Trending Stories Section Skeleton
 */
export function TrendingStoriesSkeleton() {
  return (
    <section className="bg-white dark:bg-zinc-950 py-16 lg:py-20 border-y border-border/30">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Skeleton className="h-8 w-48 mb-10" />
        <TrendingStoriesSkeletonRows />
      </div>
    </section>
  );
}

/**
 * Latest Blogs Skeleton Cards — 2-Column Wide Cards
 */
export function LatestBlogsSkeletonCards() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-border/30"
        >
          {/* Blog Image */}
          <Skeleton className="w-full sm:w-[190px] h-[130px] rounded-xl shrink-0" />

          <div className="flex-1 w-full space-y-2">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
            <div className="pt-2 flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Latest Blogs Section Skeleton
 */
export function LatestBlogsSkeleton() {
  return (
    <section className="bg-white dark:bg-zinc-950 py-16 lg:py-20 border-y border-border/30">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-8 w-44" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <LatestBlogsSkeletonCards />
      </div>
    </section>
  );
}

/**
 * Video Library Skeleton Cards — 2-Column Video Player Cards with Play Icons
 */
export function VideoLibrarySkeletonCards() {
  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2">
      {[1, 2].map((idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden border border-border/30"
        >
          {/* Video Thumbnail Frame with Center Glow Play */}
          <div className="relative w-full aspect-[16/9] bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
            <div className="size-14 rounded-full bg-white/40 dark:bg-white/20 backdrop-blur-xs flex items-center justify-center animate-pulse">
              <Play className="size-6 text-white fill-white/80 ml-0.5 opacity-75" />
            </div>
            <div className="absolute bottom-3 right-3">
              <Skeleton className="h-5 w-12 rounded-md bg-black/40" />
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="p-6 text-center space-y-2">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-3.5 w-1/2 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Video Library Section Skeleton
 */
export function VideoLibrarySkeleton() {
  return (
    <section className="bg-slate-50 dark:bg-zinc-900/50 py-16 lg:py-24 border-y border-border/30">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <VideoLibrarySkeletonCards />
      </div>
    </section>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PUBLIC PAGES SKELETONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Stories Grid Skeleton (for /stories)
 */
export function StoriesGridSkeleton({ count = 9, view = "grid" }: { count?: number; view?: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="space-y-4 mt-8">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-surface border border-border/40 shadow-xs"
          >
            <Skeleton className="w-full sm:w-48 h-32 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Blogs Grid Skeleton (for /blogs)
 */
export function BlogsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl bg-surface border border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <Skeleton className="w-full aspect-[16/10] rounded-none" />
          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-5/6 mt-2.5" />
              <Skeleton className="h-3.5 w-full mt-2" />
              <Skeleton className="h-3.5 w-3/4 mt-1.5" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Video Library Grid Skeleton (for /videos)
 */
export function VideosGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-surface border border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="relative w-full aspect-[16/9] bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
            <div className="size-12 rounded-full bg-white/40 dark:bg-white/20 backdrop-blur-xs flex items-center justify-center animate-pulse">
              <Play className="size-5 text-white fill-white/80 ml-0.5" />
            </div>
            <div className="absolute bottom-2.5 right-2.5">
              <Skeleton className="h-4 w-12 rounded-md bg-black/40" />
            </div>
          </div>
          <div className="p-5 space-y-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3.5 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Writers Grid Skeleton (for /writers)
 */
export function WritersGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border/40 shadow-xs"
        >
          <Skeleton className="size-20 rounded-full mb-3" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-20 mt-1" />
          <Skeleton className="h-3 w-full mt-3" />
          <Skeleton className="h-3 w-3/4 mt-1" />
          <div className="w-full mt-5 pt-4 border-t border-border/40 flex justify-around">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Story & Article Detail Skeleton (for /stories/$slug and /blogs/$slug)
 */
export function ArticleDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[800px] px-5 py-12 lg:py-16 space-y-8">
      {/* Category Pill */}
      <Skeleton className="h-6 w-24 rounded-full" />

      {/* Main Title */}
      <div className="space-y-3">
        <Skeleton className="h-10 sm:h-12 w-full" />
        <Skeleton className="h-10 sm:h-12 w-3/4" />
      </div>

      {/* Subtitle */}
      <Skeleton className="h-5 w-2/3" />

      {/* Author & Meta Row */}
      <div className="flex items-center gap-4 py-4 border-y border-border/50">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Hero Cover Image */}
      <Skeleton className="w-full aspect-[16/9] rounded-2xl" />

      {/* Article Typography Body Blocks */}
      <div className="space-y-4 pt-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

/**
 * FAQ Accordion Skeleton (for /faq)
 */
export function FaqSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-surface border border-border/40 shadow-xs flex items-center justify-between"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="size-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}
