import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Clock,
  Heart,
  Layers,
  List,
  Share2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { ChapterNav } from "@/components/tossa/ChapterNav";
import { TableOfContents } from "@/components/tossa/TableOfContents";
import { LikeAuthModal } from "@/components/auth/LikeAuthModal";
import { useAuth } from "@/components/auth/AuthContext";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  VerifiedBadge,
} from "@/components/tossa/kit";
import { cn, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/stories/$slug/chapters/$chapterOrder")({
  loader: async ({ params }) => {
    try {
      const orderNum = parseInt(params.chapterOrder, 10) || 1;
      const [storyRes, chapterRes] = await Promise.all([
        api.get(`/public/stories/${params.slug}/`),
        api.get(`/public/stories/${params.slug}/chapters/${orderNum}/`).catch(() => null),
      ]);

      const story = storyRes.data?.data || storyRes.data;
      let chapter = chapterRes?.data?.data || chapterRes?.data;

      // Fallback to searching chapters list inside story if direct endpoint returned 404
      if (!chapter && story?.chapters && Array.isArray(story.chapters) && story.chapters.length > 0) {
        chapter = story.chapters.find((c: any) => c.order === orderNum);
        if (!chapter && orderNum === 1) {
          chapter = story.chapters[0];
        } else if (!chapter && orderNum > 0 && orderNum <= story.chapters.length) {
          chapter = story.chapters[orderNum - 1];
        }
      }

      return {
        story: story || null,
        chapter: chapter || null,
        currentOrder: orderNum,
      };
    } catch {
      return { story: null, chapter: null, currentOrder: 1 };
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.story) {
      return { meta: [{ title: "Chapter not found — tossatale" }] };
    }
    const { story, chapter, currentOrder } = loaderData;
    const chapterTitle = chapter?.title || `Chapter ${currentOrder}`;
    const desc = `${chapterTitle} of ${story.title} by ${story.writer?.name || "Author"} on tossatale.`;
    return {
      meta: [
        { title: `${chapterTitle} — ${story.title} — tossatale` },
        { name: "description", content: desc },
        { property: "og:title", content: `${chapterTitle} — ${story.title}` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: ChapterNotFound,
  component: ChapterReader,
});

function ChapterNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-5 py-32 text-center">
        <h1 className="text-4xl font-display font-bold text-heading">Chapter Not Found</h1>
        <p className="mt-4 text-body">
          This chapter could not be located in the story archive.
        </p>
        <div className="mt-8">
          <ButtonLink to="/stories">Browse stories</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  );
}

function ChapterReader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { story, chapter, currentOrder } = Route.useLoaderData();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(Boolean(story?.is_liked));
  const [saved, setSaved] = useState(Boolean(story?.is_bookmarked));
  const [likesCount, setLikesCount] = useState<number>(story?.likes_count || story?.likes || 0);
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showToCDrawer, setShowToCDrawer] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sync like/bookmark status when story data is available
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

  // Scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!story || !chapter) {
    return <ChapterNotFound />;
  }

  const chapters: any[] = story.chapters || [];
  const currentChapterIndex = chapters.findIndex(
    (c: any) => (chapter.id && c.id === chapter.id) || c.order === currentOrder || c.order === chapter.order
  );
  const activeChapterNumber = currentChapterIndex >= 0 ? currentChapterIndex + 1 : currentOrder;
  const totalChapters = Math.max(chapters.length, activeChapterNumber, 1);
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const writerName = story.writer?.name || story.writer?.user?.full_name || "Author";
  const writerInitials = writerName.substring(0, 2).toUpperCase();

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
      router.invalidate();
      queryClient.invalidateQueries({ queryKey: ["public-homepage"] });
      queryClient.invalidateQueries({ queryKey: ["public-stories"] });
      queryClient.invalidateQueries({ queryKey: ["reader-bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["reader-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reader-history"] });
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
      router.invalidate();
      queryClient.invalidateQueries({ queryKey: ["public-homepage"] });
      queryClient.invalidateQueries({ queryKey: ["public-stories"] });
      queryClient.invalidateQueries({ queryKey: ["reader-bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["reader-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reader-history"] });
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
    <SiteLayout>
      <LikeAuthModal
        isOpen={showLikeModal}
        storyId={story.id}
        storyTitle={story.title}
        onClose={() => setShowLikeModal(false)}
        onLikeSuccess={(newCount) => {
          setLiked(true);
          setLikesCount(typeof newCount === "number" ? newCount : likesCount + 1);
        }}
      />

      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article>
        {/* Header Atmospheric Section */}
        <header className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-primary/[0.08] to-primary/[0.03] dark:from-primary/20 dark:via-primary/10 dark:to-zinc-950/40 shadow-md">
          <div className="pointer-events-none absolute inset-0 bg-radial from-primary/20 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-primary/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-[920px] px-5 pt-6 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-subtle flex items-center gap-1.5 flex-wrap">
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link to="/stories" className="hover:text-primary transition-colors">
                  Stories
                </Link>
                <span>/</span>
                <Link
                  to="/stories/$slug"
                  params={{ slug: story.slug }}
                  className="hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-[240px]"
                >
                  {story.title}
                </Link>
                <span>/</span>
                <span className="text-heading font-medium">Part {activeChapterNumber}</span>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowToCDrawer(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-heading hover:border-primary/50 transition-all cursor-pointer shadow-xs"
                >
                  <List className="size-3.5 text-primary" />
                  <span>Chapters ({totalChapters})</span>
                </button>
                <span className="inline-flex items-center gap-1 text-[0.8125rem] text-subtle font-medium">
                  <Clock className="size-3.5" /> {chapter.estimated_reading_time || 5} min read
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                  Chapter {String(activeChapterNumber).padStart(2, "0")}
                </span>
                <span className="text-xs text-subtle">· Part {activeChapterNumber} of {totalChapters}</span>
              </div>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-heading sm:text-4xl lg:text-[2.75rem] leading-[1.16]">
                {chapter.title || `Chapter ${activeChapterNumber}`}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-subtle">
                From the serialized story{" "}
                <Link
                  to="/stories/$slug"
                  params={{ slug: story.slug }}
                  className="font-bold text-heading hover:text-primary underline transition-colors"
                >
                  {story.title}
                </Link>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-4">
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
              </div>
            </div>
          </div>
        </header>

        {/* Centered Chapter Prose */}
        <div className="mx-auto max-w-[900px] px-5 py-12 lg:px-8 space-y-12">
          <div className="min-w-0 prose prose-lg max-w-none text-body font-serif leading-relaxed text-[1.125rem] space-y-6 break-words [overflow-wrap:anywhere]">
            {chapter.content ? (
              chapter.content.includes("<p>") || chapter.content.includes("<br") || chapter.content.includes("<div") ? (
                <div dangerouslySetInnerHTML={{ __html: chapter.content }} className="break-words [overflow-wrap:anywhere]" />
              ) : (
                chapter.content
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
              <p className="text-lg leading-relaxed text-subtle italic">
                No chapter content written yet.
              </p>
            )}
          </div>

          {/* Bottom Episode Navigation Bar */}
          <ChapterNav
            storySlug={story.slug}
            storyTitle={story.title}
            currentOrder={activeChapterNumber}
            totalChapters={totalChapters}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            onOpenToC={() => setShowToCDrawer(true)}
          />
        </div>
      </article>

      {/* Table of Contents Drawer / Modal */}
      {showToCDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-heading">
                  {story.title}
                </h3>
                <p className="text-xs text-subtle">Select a chapter to jump directly to it</p>
              </div>
              <button
                type="button"
                onClick={() => setShowToCDrawer(false)}
                className="size-8 grid place-items-center rounded-full hover:bg-surface-alt text-subtle hover:text-heading transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <TableOfContents
                storySlug={story.slug}
                chapters={chapters}
                activeOrder={currentOrder}
                onSelectChapter={() => setShowToCDrawer(false)}
              />
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
