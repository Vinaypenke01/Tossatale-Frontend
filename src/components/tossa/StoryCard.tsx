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

function MetaRow({ story, likesCount }: { story: Story; likesCount?: number }) {
  const count = typeof likesCount === "number" ? likesCount : ((story as any).likes_count ?? (story as any).likes ?? 0);
  const views = (story as any).views_count ?? (story as any).views ?? 0;
  const readTime = (story as any).estimated_reading_time || (story as any).readingTime || 5;

  return (
    <div className="flex items-center gap-4 text-[0.8125rem] text-subtle">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" /> {readTime} min
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Eye className="size-3.5" /> {views}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Heart className="size-3.5" /> {count}
      </span>
    </div>
  );
}

function ActionButtons({
  story,
  liked,
  setLiked,
  likesCount,
  setLikesCount,
}: {
  story: Story;
  liked: boolean;
  setLiked: React.Dispatch<React.SetStateAction<boolean>>;
  likesCount: number;
  setLikesCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(Boolean((story as any).is_bookmarked ?? (story as any).bookmarked));
  const [showModal, setShowModal] = useState(false);

  const storyId = (story as any).id || story.slug;

  useEffect(() => {
    if (typeof (story as any).is_bookmarked === "boolean") {
      setSaved((story as any).is_bookmarked);
    } else if (typeof (story as any).bookmarked === "boolean") {
      setSaved((story as any).bookmarked);
    }
  }, [(story as any).is_bookmarked, (story as any).bookmarked]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    try {
      if (!liked) {
        const res = await api.post(`/public/stories/${storyId}/like/`, {});
        setLiked(true);
        if (typeof res.data?.likes_count === "number") {
          setLikesCount(res.data.likes_count);
        } else {
          setLikesCount((c) => c + 1);
        }
        toast.success("Story Liked!", {
          description: `Added "${story.title}" to your reading collection.`,
        });
      } else {
        const res = await api.delete(`/public/stories/${storyId}/like/`);
        setLiked(false);
        if (typeof res.data?.likes_count === "number") {
          setLikesCount(res.data.likes_count);
        } else {
          setLikesCount((c) => Math.max(0, c - 1));
        }
        toast.success("Removed like");
      }
    } catch (err: any) {
      if (err.message?.toLowerCase()?.includes("already liked")) {
        setLiked(true);
        toast.success("Story is already in your liked collection.");
      } else {
        toast.error("Like Action Failed", { description: err.message });
      }
    }
  };

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
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          suppressHydrationWarning
          aria-label={liked ? "Unlike story" : "Like story"}
          aria-pressed={liked}
          onClick={handleLike}
          className={cn(
            "grid size-8.5 place-items-center rounded-full text-subtle transition-all duration-200 hover:bg-primary-light hover:text-primary",
            liked && "bg-destructive text-white hover:bg-destructive/90 border border-destructive shadow-xs"
          )}
        >
          <Heart
            className={cn("size-4 transition-transform", liked ? "animate-pop fill-current text-white" : "text-subtle")}
          />
        </button>
        <button
          type="button"
          suppressHydrationWarning
          aria-label={saved ? "Remove bookmark" : "Bookmark story"}
          aria-pressed={saved}
          onClick={handleBookmark}
          className={cn(
            "grid size-8.5 place-items-center rounded-full text-subtle transition-all duration-200 hover:bg-primary-light hover:text-primary",
            saved && "bg-primary text-white hover:bg-primary/90 border border-primary shadow-xs"
          )}
        >
          <Bookmark
            className={cn("size-4 transition-transform", saved ? "animate-pop fill-current text-white" : "text-subtle")}
          />
        </button>
      </div>
    </>
  );
}

export function StoryCard({
  story,
  layout = "vertical",
}: {
  story: Story;
  layout?: "vertical" | "horizontal" | "compact";
}) {
  const writerObj = writerBySlug(story.writer);
  const authorName = (story as any).writerName || (story as any).writer?.name || (story as any).writer?.user?.full_name || writerObj?.name || "Author";
  const authorGender = (story as any).writerGender || (story as any).writer?.gender || writerObj?.gender || "OTHER";
  const authorPhoto = (story as any).writerPhoto || (story as any).writer?.profile_photo || writerObj?.photo || "";
  const authorInitials = authorName.substring(0, 2).toUpperCase();
  const isVerified = (story as any).writer?.is_verified || (story as any).verified || writerObj?.verified || false;

  const [liked, setLiked] = useState(Boolean((story as any).is_liked));
  const [likesCount, setLikesCount] = useState<number>((story as any).likes_count ?? (story as any).likes ?? 0);

  useEffect(() => {
    if (typeof (story as any).is_liked === "boolean") {
      setLiked((story as any).is_liked);
    }
    setLikesCount((story as any).likes_count ?? (story as any).likes ?? 0);
  }, [(story as any).is_liked, (story as any).likes_count, (story as any).likes]);

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
            {authorName} · {story.readingTime} min read
          </p>
        </div>
      </Link>
    );
  }

  const horizontal = layout === "horizontal";

  return (
    <article
      className={cn(
        "group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-paper transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lift p-5 sm:p-5",
        horizontal && "sm:p-6",
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill>{story.category}</CategoryPill>
          </div>
          <span className="font-sans text-[0.75rem] font-medium text-subtle">
            {story.readingTime} min read
          </span>
        </div>

        <Link to="/stories/$slug" params={{ slug: story.slug }} className="block mt-1.5">
          <h3
            className={cn(
              "line-clamp-2 leading-snug font-display font-bold text-heading transition-colors group-hover:text-primary-hover",
              horizontal ? "text-[clamp(1.25rem,2vw,1.6rem)]" : "text-[1.1875rem]",
            )}
          >
            {story.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-[0.875rem] leading-normal text-body">{story.dek}</p>
      </div>

      <div className="mt-4 border-t border-divider pt-3.5 space-y-2.5">
        {typeof (story as any).progress === "number" && (story as any).progress > 0 && (
          <div className="rounded-lg bg-surface-alt/70 p-2 text-xs">
            <div className="flex items-center justify-between font-sans text-[0.75rem] font-medium">
              <span className="text-subtle">Reading progress</span>
              <span className={cn("font-bold", (story as any).completed || (story as any).progress >= 95 ? "text-success" : "text-primary")}>
                {(story as any).completed || (story as any).progress >= 95 ? "Finished" : `${(story as any).progress}%`}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", (story as any).completed || (story as any).progress >= 95 ? "bg-success" : "bg-primary")}
                style={{ width: `${(story as any).progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            to="/writers/$slug"
            params={{ slug: story.writer }}
            className="flex items-center gap-2.5 min-w-0"
          >
            <Avatar initials={authorInitials} gender={authorGender} src={authorPhoto} size="sm" />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 font-sans text-[0.8125rem] font-bold text-heading truncate">
                {authorName}
                {isVerified && <VerifiedBadge />}
              </span>
              <span className="block text-[0.71875rem] text-subtle">{story.date}</span>
            </span>
          </Link>
          <div className="ml-auto shrink-0">
            <ActionButtons
              story={story}
              liked={liked}
              setLiked={setLiked}
              likesCount={likesCount}
              setLikesCount={setLikesCount}
            />
          </div>
        </div>

        <MetaRow story={story} likesCount={likesCount} />
      </div>
    </article>
  );
}
