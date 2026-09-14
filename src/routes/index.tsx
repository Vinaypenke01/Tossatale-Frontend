import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Eye, Heart, Mail, Play } from "lucide-react";
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

function FeaturedStories({ stories, isLoading }: { stories?: any[]; isLoading?: boolean }) {
  const displayList = (stories && Array.isArray(stories) && stories.length > 0)
    ? stories.slice(0, 2)
    : [];

  return (
    <section className="bg-slate-50 dark:bg-black py-12 sm:py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Featured"
            title="Featured stories"
          />
        </Reveal>

        {isLoading ? (
          <FeaturedStoriesSkeletonCards />
        ) : displayList.length === 0 ? (
          <EmptySectionFallback
            icon="write"
            title="No Featured Stories Yet"
            description="Selected longform narratives handpicked by our editorial desk will appear here."
          />
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 md:grid-cols-2">
            {displayList.map((story, i) => (
              <Reveal key={story.slug || i} delay={i * 70}>
                <div className="group flex flex-col justify-between h-full rounded-2xl bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 p-5 sm:p-7 lg:p-9 border-none">
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
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="size-8 sm:size-9 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-[0.75rem] sm:text-[0.8125rem] grid place-items-center shrink-0">
                          {((story.writer?.name || story.writer?.user?.full_name || "Author").substring(0, 2)).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 font-sans text-[0.8125rem] sm:text-[0.875rem] font-bold text-heading truncate">
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
                      </div>

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
                          <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />
                          <span className="font-bold text-black dark:text-white text-[0.75rem] sm:text-[0.8125rem]">{story.likes_count ?? story.likes ?? 0}</span>
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
            blurb="The most-read, liked, and bookmarked pieces across tossatale."
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
                <div className="group flex items-start gap-4 sm:gap-5 rounded-2xl bg-surface p-5 sm:p-6 border border-border/80 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 h-full">
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
                        <div className="size-5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-[0.625rem] grid place-items-center shrink-0">
                          {((story.writer?.name || story.writer?.user?.full_name || "Author").substring(0, 2)).toUpperCase()}
                        </div>
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
                          <Heart className="size-3 text-rose-500 fill-rose-500/20" />
                          <span className="font-bold text-black dark:text-white">{story.likes_count ?? story.likes ?? 0}</span>
                        </span>
                        <span className="inline-flex items-center gap-1" title="Views">
                          <Eye className="size-3 text-blue-500" />
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
                <div className="group flex h-full flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 border-none">
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
                  <div className="flex flex-col h-full rounded-2xl bg-surface p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 border-none">
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
    <section id="newsletter" className="bg-slate-50 dark:bg-black py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
        <Reveal>
          <div className="rounded-3xl bg-surface p-8 sm:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-none">
            <h2 className="mx-auto text-[clamp(1.5rem,2.5vw,2.2rem)] leading-tight font-display font-bold text-heading">
              Keep reading. Keep watching.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-body">
              Get updates on new stories, short films, and upcoming releases directly in your inbox.
            </p>
            <NewsletterForm />
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
    <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} suppressHydrationWarning>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        suppressHydrationWarning
        className="h-11 bg-white dark:bg-zinc-800 border-border text-heading placeholder:text-subtle text-[0.875rem] rounded-xl flex-1"
      />
      <button
        type="submit"
        suppressHydrationWarning
        disabled={isSubmitting}
        className="h-11 shrink-0 rounded-xl bg-[#FF6B35] hover:bg-[#e85b27] text-white font-bold px-6 text-[0.875rem] shadow-xs transition-all hover:shadow-md cursor-pointer inline-flex items-center justify-center gap-2"
      >
        <Mail className="size-4" /> {isSubmitting ? "Submitting..." : "Subscribe"}
      </button>
    </form>
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
      <FeaturedStories stories={featuredStoriesData} isLoading={isLoading} />
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
    </SiteLayout>
  );
}
