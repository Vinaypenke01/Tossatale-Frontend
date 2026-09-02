import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Eye, Film, Heart, Link2, Play, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal, useScrollProgress } from "@/components/tossa/Reveal";
import { VideosGridSkeleton } from "@/components/tossa/Skeletons";
import { Button, ButtonLink, CategoryPill, Panel, XIcon } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/videos/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/public/videos/${params.slug}/`);
      const videoData = res.data?.data || res.data;
      if (videoData && (videoData.title || videoData.id || videoData.slug)) {
        return { video: videoData };
      }
    } catch {
      // Return null if not found
    }
    return { video: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.video) {
      return {
        meta: [{ title: "Video not found — tossatale" }, { name: "robots", content: "noindex" }],
      };
    }
    const { video } = loaderData;
    return {
      meta: [
        { title: `${video.title} — tossatale video library` },
        { name: "description", content: video.editorial_note || "Watch short film on tossatale" },
        { property: "og:title", content: `${video.title} — tossatale video library` },
        { property: "og:description", content: video.editorial_note || "Watch short film on tossatale" },
        { property: "og:type", content: "video.other" },
      ],
    };
  },
  notFoundComponent: VideoNotFound,
  component: VideoDetail,
});

function youtubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function VideoNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-4xl font-display font-bold text-heading">Video not found</h1>
        <p className="mt-4 text-body">
          The film or video conversation you are looking for is unavailable or has been removed.
        </p>
        <div className="mt-8">
          <ButtonLink to="/videos">Browse Video Library</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  );
}

function FloatingShare() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="mr-2 text-[0.75rem] font-bold text-subtle uppercase">Share</span>
      {[
        { icon: XIcon, label: "Share on X" },
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
          className="grid size-9 place-items-center rounded-full border border-border bg-surface text-subtle shadow-xs transition-all hover:border-primary hover:text-primary"
        >
          <item.icon className="size-4" />
        </button>
      ))}
      {copied && <span className="text-[0.75rem] font-medium text-primary">Link copied!</span>}
    </div>
  );
}

function VideoDetail() {
  const loaderData = Route.useLoaderData();
  const video = loaderData?.video;
  const progress = useScrollProgress();
  const [liked, setLiked] = useState(false);

  const ytId = useMemo(
    () => video?.youtube_id || youtubeId(video?.youtube_url || "") || "dQw4w9WgXcQ",
    [video]
  );

  const { data: relatedVideos, isLoading: isRelatedLoading } = useQuery({
    queryKey: ["public-videos-related", video?.id, video?.slug],
    queryFn: async () => {
      try {
        const res = await api.get("/public/videos/");
        let items = res.data?.results || res.data?.data || res.data || [];
        return items.filter((item: any) => item.slug !== video?.slug && item.id !== video?.id);
      } catch {
        return [];
      }
    },
    enabled: !!video,
  });

  if (!video) {
    return <VideoNotFound />;
  }

  return (
    <SiteLayout>
      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article>
        {/* Header Section */}
        <header className="border-b border-border paper-gradient">
          <div className="mx-auto max-w-[1100px] px-5 pt-12 pb-10 lg:px-8">
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-subtle">
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
              <span className="px-2">/</span>
              <Link to="/videos" className="hover:text-primary">
                Video Library
              </Link>
              <span className="px-2">/</span>
              <span className="text-body">{video.title}</span>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CategoryPill>{video.category?.name || video.series_name || "Documentary"}</CategoryPill>
              {video.duration && (
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-subtle">
                  <Clock className="size-3.5" /> {video.duration}
                </span>
              )}
              {video.views_count && (
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-subtle">
                  <Eye className="size-3.5" /> {video.views_count} views
                </span>
              )}
            </div>

            <h1 className="mt-4 text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.1] font-display font-bold text-heading">
              {video.title}
            </h1>
          </div>
        </header>

        {/* Playable Video Player Container */}
        <div className="bg-zinc-950 py-10 shadow-inner">
          <div className="mx-auto max-w-[1100px] px-5 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl">
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video Editorial Note & Actions Below Player */}
        <div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <Button
                variant={liked ? "primary" : "ghostOutline"}
                size="sm"
                onClick={() => setLiked((v) => !v)}
                className="gap-1.5"
              >
                <Heart className={cn("size-4", liked && "fill-current")} />
                {liked ? "Liked" : "Like Video"}
              </Button>
            </div>
            <FloatingShare />
          </div>

          {video.editorial_note && (
            <div className="mt-8 space-y-4">
              <h2 className="font-display text-xl font-bold text-heading">Editorial Note</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-body font-sans leading-relaxed whitespace-pre-line">
                {video.editorial_note}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* More Videos Section at the end */}
      {relatedVideos && relatedVideos.length > 0 && (
        <section className="border-t border-border bg-surface-alt/50 py-16">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-heading">
                  More from the Video Library
                </h2>
                <p className="mt-1 text-sm text-subtle">
                  Explore other short documentaries and unhurried writer conversations.
                </p>
              </div>
              <Link
                to="/videos"
                className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-bold text-primary"
              >
                View all videos
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {isRelatedLoading ? (
              <VideosGridSkeleton count={3} />
            ) : relatedVideos && relatedVideos.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedVideos.slice(0, 3).map((v: any, i: number) => {
                  const itemYtId = v.youtube_id || youtubeId(v.youtube_url || "") || "default";
                  const thumb = v.cover || v.thumbnail_url || `https://img.youtube.com/vi/${itemYtId}/hqdefault.jpg`;

                  return (
                    <Reveal key={v.slug || v.id} delay={i * 70}>
                      <Link to="/videos/$slug" params={{ slug: v.slug }}>
                        <Panel hover className="group h-full overflow-hidden flex flex-col justify-between">
                          <div>
                            <div className="relative aspect-video w-full overflow-hidden bg-black">
                              <img
                                src={thumb}
                                alt={v.title}
                                loading="lazy"
                                className="size-full object-cover opacity-90 transition-transform duration-[1200ms] group-hover:scale-105"
                              />
                              <span className="absolute inset-0 grid place-items-center bg-black/25">
                                <span className="grid size-12 place-items-center rounded-full bg-white/90 shadow-md transition-transform group-hover:scale-110">
                                  <Play className="size-5 text-primary fill-current translate-x-0.5" />
                                </span>
                              </span>
                            </div>
                            <div className="p-6">
                              <CategoryPill>{v.series_name || v.category?.name || "Documentary"}</CategoryPill>
                              <h3 className="mt-3 font-display text-[1.15rem] font-bold text-heading line-clamp-2 min-h-[3.25rem]">
                                {v.title}
                              </h3>
                            </div>
                          </div>
                          <div className="px-6 pb-6 pt-2 border-t border-border/40 text-[0.8125rem] text-subtle">
                            Watch video film
                          </div>
                        </Panel>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
