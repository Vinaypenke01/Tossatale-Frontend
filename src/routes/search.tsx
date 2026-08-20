import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, SearchX, X, SlidersHorizontal, BookOpen, User, Tag, Sparkles, Flame, Clock, Heart, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { StoryCard } from "@/components/tossa/StoryCard";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  CategoryPill,
  EmptyState,
  Input,
  Panel,
  Skeleton,
  VerifiedBadge,
} from "@/components/tossa/kit";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import coverLane from "@/assets/cover-lane.jpg";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string; tab?: string; sort?: string } => {
    return {
      q: typeof search["q"] === "string" ? (search["q"] as string) : "",
      tab: typeof search["tab"] === "string" ? (search["tab"] as string) : "Stories",
      sort: typeof search["sort"] === "string" ? (search["sort"] as string) : "relevance",
    };
  },
  head: () => ({
    meta: [
      { title: "Search — tossatale" },
      {
        name: "description",
        content: "Search stories, series, writers and films across the tossatale library.",
      },
      { property: "og:title", content: "Search — tossatale" },
      { property: "og:description", content: "Search the whole tossatale library." },
    ],
  }),
  component: SearchPage,
});

const tabs = ["Stories", "Writers", "Categories", "Blogs"] as const;

const popularSuggestions = [
  "Father",
  "Magic",
  "Family",
  "Drama",
  "Adventure",
  "Fantasy",
  "Journey",
  "Memoir",
];

function SearchPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });

  const [query, setQuery] = useState(searchParams.q || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.q || "");
  const [tab, setTab] = useState<(typeof tabs)[number]>(
    (tabs.includes(searchParams.tab as any) ? searchParams.tab : "Stories") as (typeof tabs)[number]
  );
  const [sort, setSort] = useState(searchParams.sort || "relevance");

  // Sync debounced query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
      navigate({
        search: (prev) => ({
          ...prev,
          q: query.trim(),
          tab,
          sort,
        }),
        replace: true,
      });
    }, 280);
    return () => clearTimeout(handler);
  }, [query, tab, sort, navigate]);

  const { data: searchData, isLoading } = useQuery({
    queryKey: ["public-search", debouncedQuery, sort],
    queryFn: async () => {
      const qParam = debouncedQuery ? `q=${encodeURIComponent(debouncedQuery)}&` : "";
      const res = await api.get(
        `/public/search/?${qParam}sort=${sort}`
      );
      return res.data?.results || res.data || {};
    },
    staleTime: 60 * 1000,
  });

  const displayStories = (searchData?.stories && Array.isArray(searchData.stories))
    ? searchData.stories.map((s: any) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        dek: s.subtitle || s.seo_description || "A longform story worth reading.",
        writer: s.writer?.slug || "writer",
        writerName: s.writer?.name || s.writer?.user?.full_name || "Writer",
        writerGender: s.writer?.gender || "OTHER",
        writerPhoto: s.writer?.profile_photo || "",
        verified: s.writer?.is_verified || false,
        category: s.category?.name || "General",
        categorySlug: s.category?.slug || "general",
        date: s.published_at ? new Date(s.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent",
        readingTime: s.estimated_reading_time || 5,
        cover: s.cover_image || coverLane,
        tags: s.tags?.map((t: any) => t.name) || [],
        views: s.views_count || 0,
        likes: s.likes_count || 0,
        likes_count: s.likes_count || 0,
        is_liked: Boolean(s.is_liked),
        is_bookmarked: Boolean(s.is_bookmarked),
      }))
    : [];

  const displayWriters = (searchData?.writers && Array.isArray(searchData.writers))
    ? searchData.writers.map((w: any) => ({
        slug: w.slug,
        name: w.name || w.pen_name || w.user?.full_name || "Writer",
        initials: (w.name || w.pen_name || w.user?.full_name || "W").substring(0, 2).toUpperCase(),
        photo: w.profile_photo || "",
        gender: w.gender || "OTHER",
        bio: w.bio || "Contributing author and storyteller at tossatale.",
        verified: w.is_verified || false,
        totalStories: w.total_published_stories || 0,
        totalReads: w.total_reads || 0,
      }))
    : [];

  const displayCategories = (searchData?.categories && Array.isArray(searchData.categories))
    ? searchData.categories.map((c: any) => ({
        slug: c.slug || c.id,
        name: c.name,
        description: c.description || "Curated longform literary prose and serialized works.",
        count: typeof c.stories_count === "number" ? c.stories_count : 0,
      }))
    : [];

  const displayBlogs = (searchData?.blogs && Array.isArray(searchData.blogs))
    ? searchData.blogs.map((b: any) => ({
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle || "Editorial perspective & dispatch.",
        category: b.category?.name || "Editorial",
        readingTime: b.estimated_reading_time || 4,
        date: b.published_at ? new Date(b.published_at).toLocaleDateString() : "Recent",
      }))
    : [];

  const counts = {
    Stories: displayStories.length,
    Writers: displayWriters.length,
    Categories: displayCategories.length,
    Blogs: displayBlogs.length,
  };

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[860px] px-5 py-14 lg:py-18">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
              Global Library Search
            </span>
          </div>

          <h1 className="mt-2 text-[clamp(2.1rem,4.2vw,3.2rem)] font-display font-extrabold text-heading">
            Find stories, writers & themes
          </h1>

          <div className="relative mt-7">
            <SearchIcon className="absolute top-1/2 left-4.5 size-5 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tossatale"
              placeholder="Search by story title, author name, themes, or keywords…"
              className="h-14 pl-12 pr-12 text-[1.0625rem] bg-surface shadow-sm focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-subtle hover:text-heading"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.8125rem]">
            <span className="text-subtle font-medium flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> Popular searches:
            </span>
            {popularSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full border border-border/80 bg-surface/80 px-2.5 py-1 text-body font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Filter Tabs & Sort */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 pt-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
                    tab === t
                      ? "bg-primary text-white shadow-xs"
                      : "border border-border bg-surface text-body hover:border-primary hover:text-primary",
                  )}
                >
                  <span>{t}</span>
                  {debouncedQuery && (
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.6875rem]",
                      tab === t ? "bg-white/20 text-white" : "bg-surface-alt text-subtle"
                    )}>
                      {counts[t]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort selection */}
            <div className="flex items-center gap-2">
              <span className="text-[0.8125rem] text-subtle font-medium">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface px-3 font-sans text-[0.8125rem] font-semibold text-heading shadow-xs focus:border-primary focus:outline-hidden"
              >
                <option value="relevance">Most Relevant</option>
                <option value="popular">Most Read</option>
                <option value="likes">Most Liked</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Panel key={i} className="p-5">
                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </Panel>
            ))}
          </div>
        ) : counts[tab] === 0 ? (
          <EmptyState
            icon={<SearchX className="size-8 text-subtle" />}
            title={debouncedQuery ? `No ${tab.toLowerCase()} found for "${debouncedQuery}"` : `No ${tab.toLowerCase()} available`}
            blurb={debouncedQuery ? "Try adjusting your keywords, checking for typos, or switching tabs." : "Explore other sections or browse by category."}
            action={
              debouncedQuery ? (
                <Button
                  variant="ghostOutline"
                  size="md"
                  onClick={() => setQuery("")}
                >
                  Clear Search Query
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div>
            {!debouncedQuery && (
              <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-heading">
                    {tab === "Stories" ? "Featured & Trending Stories" : tab === "Writers" ? "Featured Storytellers" : tab === "Categories" ? "Explore Themes & Categories" : "Latest Editorial Dispatches"}
                  </h2>
                  <p className="text-xs text-subtle mt-0.5">
                    Browse popular titles and recommended selections across tossatale.
                  </p>
                </div>
                <span className="text-xs text-subtle font-medium">
                  {counts[tab]} {tab.toLowerCase()}
                </span>
              </div>
            )}

            {tab === "Stories" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayStories.map((s: any) => (
                  <StoryCard key={s.slug || s.id} story={s} />
                ))}
              </div>
            ) : tab === "Writers" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayWriters.map((w: any) => (
              <Panel key={w.slug} hover className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-4">
                    <Avatar initials={w.initials} size="lg" gender={w.gender} src={w.photo} />
                    <div className="min-w-0 flex-1">
                      <h2 className="flex items-center gap-1.5 text-[1.1rem] font-display font-bold text-heading truncate">
                        {w.name}
                        {w.verified && <VerifiedBadge />}
                      </h2>
                      <p className="text-[0.75rem] text-subtle">Storyteller & Author</p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-[0.875rem] leading-relaxed text-body">
                    {w.bio}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-divider pt-4 text-[0.8125rem]">
                  <span className="text-subtle font-medium">
                    {w.totalStories} {w.totalStories === 1 ? "story" : "stories"} · {w.totalReads} reads
                  </span>
                  <ButtonLink
                    to="/writers/$slug"
                    params={{ slug: w.slug }}
                    size="sm"
                    variant="quiet"
                  >
                    View Profile →
                  </ButtonLink>
                </div>
              </Panel>
            ))}
          </div>
        ) : tab === "Categories" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayCategories.map((c: any) => (
              <Link
                key={c.slug}
                to="/stories"
                search={{ category: c.slug }}
                className="group block"
              >
                <Panel hover className="p-6 transition-all group-hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[0.6875rem] font-black tracking-[0.16em] text-primary uppercase">
                      Category
                    </span>
                    <Badge tone="neutral">{c.count} stories</Badge>
                  </div>
                  <h3 className="mt-3 font-display text-[1.25rem] font-bold text-heading group-hover:text-primary">
                    {c.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[0.875rem] text-subtle leading-relaxed">
                    {c.description}
                  </p>
                  <div className="mt-5 text-[0.8125rem] font-bold text-primary flex items-center gap-1">
                    Explore collection →
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayBlogs.map((b: any) => (
              <Link
                key={b.slug}
                to="/blogs/$slug"
                params={{ slug: b.slug }}
                className="group block"
              >
                <Panel hover className="p-6">
                  <div className="flex items-center justify-between text-xs text-subtle font-sans">
                    <CategoryPill>{b.category}</CategoryPill>
                    <span>{b.readingTime} min read</span>
                  </div>
                  <h3 className="mt-3 font-display text-[1.1875rem] font-bold text-heading group-hover:text-primary">
                    {b.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-body">
                    {b.subtitle}
                  </p>
                  <p className="mt-4 text-[0.75rem] text-subtle border-t border-divider pt-3">
                    Published {b.date}
                  </p>
                </Panel>
              </Link>
            ))}
          </div>
        )}
          </div>
        )}
      </main>
    </SiteLayout>
  );
}
