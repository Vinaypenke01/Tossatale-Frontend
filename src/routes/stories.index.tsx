import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import { Button, CategoryPill, Input, Panel } from "@/components/tossa/kit";
import { categories, stories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stories/")({
  head: () => ({
    meta: [
      { title: "All stories — tossatale" },
      {
        name: "description",
        content:
          "Browse every story on tossatale: memoir, fiction, travel, essays, poetry and speculative longform, filtered by category and reading time.",
      },
      { property: "og:title", content: "All stories — tossatale" },
      {
        property: "og:description",
        content: "Memoir, fiction, travel, essays and speculative longform from tossatale writers.",
      },
    ],
  }),
  component: StoriesIndex,
});

const sorts = ["Newest", "Most read", "Most liked", "Shortest read"] as const;

function StoriesIndex() {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Newest");

  const filtered = useMemo(
    () =>
      stories.filter(
        (s) =>
          (active === "all" || s.categorySlug === active) &&
          (query.trim() === "" ||
            `${s.title} ${s.dek} ${s.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [active, query],
  );

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            The library
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Every story, shelved and waiting
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            {stories.length} published pieces across {categories.length} categories. Filter until
            something feels like tonight.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8">
        <Panel className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, themes, tags…"
              aria-label="Search stories"
              className="md:max-w-sm"
            />
            <div className="flex items-center gap-2 md:ml-auto">
              <label className="sr-only" htmlFor="sort">
                Sort stories
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
                  className="h-11 appearance-none rounded-xl border border-border bg-surface pr-10 pl-4 font-sans text-[0.875rem] font-bold text-heading focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none"
                >
                  {sorts.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <SlidersHorizontal className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle" />
              </div>
              <div className="flex overflow-hidden rounded-xl border border-border">
                {(
                  [
                    ["grid", LayoutGrid],
                    ["list", List],
                  ] as const
                ).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    aria-label={`${mode} view`}
                    aria-pressed={view === mode}
                    onClick={() => setView(mode)}
                    className={cn(
                      "grid size-11 place-items-center transition-colors",
                      view === mode ? "bg-primary text-primary-foreground" : "text-subtle hover:bg-primary-light",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-divider pt-4">
            <button type="button" onClick={() => setActive("all")}>
              <CategoryPill tone={active === "all" ? "solid" : "light"}>All</CategoryPill>
            </button>
            {categories.map((c) => (
              <button key={c.slug} type="button" onClick={() => setActive(c.slug)}>
                <CategoryPill tone={active === c.slug ? "solid" : "light"}>{c.name}</CategoryPill>
              </button>
            ))}
          </div>
        </Panel>

        <p className="mt-8 text-[0.875rem] text-subtle">
          Showing {filtered.length} of {stories.length} stories · sorted by {sort.toLowerCase()}
        </p>

        <div
          className={cn(
            "mt-6 grid gap-6",
            view === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
          )}
        >
          {filtered.map((story, i) => (
            <Reveal key={story.slug} delay={i * 50}>
              <StoryCard story={story} layout={view === "list" ? "horizontal" : "vertical"} />
            </Reveal>
          ))}
        </div>

        <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
          <Button variant="ghostOutline" size="sm">
            Previous
          </Button>
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === 1 ? "page" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-full font-sans text-[0.875rem] font-bold transition-colors",
                p === 1 ? "bg-primary text-primary-foreground" : "text-body hover:bg-primary-light",
              )}
            >
              {p}
            </button>
          ))}
          <span className="px-1 text-subtle">…</span>
          <Button variant="ghostOutline" size="sm">
            Next
          </Button>
        </nav>
      </div>
    </SiteLayout>
  );
}
