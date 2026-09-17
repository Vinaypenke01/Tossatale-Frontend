import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Eye, Heart, Mail, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

import heroArt from "@/assets/Hero_section_pic.jpeg";
import coverBoat from "@/assets/cover-boat.jpg";
import coverLane from "@/assets/cover-lane.jpg";
import { SiteLayout } from "@/components/tossa/SiteLayout";
import { UnderConstruction } from "@/components/tossa/UnderConstruction";
import { Reveal } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import {
  FeaturedStoriesSkeletonCards,
  LatestStoriesSkeletonCards,
  TrendingStoriesSkeletonRows,
  LatestBlogsSkeletonCards,
  VideoLibrarySkeletonCards,
} from "@/components/tossa/Skeletons";
import {
  Avatar,
  Button,
  CategoryPill,
  Input,
  Panel,
  SectionHeading,
  VerifiedBadge,
} from "@/components/tossa/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "tossatale - We are Storytellers, always." },
      {
        name: "description",
        content:
          "Discover stories, meet the writers behind them, and explore a world of storytelling through short stories, blogs, and films.",
      },
      { property: "og:title", content: "tossatale - We are Storytellers, always." },
      {
        property: "og:description",
        content:
          "Discover stories, meet the writers behind them, and explore a world of storytelling through short stories, blogs, and films.",
      },
    ],
  }),
  component: Home,
});

function Hero() {
  return (
    <section className="relative overflow-hidden bg-heading">
      <div className="relative w-full">
        {/* Full Image in total natural aspect ratio without cropping top or bottom */}
        <img
          src={heroArt}
          alt="Illustrated river ghats at dusk with temples, boats and figures on the steps"
          width={1920}
          height={1080}
          className="w-full h-auto block object-contain"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/60" />

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 lg:p-10 text-center">
          <div className="animate-fade-up max-w-4xl mx-auto flex flex-col items-center">
            <span className="font-sans text-[0.6875rem] sm:text-[0.8125rem] font-extrabold tracking-[0.25em] text-white/90 uppercase">
              NEW STORIES. MORE OFTEN.
            </span>
            <h1 className="mt-2 sm:mt-4 text-[clamp(1.35rem,4.5vw,4.8rem)] leading-tight text-white font-display font-bold sm:whitespace-nowrap break-words">
              We are Storytellers, always.
            </h1>
            <div className="mt-4 sm:mt-8">
              <Link
                to="/stories"
                className="group inline-flex items-center gap-1 font-sans text-sm sm:text-lg font-bold text-white transition-colors hover:text-[#FF6B35] relative pb-1"
              >
                <span>Read Stories</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transition-colors group-hover:bg-[#FF6B35]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionDivider() {
  return (
    <div className="bg-slate-50 dark:bg-black">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="border-b border-black/10 dark:border-white/15" />
      </div>
    </div>
  );
}

function HandpickedTales({ stories, isLoading }: { stories?: any[]; isLoading?: boolean }) {
  const displayList = (stories && Array.isArray(stories) && stories.length > 0)
    ? stories.slice(0, 2)
    : [];

  return (
    <section className="bg-slate-50 dark:bg-black py-16 lg:py-20">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            title="Handpicked tales"
          />
        </Reveal>

        {isLoading ? (
          <FeaturedStoriesSkeletonCards />
        ) : displayList.length === 0 ? (
          <EmptySectionFallback
            icon="write"
            title="No Handpicked Tales Yet"
            description="Selected short stories from our original collection will appear here."
          />
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 md:grid-cols-2">
            {displayList.map((story, i) => (
              <Reveal key={story.slug || i} delay={i * 70}>
                <div className="group flex flex-col justify-between h-full rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 p-5 sm:p-7 lg:p-9">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <CategoryPill>{story.category?.name || story.category || "Featured"}</CategoryPill>
                    </div>

                    <h2 className="mt-3.5 sm:mt-4 line-clamp-2 text-[clamp(1.2rem,2vw,1.75rem)] leading-snug text-heading font-display font-bold break-words">
                      {story.title}
                    </h2>
                    <p className="mt-2.5 sm:mt-3.5 line-clamp-4 text-[0.875rem] sm:text-[0.9375rem] leading-relaxed text-body break-words">
                      {story.subtitle || story.seo_description || "A longform story selected by our editorial team."}
                    </p>
                  </div>

                  <div className="mt-6 sm:mt-8 border-t border-divider pt-4 sm:pt-5">
                    <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                      <Link
                        to="/writers/$slug"
                        params={{ slug: story.writer?.slug || "writer" }}
                        className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 group/author"
                      >
                        <Avatar
                          src={story.writer?.profile_photo}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 font-sans text-[0.8125rem] sm:text-[0.875rem] font-bold text-heading truncate group-hover/author:text-primary transition-colors">
                            {story.writer?.name || story.writer?.user?.full_name || "Author"} {story.writer?.is_verified && <VerifiedBadge />}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.6875rem] sm:text-[0.75rem] text-subtle mt-0.5">
                            <span>{story.published_at ? new Date(story.published_at).toLocaleDateString() : "Recent"}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <Clock className="size-3 text-emerald-500" /> {story.estimated_reading_time || 5} min read
                            </span>
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/stories/$slug"
                        params={{ slug: story.slug }}
                        className="group/read shrink-0 font-sans text-[0.8125rem] sm:text-[0.875rem] font-bold text-heading hover:text-[#FF6B35] transition-colors relative pb-0.5 whitespace-nowrap"
                      >
                        <span>Read story</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-200 group-hover/read:w-full" />
                      </Link>
                    </div>

                    {/* Metadata Row: Colored icons with standard text counts */}
                    <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-divider flex items-center justify-between text-[0.75rem] sm:text-[0.8125rem]">
                      <div className="flex items-center gap-3.5 sm:gap-4">
                        <span className="inline-flex items-center gap-1.5" title="Likes">
                          <Heart className={cn("size-3.5 transition-colors", story.is_liked ? "text-rose-500 fill-rose-500" : "text-rose-500/60 fill-rose-500/20")} />
                          <span className={cn("font-bold text-[0.75rem] sm:text-[0.8125rem]", story.is_liked ? "text-rose-600 dark:text-rose-400" : "text-black dark:text-white")}>
                            {story.likes_count ?? story.likes ?? 0}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5" title="Views">
                          <Eye className="size-3.5 text-blue-500" />
                          <span className="font-bold text-black dark:text-white text-[0.75rem] sm:text-[0.8125rem]">{story.views_count ?? story.views ?? 0}</span>
                        </span>
                      </div>
                      <span className="text-subtle text-[0.6875rem] sm:text-[0.75rem] shrink-0">Must Read</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LatestStories({ stories, isLoading }: { stories?: any[]; isLoading?: boolean }) {
  return (
    <section className="bg-slate-50 dark:bg-black py-16 lg:py-20">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Newly added"
            title="Latest stories"
            blurb="From quick reads to stories in chapters."
            action={{ label: "All stories", to: "/stories" }}
          />
        </Reveal>

        {isLoading ? (
          <LatestStoriesSkeletonCards />
        ) : !stories || stories.length === 0 ? (
          <EmptySectionFallback
            icon="write"
            title="No Published Stories Yet"
            description="Authors are currently working on new pieces. Once approved by editors, new stories will appear here."
          />
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.slice(0, 3).map((story, i) => (
              <Reveal key={story.slug} delay={i * 70}>
                <StoryCard story={{
                  id: story.id,
                  slug: story.slug,
                  title: story.title,
                  dek: story.subtitle || story.seo_description || "A longform story.",
                  writer: story.writer?.slug || "writer",
                  writerName: story.writer?.name || story.writer?.user?.full_name || "Author",
                  writerPhoto: story.writer?.profile_photo || "",
                  category: story.category?.name || "General",
                  date: story.published_at ? new Date(story.published_at).toLocaleDateString() : "Recent",
                  readingTime: story.estimated_reading_time || 5,
                  cover: story.cover_image || coverLane,
                  views: story.views_count || 0,
                  likes: story.likes_count || 0,
                  likes_count: story.likes_count || 0,
                  is_liked: Boolean(story.is_liked),
                  is_bookmarked: Boolean(story.is_bookmarked),
                } as any} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Trending({ stories, isLoading }: { stories?: any[]; isLoading?: boolean }) {
  return (
    <section className="bg-slate-50 dark:bg-black py-16 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Popular now"
            title="Trending stories"
            blurb="The most-read, liked, and bookmarked tales across tossatale."
          />
        </Reveal>

        {isLoading ? (
          <TrendingStoriesSkeletonRows />
        ) : !stories || stories.length === 0 ? (
          <EmptySectionFallback
            icon="sparkles"
            title="No Trending Stories Yet"
            description="As community readers explore and bookmark stories, top trending longform pieces will display here."
          />
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.slice(0, 6).map((story, i) => (
              <Reveal key={story.slug || i} delay={i * 50} className="h-full">
                <div className="group flex items-start gap-4 sm:gap-5 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 p-5 sm:p-6 border border-slate-200/90 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Big Number */}
                  <span className="font-sans text-[2.1rem] sm:text-[2.25rem] font-black leading-none text-slate-300 dark:text-zinc-700 shrink-0 select-none w-10 group-hover:text-primary transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                    <div>
                      {/* Author */}
                      <Link
                        to="/writers/$slug"
                        params={{ slug: story.writer?.slug || "writer" }}
                        className="flex items-center gap-2 group/author w-max max-w-full"
                      >
                        <Avatar src={story.writer?.profile_photo} size="xs" />
                        <span className="font-sans text-[0.8125rem] font-bold text-heading truncate group-hover/author:text-primary transition-colors">
                          {story.writer?.name || story.writer?.user?.full_name || "Author"}
                        </span>
                        {story.writer?.is_verified && <VerifiedBadge />}
                      </Link>

                      {/* Title — single line */}
                      <div className="mt-1.5">
                        <h3
                          className="truncate font-display text-[1.0625rem] sm:text-[1.125rem] font-bold text-heading leading-snug"
                          title={story.title}
                        >
                          {story.title}
                        </h3>
                      </div>
                    </div>

                    {/* Metadata & Read story */}
                    <div className="mt-3 flex items-center justify-between gap-3 text-[0.75rem]">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-subtle">
                          <Clock className="size-3 text-emerald-500" />
                          <span>{story.estimated_reading_time || 5}m</span>
                        </span>
                        <span className="inline-flex items-center gap-1" title="Likes">
                          <Heart className={cn("size-3 transition-colors", story.is_liked ? "text-rose-500 fill-rose-500" : "text-rose-500/60 fill-rose-500/20")} />
                          <span className={cn("font-bold", story.is_liked ? "text-rose-600 dark:text-rose-400" : "text-black dark:text-white")}>
                            {story.likes_count ?? story.likes ?? 0}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1" title="Views">
                          <Eye className="size-3.5 text-blue-500" />
                          <span className="font-bold text-black dark:text-white">{story.views_count ?? story.views ?? 0}</span>
                        </span>
                      </div>

                      <Link
                        to="/stories/$slug"
                        params={{ slug: story.slug }}
                        className="group/read font-sans text-[0.8125rem] font-bold text-heading hover:text-[#FF6B35] transition-colors relative pb-0.5 shrink-0"
                      >
                        <span>Read story</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-200 group-hover/read:w-full" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LatestBlogs({ blogs, isLoading }: { blogs?: any[]; isLoading?: boolean }) {
  return (
    <section className="bg-slate-50 dark:bg-black py-16 lg:py-20">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="More to discover"
            title="From the blogs"
            action={{ label: "View all", to: "/blogs" }}
          />
        </Reveal>

        {isLoading ? (
          <LatestBlogsSkeletonCards />
        ) : !blogs || blogs.length === 0 ? (
          <EmptySectionFallback
            icon="blog"
            title="No Editorial Blogs Yet"
            description="Craft essays, author interviews and behind-the-scenes posts will appear here."
          />
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {blogs.slice(0, 4).map((b, i) => (
              <Reveal key={b.slug} delay={i * 70}>
                <div className="group flex h-full flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1">
                  <img
                    src={b.cover_image || "/assets/cover-terrace.jpg"}
                    alt=""
                    loading="lazy"
                    width={1200}
                    height={800}
                    className="h-36 w-full sm:w-44 sm:h-36 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-[1.125rem] leading-snug font-display font-bold text-heading line-clamp-2">
                        {b.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[0.875rem] text-body leading-relaxed">
                        {b.excerpt || b.seo_description || "Blog article."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-divider">
                      <p className="text-[0.75rem] text-subtle flex items-center gap-1.5">
                        <span>{b.published_at ? new Date(b.published_at).toLocaleDateString() : "Recent"}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-emerald-500" /> {b.reading_time || 4} min
                        </span>
                      </p>

                      <Link
                        to="/blogs/$slug"
                        params={{ slug: b.slug }}
                        className="group/read font-sans text-[0.8125rem] font-bold text-heading hover:text-[#FF6B35] transition-colors relative pb-0.5"
                      >
                        <span>Read story</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-200 group-hover/read:w-full" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VideoLibrary({ videos, isLoading }: { videos?: any[]; isLoading?: boolean }) {
  return (
    <section className="bg-slate-50 dark:bg-black py-16 lg:py-20">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Watch"
            title="Latest short films"
            blurb="From stories to screen."
            action={{ label: "View all", to: "/videos" }}
          />
        </Reveal>

        {isLoading ? (
          <VideoLibrarySkeletonCards />
        ) : !videos || videos.length === 0 ? (
          <EmptySectionFallback
            icon="video"
            title="No Films in Video Library"
            description="Short films and writer conversations are currently in production and will be published here."
          />
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {videos.slice(0, 2).map((v, i) => (
              <Reveal key={v.slug || v.id || i} delay={i * 70}>
                <div className="group block h-full">
                  <div className="flex flex-col h-full rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 p-5 sm:p-6 border border-slate-200/90 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1">
                    <div className="relative overflow-hidden rounded-xl aspect-video w-full">
                      <img
                        src={v.thumbnail_url || coverBoat}
                        alt={v.title}
                        loading="lazy"
                        width={1200}
                        height={800}
                        className="w-full h-full object-cover"
                      />
                      <Link
                        to="/videos/$slug"
                        params={{ slug: v.slug || "video" }}
                        className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Play ${v.title}`}
                      >
                        <span className="grid size-14 place-items-center rounded-full bg-white text-primary shadow-lift">
                          <Play className="size-6 translate-x-0.5 fill-primary" />
                        </span>
                      </Link>
                      {v.duration && (
                        <span className="absolute right-3 bottom-3 rounded-full bg-heading/80 px-2.5 py-0.5 text-[0.75rem] font-bold text-white backdrop-blur">
                          {v.duration}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 text-center flex-1 flex flex-col justify-between">
                      <h3 className="text-[1.25rem] leading-snug font-display font-bold text-heading">
                        {v.title}
                      </h3>
                      <div className="mt-3">
                        <Link
                          to="/videos/$slug"
                          params={{ slug: v.slug || "video" }}
                          className="font-sans text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Watch film →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section id="newsletter" className="relative overflow-hidden bg-slate-50 dark:bg-black pt-12 sm:pt-16 pb-4 sm:pb-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/80 dark:border-zinc-800/80 bg-surface/90 dark:bg-zinc-900/90 p-6 sm:p-12 md:p-14 shadow-lg backdrop-blur-md text-center">
            {/* Ambient atmospheric brand glows */}
            <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-[#FF6B35]/15 blur-3xl" />

            <div className="relative z-10 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
                <Sparkles className="size-3.5 text-primary" />
                <span>Weekly Dispatch</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-heading leading-tight">
                Keep reading. Keep watching.
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-body">
                Get handpicked longform stories, essays, and short films delivered directly to your inbox every week.
              </p>

              <div className="mt-7 sm:mt-8">
                <NewsletterForm />
              </div>

              <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 text-xs text-subtle">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                <span>No spam, zero clutter. Unsubscribe anytime in one click.</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await api.post("/public/newsletter/subscribe/", { email });
      toast.success("Subscription email sent!", {
        description: "Please check your inbox to confirm your subscription.",
      });
      setEmail("");
    } catch (err: any) {
      toast.error("Subscription failed", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit} suppressHydrationWarning>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-subtle">
            <Mail className="size-4.5" />
          </div>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            suppressHydrationWarning
            className="h-12 sm:h-13 w-full rounded-2xl border border-border dark:border-zinc-700/80 bg-surface-alt/70 dark:bg-zinc-800/80 pl-11 pr-4 text-sm sm:text-base text-heading placeholder:text-subtle/70 transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </div>
        <button
          type="submit"
          suppressHydrationWarning
          disabled={isSubmitting}
          className="h-12 sm:h-13 shrink-0 rounded-2xl bg-[#FF6B35] hover:bg-[#e85b27] text-white font-bold px-7 text-sm sm:text-base shadow-sm transition-all hover:shadow-md cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <span>Subscribe</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function CatSignoff() {
  return (
    <div className="bg-slate-50 dark:bg-black pt-1 pb-8 sm:pb-10 flex flex-col items-center justify-center text-center select-none">
      <div className="relative group transition-transform duration-300 hover:scale-105">
        <svg
          viewBox="0 0 160 90"
          className="w-28 h-16 sm:w-32 sm:h-18 text-slate-700 dark:text-zinc-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Yarn Ball with dynamic wound texture */}
          <circle cx="144" cy="68" r="8" className="fill-[#FF6B35]/20 stroke-[#FF6B35]" strokeWidth="1.75" />
          <path d="M140 63 C144 68 144 72 148 73" stroke="#FF6B35" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M138 69 C144 67 148 70 151 66" stroke="#FF6B35" strokeWidth="1.25" strokeLinecap="round" />
          {/* Thread trailing towards the cat's playful paw */}
          <path d="M136 71 C130 75 125 70 120 73" stroke="#FF6B35" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="2 2" />

          {/* Realistic Sleek Playing Cat Body */}
          <path
            d="M 28 20
               C 22 20, 16 28, 16 38
               C 16 48, 24 58, 36 60
               C 34 68, 36 78, 44 80
               C 49 80, 52 76, 54 70
               C 70 70, 88 68, 102 72
               L 106 80
               C 108 82, 114 82, 116 78
               L 118 72
               C 122 71, 128 73, 134 72
               C 137 71, 137 68, 133 67
               C 126 66, 120 62, 116 54
               C 122 52, 128 47, 130 42
               C 131 39, 130 36, 126 36
               L 128 24
               C 128 22, 125 22, 122 25
               L 116 32
               C 112 30, 106 30, 102 32
               L 96 25
               C 93 22, 90 22, 90 24
               L 92 36
               C 86 42, 86 48, 88 52
               C 74 46, 56 46, 44 50
               C 36 46, 30 36, 32 26
               C 33 22, 31 20, 28 20 Z"
            className="fill-slate-800 dark:fill-zinc-200"
          />

          {/* Inner Ears - Soft Pink Accents */}
          <path d="M 94 28 L 96 25 L 102 32 Z" className="fill-rose-300/80 dark:fill-rose-400/60" />
          <path d="M 124 26 L 126 24 L 118 32 Z" className="fill-rose-300/80 dark:fill-rose-400/60" />

          {/* Expressive Cat Eye (Amber Iris + Slit Pupil + Catchlight Highlight) */}
          <ellipse cx="120" cy="38" rx="4" ry="2.6" transform="rotate(-10 120 38)" className="fill-amber-400" />
          <ellipse cx="120.3" cy="38" rx="1.6" ry="2.4" transform="rotate(-10 120.3 38)" className="fill-slate-950 dark:fill-black" />
          <circle cx="119.2" cy="36.8" r="0.9" className="fill-white" />
          <circle cx="121.2" cy="39" r="0.4" className="fill-white/80" />
          <path d="M 115.5 36.5 C 118 34, 123 34.5, 125.5 37.5" className="stroke-slate-950 dark:stroke-zinc-900" strokeWidth="1" strokeLinecap="round" />

          {/* Cute Nose & Whiskers */}
          <path d="M 129 42 L 132 43 L 130 45 Z" className="fill-[#FF6B35]" />
          <path d="M 130 45 Q 128 47.5 125 46.5 M 130 45 Q 131 47.5 133 46" className="stroke-slate-400 dark:stroke-zinc-500" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M 128 43.5 L 140 40.5 M 129 45.5 L 142 45.5 M 128 47.5 L 139 50.5" className="stroke-slate-400 dark:stroke-zinc-400" strokeWidth="0.8" strokeLinecap="round" />

          {/* Playful Paw Pads Accent on Batting Paw */}
          <circle cx="132" cy="70" r="1.3" className="fill-[#FF6B35]" />
          <circle cx="129.8" cy="69" r="0.75" className="fill-[#FF6B35]/80" />
          <circle cx="133.8" cy="71" r="0.75" className="fill-[#FF6B35]/80" />
        </svg>
      </div>
      <p className="mt-2 font-serif italic text-sm sm:text-base text-subtle tracking-wide">
        That’s all for now!
      </p>
    </div>
  );
}

function Home() {
  const isUnderConstruction = import.meta.env.VITE_UNDER_CONSTRUCTION === "true";

  // Single stitched endpoint loading all homepage content in 1 request
  const { data: homepageData, isLoading } = useQuery({
    queryKey: ["public-homepage"],
    queryFn: async () => {
      const res = await api.get("/public/homepage/");
      return res.data || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh in React Query cache
  });

  if (isUnderConstruction) {
    return <UnderConstruction />;
  }

  const featuredStoriesData = homepageData?.featured_stories || [];
  const latestStoriesData = homepageData?.latest_stories || [];
  const trendingStoriesData = homepageData?.trending_stories || [];
  const blogsData = homepageData?.featured_blogs || [];
  const videosData = homepageData?.latest_videos || [];
  const announcementData = homepageData?.announcement || undefined;
  const footerData = homepageData?.footer || undefined;

  return (
    <SiteLayout announcement={announcementData} footer={footerData}>
      <Hero />
      <HandpickedTales stories={featuredStoriesData} isLoading={isLoading} />
      <SectionDivider />
      <LatestStories stories={latestStoriesData} isLoading={isLoading} />
      <SectionDivider />
      <Trending stories={trendingStoriesData} isLoading={isLoading} />
      <SectionDivider />
      <LatestBlogs blogs={blogsData} isLoading={isLoading} />
      <SectionDivider />
      <VideoLibrary videos={videosData} isLoading={isLoading} />
      <SectionDivider />
      <Newsletter />
      <CatSignoff />
    </SiteLayout>
  );
}
