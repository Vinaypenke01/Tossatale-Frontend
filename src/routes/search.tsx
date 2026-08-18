import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, SearchX } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { StoryCard } from "@/components/tossa/StoryCard";
import {
  Avatar,
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

export const Route = createFileRoute("/search")({
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

const tabs = ["Stories", "Writers", "Categories"] as const;

function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Stories");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["public-search", query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const res = await api.get(`/public/search/?q=${encodeURIComponent(query.trim())}`);
      return res.data;
    },
    enabled: Boolean(query.trim()),
  });

  const displayResults = {
    Stories: (searchResults?.stories && Array.isArray(searchResults.stories))
      ? searchResults.stories.map((s: any) => ({
          slug: s.slug,
          title: s.title,
          dek: s.subtitle || s.seo_description || "Story",
          writer: s.writer?.slug || "writer",
          writerName: s.writer?.name || s.writer?.user?.full_name || "Writer",
          category: s.category?.name || "General",
          categorySlug: s.category?.slug || "general",
          date: s.published_at ? new Date(s.published_at).toLocaleDateString() : "Recent",
          readingTime: s.estimated_reading_time || 5,
          cover: s.cover_image || "/assets/cover-lane.jpg",
          tags: s.tags?.map((t: any) => t.name) || [],
          views: s.views_count || 0,
          likes: s.likes_count || 0,
        }))
      : [],

    Writers: (searchResults?.writers && Array.isArray(searchResults.writers))
      ? searchResults.writers.map((w: any) => ({
          slug: w.slug,
          name: w.name || w.user?.full_name || "Writer",
          initials: (w.name || w.user?.full_name || "W").substring(0, 2).toUpperCase(),
          verified: w.is_verified || false,
          role: "Storyteller",
        }))
      : [],

    Categories: (searchResults?.categories && Array.isArray(searchResults.categories))
      ? searchResults.categories.map((c: any) => ({
          slug: c.slug,
          name: c.name,
          count: c.stories_count || 0,
        }))
      : [],
  };

  const active = displayResults[tab];

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[820px] px-5 py-16">
          <h1 className="text-[clamp(2rem,4vw,2.9rem)] font-display font-bold">Search the library</h1>
          <div className="relative mt-7">
            <SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tossatale"
              placeholder="Search by title, topic, writer name…"
              className="h-14 pl-12 text-[1.0625rem]"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={cn(
                  "rounded-full px-4 py-2 font-sans text-[0.875rem] font-bold transition-colors",
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface text-body hover:border-primary hover:text-primary",
                )}
              >
                {t} ({displayResults[t].length})
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Panel key={i} className="p-5">
                <Skeleton className="aspect-[3/2] w-full" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </Panel>
            ))}
          </div>
        ) : query.trim() === "" ? (
          <div className="text-center py-12 text-subtle font-medium">Type a term above to search stories, authors, and categories...</div>
        ) : active.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title={`No ${tab.toLowerCase()} for “${query}”`}
            blurb="Try a broader search term or explore categories."
            action={<ButtonLink to="/categories">Browse categories</ButtonLink>}
          />
        ) : tab === "Stories" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayResults.Stories.map((s: any) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        ) : tab === "Writers" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayResults.Writers.map((w: any) => (
              <Panel key={w.slug} hover className="flex items-center gap-4 p-6">
                <Avatar initials={w.initials} size="lg" />
                <div>
                  <h2 className="flex items-center gap-2 text-[1.1rem] font-display font-bold">
                    {w.name}
                    {w.verified && <VerifiedBadge />}
                  </h2>
                  <p className="text-[0.8125rem] text-subtle">{w.role}</p>
                  <ButtonLink
                    to="/writers/$slug"
                    params={{ slug: w.slug }}
                    variant="quiet"
                    size="sm"
                    className="mt-2 px-0"
                  >
                    View profile
                  </ButtonLink>
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {displayResults.Categories.map((c: any) => (
              <CategoryPill key={c.slug}>
                {c.name} · {c.count}
              </CategoryPill>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
