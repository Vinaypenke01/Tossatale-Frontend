import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Check,
  Clock,
  Copy,
  Facebook,
  Heart,
  Layers,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
  X,
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
import { cn, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/stories/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/public/stories/${params.slug}/`);
      if (res.data) {
        return { story: res.data };
      }
    } catch {
      // Fallback
    }
    return { story: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.story) {
      return { meta: [{ title: "Story not found — tossatale" }, { name: "robots", content: "noindex" }] };
    }
    const { story } = loaderData;
    const desc = story.dek || story.subtitle || "A longform story on tossatale";
    return {
      meta: [
        { title: `${story.title} — tossatale` },
        { name: "description", content: desc },
        { property: "og:title", content: story.title },
        { property: "og:description", content: desc },
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
      <div className="mx-auto max-w-lg px-5 py-32 text-center">
        <h1 className="text-4xl font-display font-bold text-heading">Story not found</h1>
        <p className="mt-4 text-body">The story you are looking for does not exist or has been removed.</p>
        <div className="mt-8">
          <ButtonLink to="/stories">Browse stories</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  );
}

function ShareModal({
  isOpen,
  onClose,
  title,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const currentUrl = getShareUrl();
  const shareTitle = title || "Story on tossatale";

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      color: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " — " + currentUrl)}`,
      icon: MessageCircle,
    },
    {
      name: "LinkedIn",
      color: "bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border-[#0A66C2]/30",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      icon: Linkedin,
    },
    {
      name: "Facebook",
      color: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border-[#1877F2]/30",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      icon: Facebook,
    },
    {
      name: "Telegram",
      color: "bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 border-[#229ED9]/30",
      href: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
      icon: Send,
    },
    {
      name: "Email",
      color: "bg-surface-alt text-subtle hover:text-heading border-border",
      href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent("Read this story on tossatale:\n" + currentUrl)}`,
      icon: Mail,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex w-full max-w-md flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-alt/40">
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-primary" />
            <h3 className="font-display text-base font-bold text-heading">Share this story</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface hover:text-heading transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs text-subtle">Story Title</p>
            <h4 className="mt-0.5 font-display text-sm font-bold text-heading line-clamp-2">
              {shareTitle}
            </h4>
          </div>

          {/* Copy Link Field with dedicated copy button */}
          <div>
            <label className="text-xs font-bold text-subtle block mb-1.5">
              Story Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="h-10 flex-1 rounded-xl border border-border bg-surface-alt px-3.5 text-xs text-body font-mono select-all focus:outline-hidden"
              />
              <Button
                type="button"
                variant={copied ? "primary" : "soft"}
                size="sm"
                onClick={handleCopyLink}
                className="h-10 px-4 text-xs font-bold gap-1.5 shrink-0"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Social Channels */}
          <div>
            <label className="text-xs font-bold text-subtle block mb-2.5">
              Share via
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {shareLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all hover:scale-[1.02]",
                    item.color
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border px-6 py-3.5 bg-surface-alt/30 flex justify-end">
          <Button
            variant="ghostOutline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </div>
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
  const [showShareModal, setShowShareModal] = useState(false);

  // Trigger 1-view-per-user-per-day tracking
  useEffect(() => {
    if (story?.id) {
      api.post(`/public/stories/${story.id}/view/`, {
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }).catch(() => { });
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
  }, [story]);

  const handleLikeClick = async () => {
    if (!story) return;

    if (!isAuthenticated) {
      setShowLikeModal(true);
      return;
    }

    try {
      if (!liked) {
        const res = await api.post(`/public/stories/${story.slug || story.id}/like/`);
        const newLikes = res.data?.data?.likes_count ?? res.data?.likes_count;
        setLiked(true);
        setLikesCount((prev) => (typeof newLikes === "number" ? newLikes : prev + 1));
        toast.success("Story Liked!", {
          description: `You gave love to "${story.title}".`,
        });
      } else {
        const res = await api.delete(`/public/stories/${story.slug || story.id}/like/`);
        const newLikes = res.data?.data?.likes_count ?? res.data?.likes_count;
        setLiked(false);
        setLikesCount((prev) => (typeof newLikes === "number" ? newLikes : Math.max(0, prev - 1)));
        toast.success("Like Removed");
      }
    } catch (err: any) {
      toast.error("Like Action Failed", { description: err.message });
    }
  };

  const handleBookmarkClick = async () => {
    if (!story) return;
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={story.title}
      />

      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article>
        <header className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-b from-primary/15 via-primary/[0.08] to-primary/[0.03] dark:from-primary/20 dark:via-primary/10 dark:to-zinc-950/40 dark:border-primary/25 shadow-xs">
          {/* Brand primary atmospheric glow in both light & dark mode */}
          <div className="pointer-events-none absolute inset-0 bg-radial from-primary/20 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-primary/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-[920px] px-5 pt-6 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-subtle">
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <span className="px-2">/</span>
                <Link to="/stories" className="hover:text-primary transition-colors">
                  Stories
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <CategoryPill>{story.category?.name || "General"}</CategoryPill>
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-subtle font-medium">
                  <Clock className="size-3.5" /> {story.estimated_reading_time || 5} min read
                </span>
              </div>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-heading sm:text-5xl lg:text-[3.25rem] leading-[1.12]">
              {story.title}
            </h1>
            <p className="mt-2 font-display text-lg text-body sm:text-xl leading-relaxed">
              {story.subtitle || "A quiet piece of prose written for thoughtful readers."}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-4">
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
                  <p className="text-[0.8125rem] text-subtle" suppressHydrationWarning>
                    Published {formatDate(story.published_at)}
                  </p>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
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
                <Button
                  variant="ghostOutline"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="gap-1.5"
                  title="Share this story"
                >
                  <Share2 className="size-4 text-subtle" />
                  Share
                </Button>

              </div>
            </div>
          </div>
        </header>

        {/* Centered Story Content */}
        <div className="mx-auto max-w-[900px] px-5 py-14 lg:px-8">
          <div className="min-w-0 prose prose-lg max-w-none text-body font-serif leading-relaxed text-[1.125rem] space-y-6 break-words [overflow-wrap:anywhere]">
            {story.content ? (
              story.content.includes("<p>") || story.content.includes("<br") || story.content.includes("<div") ? (
                <div dangerouslySetInnerHTML={{ __html: story.content }} className="break-words [overflow-wrap:anywhere]" />
              ) : (
                story.content
                  .split(/\n{2,}|\r\n\r\n/)
                  .map((paragraph: string) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph: string, idx: number) => (
                    <p key={idx} className="whitespace-pre-line leading-relaxed mb-6 font-serif text-[1.125rem] text-body break-words [overflow-wrap:anywhere]">
                      {paragraph}
                    </p>
                  ))
              )
            ) : (
              <p className="text-lg leading-relaxed text-body break-words [overflow-wrap:anywhere]">{story.subtitle || "Full story text content."}</p>
            )}
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
                  date: formatDate(s.published_at, "Recent"),
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
