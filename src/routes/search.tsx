import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

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
import { categories, stories, writers } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — tossatale" },
      {
        name: "description",
        content: "Search 12,480 stories, series, writers and films across the tossatale library.",
      },
      { property: "og:title", content: "Search — tossatale" },
      { property: "og:description", content: "Search the whole tossatale library." },
    ],
  }),
  component: SearchPage,
});

const tabs = ["Stories", "Writers", "Categories"] as const;

function SearchPage() {
  const [query, setQuery] = useState("monsoon");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Stories");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return {
      Stories: stories.filter((s) =>
        `${s.title} ${s.dek} ${s.tags.join(" ")} ${s.category}`.toLowerCase().includes(q),
      ),
      Writers: writers.filter((w) => `${w.name} ${w.role} ${w.bio}`.toLowerCase().includes(q)),
      Categories: categories.filter((c) => `${c.name} ${c.blurb}`.toLowerCase().includes(q)),
    };
  }, [query]);

  const active = results[tab];

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[820px] px-5 py-16">
          <h1 className="text-[clamp(2rem,4vw,2.9rem)]">Search the library</h1>
          <div className="relative mt-7">
            <SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tossatale"
              placeholder="Try 'monsoon', 'railways', 'memory'…"
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
                {t} ({results[t].length})
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8">
        {query.trim() === "" ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Panel key={i} className="p-5">
                <Skeleton className="aspect-[3/2] w-full" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </Panel>
            ))}
          </div>
        ) : active.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title={`No ${tab.toLowerCase()} for “${query}”`}
            blurb="Try a broader word, or browse the shelves instead — most readers find something within two clicks."
            action={<ButtonLink to="/categories">Browse categories</ButtonLink>}
          />
        ) : tab === "Stories" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.Stories.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        ) : tab === "Writers" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.Writers.map((w) => (
              <Panel key={w.slug} hover className="flex items-center gap-4 p-6">
                <Avatar initials={w.initials} size="lg" />
                <div>
                  <h2 className="flex items-center gap-2 text-[1.1rem]">
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
            {results.Categories.map((c) => (
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
