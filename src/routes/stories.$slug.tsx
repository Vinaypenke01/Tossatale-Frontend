import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Clock,
  Heart,
  Layers,
  Link2,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal, useScrollProgress } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import { LikeAuthModal } from "@/components/auth/LikeAuthModal";
import { useAuth } from "@/components/auth/AuthContext";
import coverLane from "@/assets/cover-lane.jpg";
import {
  Avatar,
  Button,
  ButtonLink,
  CategoryPill,
  Panel,
  Tag,
  VerifiedBadge,
} from "@/components/tossa/kit";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/stories/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/public/stories/${params.slug}/`);
      if (res.data) {
        return { story: res.data };
      }
    } catch {
      // Fallback if detail view throws
    }
    return { story: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.story) {
      return {
        meta: [{ title: "Story not found — tossatale" }, { name: "robots", content: "noindex" }],
      };
    }
    const { story } = loaderData;
    return {
      meta: [
        { title: `${story.title} — tossatale` },
        { name: "description", content: story.subtitle || story.seo_description || "Read story on tossatale" },
        { property: "og:title", content: `${story.title} — tossatale` },
        { property: "og:description", content: story.subtitle || story.seo_description || "Read story on tossatale" },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: StoryNotFound,
  component: StoryDetail,
});

function StoryNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-4xl font-display font-bold text-heading">Story not found</h1>
        <p className="mt-4 text-body">
          The story you are looking for is unavailable or may have been unpublished.
        </p>
        <div className="mt-8">
          <ButtonLink to="/stories">Browse the library</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  );
}

function FloatingShare() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="sticky top-32 hidden flex-col items-center gap-2 lg:flex">
      <span className="mb-1 text-[0.625rem] font-black tracking-[0.18em] text-subtle uppercase">
        Share
      </span>
      {[
        { icon: Twitter, label: "Share on X" },
        { icon: Share2, label: "Share" },
        {
          icon: Link2,
          label: "Copy link",
          onClick: () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          },
        },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          onClick={item.onClick}
          className="grid size-11 place-items-center rounded-full border border-border bg-surface text-subtle shadow-paper transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
        >
          <item.icon className="size-4" />
        </button>
      ))}
      {copied && <span className="text-[0.6875rem] text-primary">Copied</span>}
    </div>
  );
}

function StoryDetail() {
  const loaderData = Route.useLoaderData();
  const story = loaderData?.story;
  const progress = useScrollProgress();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(Boolean(story?.is_liked));
  const [likesCount, setLikesCount] = useState<number>(story?.likes_count || story?.likes || 0);
  const [saved, setSaved] = useState(Boolean(story?.is_bookmarked));
  const [showLikeModal, setShowLikeModal] = useState(false);

  // Trigger 1-view-per-user-per-day tracking
  useEffect(() => {
    if (story?.id) {
      api.post(`/public/stories/${story.id}/view/`, {
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }).catch(() => {});
    }
  }, [story?.id]);

  useEffect(() => {
    if (story) {
      if (typeof story.is_liked === "boolean") {
        setLiked(story.is_liked);
      }
      if (typeof story.is_bookmarked === "boolean") {
        setSaved(story.is_bookmarked);
      }
      if (typeof story.likes_count === "number") {
        setLikesCount(story.likes_count);
      }
    }
  }, [story?.id, story?.is_liked, story?.is_bookmarked, story?.likes_count]);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      setShowLikeModal(true);
      return;
    }
    try {
      if (!liked) {
        const res = await api.post(`/public/stories/${story.id}/like/`, {});
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
        const res = await api.delete(`/public/stories/${story.id}/like/`);
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

  const handleBookmarkClick = async () => {
    if (!isAuthenticated) {
      setShowLikeModal(true);
      return;
    }
    try {
      if (!saved) {
        await api.post(`/user/stories/${story.id}/bookmark/`, {});
        setSaved(true);
        toast.success("Saved to Bookmarks", {
          description: `Added "${story.title}" to your saved shelf.`,
        });
      } else {
        await api.delete(`/user/stories/${story.id}/bookmark/`);
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

  const categoryParam = story?.category?.slug || story?.category?.id;
  const tagParam = story?.tags?.[0]?.slug || story?.tags?.[0]?.name || story?.tags?.[0];

  const { data: relatedStories } = useQuery({
    queryKey: ["public-stories-related", story?.id, categoryParam, tagParam],
    queryFn: async () => {
      let endpoint = "/public/stories/";
      const queryParams = new URLSearchParams();
      if (categoryParam) {
        queryParams.append("category", categoryParam);
      } else if (tagParam) {
        queryParams.append("tag", tagParam);
      }
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
      const res = await api.get(endpoint);
      let items = res.data?.results || res.data || [];

      // Exclude active story
      items = items.filter((item: any) => item.slug !== story?.slug && item.id !== story?.id);

      // Fallback if fewer than 3 items found
      if (items.length < 3) {
        const fallbackRes = await api.get("/public/stories/");
        const fallbackItems = fallbackRes.data?.results || fallbackRes.data || [];
        for (const fbItem of fallbackItems) {
          if (fbItem.slug !== story?.slug && fbItem.id !== story?.id && !items.some((it: any) => it.id === fbItem.id)) {
            items.push(fbItem);
            if (items.length >= 3) break;
          }
        }
      }
      return items;
    },
    enabled: !!story,
  });

  if (!story) {
    return <StoryNotFound />;
  }

  const writerName = story.writer?.name || story.writer?.user?.full_name || "Author";
  const writerInitials = writerName.substring(0, 2).toUpperCase();

  return (
    <SiteLayout>
      <LikeAuthModal
        isOpen={showLikeModal}
        storyId={story.id}
        storyTitle={story.title}
        onClose={() => setShowLikeModal(false)}
        onLikeSuccess={(newCount) => {
          setLiked(true);
          setLikesCount(typeof newCount === "number" ? newCount : (likesCount + 1));
        }}
      />

      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article>
        <header className="border-b border-border paper-gradient">
          <div className="mx-auto max-w-[820px] px-5 pt-16 pb-12">
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-subtle">
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
              <span className="px-2">/</span>
              <Link to="/stories" className="hover:text-primary">
                Stories
              </Link>
              <span className="px-2">/</span>
              <span className="text-body">{story.category?.name || "General"}</span>
            </nav>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <CategoryPill>{story.category?.name || "General"}</CategoryPill>
              <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-subtle">
                <Clock className="size-3.5" /> {story.estimated_reading_time || 5} min read
              </span>
            </div>

            <h1 className="mt-4 text-[clamp(2.1rem,4.2vw,3.6rem)] leading-[1.1] font-display font-bold text-heading">
              {story.title}
            </h1>
            <p className="mt-4 text-[1.125rem] leading-relaxed text-body">
              {story.subtitle || "A quiet piece of prose written for thoughtful readers."}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-6">
              <Link
                to="/writers/$slug"
                params={{ slug: story.writer?.slug || "writer" }}
                className="flex items-center gap-3 text-body hover:text-heading"
              >
                <Avatar
                  initials={writerInitials}
                  size="md"
                  gender={story.writer?.gender || "OTHER"}
                  src={story.writer?.profile_photo || ""}
                />
                <div>
                  <p className="flex items-center gap-1.5 font-sans text-[1rem] font-bold text-heading">
                    {writerName} {story.writer?.is_verified && <VerifiedBadge />}
                  </p>
                  <p className="text-[0.8125rem] text-subtle">
                    Published {story.published_at ? new Date(story.published_at).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? "primary" : "ghostOutline"}
                  size="sm"
                  onClick={handleLikeClick}
                  className={cn(
                    "gap-1.5 transition-all",
                    liked && "bg-destructive text-white hover:bg-destructive/90 border-destructive shadow-xs"
                  )}
                >
                  <Heart className={cn("size-4 transition-transform", liked ? "fill-current text-white animate-pop" : "text-subtle")} />
                  {liked ? "Liked" : "Like"} ({likesCount})
                </Button>
                <Button
                  variant={saved ? "primary" : "ghostOutline"}
                  size="sm"
                  onClick={handleBookmarkClick}
                  className={cn(
                    "gap-1.5 transition-all",
                    saved && "bg-primary text-white hover:bg-primary/90 border-primary shadow-xs"
                  )}
                >
                  <Bookmark className={cn("size-4 transition-transform", saved ? "fill-current text-white animate-pop" : "text-subtle")} />
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1040px] px-5 py-14 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_56px]">
            <div className="prose prose-lg max-w-none text-body font-sans leading-relaxed space-y-6">
              {story.content ? (
                <div dangerouslySetInnerHTML={{ __html: story.content }} />
              ) : (
                <p>{story.subtitle || "Full story text content."}</p>
              )}
            </div>
            <FloatingShare />
          </div>
        </div>
      </article>

      {relatedStories && relatedStories.length > 0 && (
        <section className="border-t border-border bg-surface-alt/50 py-16">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <h2 className="text-2xl font-display font-bold text-heading">
              More stories in {story.category?.name || "this collection"}
            </h2>
            <p className="mt-1 text-sm text-subtle">
              Discover stories matching the same category and tags.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedStories.slice(0, 3).map((s: any) => (
                <StoryCard key={s.slug} story={{
                  slug: s.slug,
                  title: s.title,
                  dek: s.subtitle || s.seo_description || "A longform story.",
                  writer: s.writer?.slug || "writer",
                  writerName: s.writer?.name || s.writer?.user?.full_name || "Author",
                  category: s.category?.name || "General",
                  date: s.published_at ? new Date(s.published_at).toLocaleDateString() : "Recent",
                  readingTime: s.estimated_reading_time || 5,
                  cover: s.cover_image || coverLane,
                  views: s.views_count || 0,
                  likes: s.likes_count || 0,
                } as any} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
