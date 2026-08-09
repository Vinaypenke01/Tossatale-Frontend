import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Eye, Heart, Layers } from "lucide-react";
import { useState } from "react";

import { Avatar, CategoryPill, VerifiedBadge } from "@/components/tossa/kit";
import { writerBySlug, type Story } from "@/lib/data";
import { cn } from "@/lib/utils";

function MetaRow({ story }: { story: Story }) {
  return (
    <div className="flex items-center gap-4 text-[0.8125rem] text-subtle">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" /> {story.readingTime} min
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Eye className="size-3.5" /> {story.views}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Heart className="size-3.5" /> {story.likes}
      </span>
    </div>
  );
}

function ActionButtons({ story }: { story: Story }) {
  const [saved, setSaved] = useState(Boolean(story.bookmarked));
  const [liked, setLiked] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={liked ? "Unlike story" : "Like story"}
        aria-pressed={liked}
        onClick={(e) => {
          e.preventDefault();
          setLiked((v) => !v);
        }}
        className="grid size-9 place-items-center rounded-full text-subtle transition-colors hover:bg-primary-light hover:text-primary"
      >
        <Heart
          className={cn("size-4 transition-transform", liked && "animate-pop fill-destructive text-destructive")}
        />
      </button>
      <button
        type="button"
        aria-label={saved ? "Remove bookmark" : "Bookmark story"}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          setSaved((v) => !v);
        }}
        className="grid size-9 place-items-center rounded-full text-subtle transition-colors hover:bg-primary-light hover:text-primary"
      >
        <Bookmark
          className={cn("size-4 transition-transform", saved && "animate-pop fill-primary text-primary")}
        />
      </button>
    </div>
  );
}

export function StoryCard({
  story,
  layout = "vertical",
}: {
  story: Story;
  layout?: "vertical" | "horizontal" | "compact";
}) {
  const writer = writerBySlug(story.writer);

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
            {story.series && (
              <span className="inline-flex items-center gap-1 font-sans text-[0.625rem] font-bold text-subtle">
                <Layers className="size-3" /> Series
              </span>
            )}
          </div>
          <h3 className="mt-1 line-clamp-2 font-display text-[1.0625rem] font-bold leading-snug text-heading group-hover:text-primary-hover">
            {story.title}
          </h3>
          <p className="mt-1.5 text-[0.8125rem] text-subtle">
            {writer?.name} · {story.readingTime} min read
          </p>
        </div>
      </Link>
    );
  }

  const horizontal = layout === "horizontal";

  return (
    <article
      className={cn(
        "group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-paper transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-lift p-6 md:p-7",
        horizontal && "md:p-8",
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill>{story.category}</CategoryPill>
            {story.series && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light border border-primary/20 px-2.5 py-0.5 font-sans text-[0.6875rem] font-bold tracking-wide text-primary-hover">
                <Layers className="size-3" /> Series
              </span>
            )}
          </div>
          <span className="font-sans text-[0.75rem] font-medium text-subtle">
            {story.readingTime} min read
          </span>
        </div>

        <Link to="/stories/$slug" params={{ slug: story.slug }} className="block mt-2">
          <h3
            className={cn(
              "leading-[1.2] font-display font-bold text-heading transition-colors group-hover:text-primary-hover",
              horizontal ? "text-[clamp(1.4rem,2.2vw,1.9rem)]" : "text-[1.35rem]",
            )}
          >
            {story.title}
          </h3>
        </Link>
        <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-relaxed text-body">{story.dek}</p>
      </div>

      <div className="mt-6 border-t border-divider pt-5 space-y-4">
        <div className="flex items-center gap-3">
          <Link
            to="/writers/$slug"
            params={{ slug: story.writer }}
            className="flex items-center gap-3 min-w-0"
          >
            <Avatar initials={writer?.initials ?? "TT"} size="sm" />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 font-sans text-[0.875rem] font-bold text-heading truncate">
                {writer?.name}
                {writer?.verified && <VerifiedBadge />}
              </span>
              <span className="block text-[0.75rem] text-subtle">{story.date}</span>
            </span>
          </Link>
          <div className="ml-auto shrink-0">
            <ActionButtons story={story} />
          </div>
        </div>

        <MetaRow story={story} />
      </div>
    </article>
  );
}
