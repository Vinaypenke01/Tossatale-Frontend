import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Eye, Heart } from "lucide-react";
import { useState, useEffect } from "react";

import { Avatar, CategoryPill, VerifiedBadge } from "@/components/tossa/kit";
import { writerBySlug, type Story } from "@/lib/data";
import { LikeAuthModal } from "@/components/auth/LikeAuthModal";
import { useAuth } from "@/components/auth/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StoryCard({
  story,
  layout = "vertical",
}: {
  story: Story;
  layout?: "vertical" | "horizontal" | "compact";
}) {
  const { isAuthenticated } = useAuth();
  const writerObj = writerBySlug(story.writer);
  const authorName = (story as any).writerName || (story as any).writer?.name || (story as any).writer?.user?.full_name || writerObj?.name || "Author";
  const authorPhoto = (story as any).writerPhoto || (story as any).writer?.profile_photo || writerObj?.photo || "";
  const authorInitials = authorName.substring(0, 2).toUpperCase();
  const isVerified = (story as any).writer?.is_verified || (story as any).verified || writerObj?.verified || false;

  const [liked, setLiked] = useState(Boolean((story as any).is_liked));
  const [likesCount, setLikesCount] = useState<number>((story as any).likes_count ?? (story as any).likes ?? 0);
  const [saved, setSaved] = useState(Boolean((story as any).is_bookmarked ?? (story as any).bookmarked));
  const [showModal, setShowModal] = useState(false);

  const storyId = (story as any).id || story.slug;
  const views = (story as any).views_count ?? (story as any).views ?? 0;
  const readTime = (story as any).estimated_reading_time || (story as any).readingTime || 5;

  useEffect(() => {
    if (typeof (story as any).is_liked === "boolean") {
      setLiked((story as any).is_liked);
    }
    setLikesCount((story as any).likes_count ?? (story as any).likes ?? 0);
  }, [(story as any).is_liked, (story as any).likes_count, (story as any).likes]);

  useEffect(() => {
    if (typeof (story as any).is_bookmarked === "boolean") {
      setSaved((story as any).is_bookmarked);
    } else if (typeof (story as any).bookmarked === "boolean") {
      setSaved((story as any).bookmarked);
    }
  }, [(story as any).is_bookmarked, (story as any).bookmarked]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    try {
      if (!saved) {
        await api.post(`/user/stories/${storyId}/bookmark/`, {});
        setSaved(true);
        toast.success("Saved to Bookmarks", {
          description: `Added "${story.title}" to your reading shelf.`,
        });
      } else {
        await api.delete(`/user/stories/${storyId}/bookmark/`);
        setSaved(false);
        toast.success("Removed from Bookmarks");
      }
    } catch (err: any) {
      if (err.message?.toLowerCase()?.includes("already bookmarked")) {
        setSaved(true);
        toast.success("Story is already in your bookmarks.");
      } else {
        toast.error("Bookmark Action Failed", { description: err.message });
      }
    }
  };

  if (layout === "compact") {
    return (
      <Link
        to="/stories/$slug"
        params={{ slug: story.slug }}
        className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-primary-light/60"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[0.6875rem] font-black tracking-[0.16em] text-primary uppercase">
              {story.category}
            </span>
          </div>
          <h3 className="mt-1 line-clamp-2 font-display text-[1.0625rem] font-bold leading-snug text-heading group-hover:text-primary-hover">
            {story.title}
          </h3>
          <p className="mt-1.5 text-[0.8125rem] text-subtle">
            {authorName} · {readTime} min read
          </p>
        </div>
      </Link>
    );
  }

  const horizontal = layout === "horizontal";

  return (
    <>
      <LikeAuthModal
        isOpen={showModal}
        storyId={storyId}
        storyTitle={story.title}
        onClose={() => setShowModal(false)}
        onLikeSuccess={(newCount) => {
          setLiked(true);
          setLikesCount(typeof newCount === "number" ? newCount : (likesCount + 1));
        }}
      />
      <article
        className={cn(
          "group flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 border-none",
          horizontal && "sm:p-6",
        )}
      >
        <div>
          {/* Top Row: Category Genre on Left, Bookmark/Save Later aligned on Right */}
          <div className="flex items-center justify-between gap-2 pb-2">
            <CategoryPill>{story.category}</CategoryPill>
            <button
              type="button"
              suppressHydrationWarning
              aria-label={saved ? "Remove bookmark" : "Save later"}
              aria-pressed={saved}
              onClick={handleBookmark}
              className={cn(
                "grid size-8 place-items-center rounded-full text-subtle transition-all duration-200 hover:bg-primary-light hover:text-primary cursor-pointer",
                saved && "bg-primary text-white hover:bg-primary/90 shadow-xs"
              )}
            >
              <Bookmark className={cn("size-4 transition-transform", saved ? "fill-current text-white" : "text-subtle")} />
            </button>
          </div>

          <Link to="/stories/$slug" params={{ slug: story.slug }} className="block mt-2">
            <h3
              className={cn(
                "line-clamp-2 leading-snug font-display font-bold text-heading transition-colors group-hover:text-primary",
                horizontal ? "text-[clamp(1.25rem,2vw,1.6rem)]" : "text-[1.1875rem]",
              )}
            >
              {story.title}
            </h3>
          </Link>
          <p className="mt-2.5 line-clamp-2 text-[0.875rem] leading-relaxed text-body">{story.dek}</p>
        </div>

        <div className="mt-5 border-t border-divider pt-3.5 space-y-3">
          {/* Author Profile Row */}
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/writers/$slug"
              params={{ slug: story.writer }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="size-7.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-[0.75rem] grid place-items-center shrink-0">
                {authorInitials}
              </div>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-sans text-[0.8125rem] font-bold text-heading truncate">
                  {authorName}
                  {isVerified && <VerifiedBadge />}
                </span>
                <span className="block text-[0.71875rem] text-subtle">{story.date}</span>
              </span>
            </Link>

            {/* Read here CTA */}
            <Link
              to="/stories/$slug"
              params={{ slug: story.slug }}
              className="group/read shrink-0 font-sans text-[0.8125rem] font-bold text-heading hover:text-[#FF6B35] transition-colors relative pb-0.5"
            >
              <span>Read here</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-200 group-hover/read:w-full" />
            </Link>
          </div>

          {/* Bottom Metadata Row: Heart (grey) with black count, View (grey) with black count, Clock with readTime */}
          <div className="flex items-center justify-between text-[0.8125rem] pt-1">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5" title="Likes">
                <Heart className="size-3.5 text-subtle" />
                <span className="font-bold text-black dark:text-white text-[0.8125rem]">{likesCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5" title="Views">
                <Eye className="size-3.5 text-subtle" />
                <span className="font-bold text-black dark:text-white text-[0.8125rem]">{views}</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-subtle text-[0.75rem]">
              <Clock className="size-3.5 text-subtle" />
              <span>{readTime} min read</span>
            </span>
          </div>
        </div>
      </article>
    </>
  );
}
