import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import { Pagination } from "@/components/tossa/Pagination";
import { CategoryPill, CustomSelect, Input, Panel } from "@/components/tossa/kit";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import coverLane from "@/assets/cover-lane.jpg";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Newest");
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const res = await api.get("/public/categories/");
      return res.data?.results || res.data || [];
    },
  });

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["public-stories", activeCategory, query, sort, page],
    queryFn: async () => {
      let ordering = "-published_at";
      if (sort === "Most read") ordering = "-views_count";
      if (sort === "Most liked") ordering = "-likes_count";
      if (sort === "Shortest read") ordering = "estimated_reading_time";

      let endpoint = `/public/stories/?ordering=${ordering}&page=${page}&page_size=12`;
      if (activeCategory !== "all") endpoint += `&category=${encodeURIComponent(activeCategory)}`;
      if (query.trim()) endpoint += `&search=${encodeURIComponent(query.trim())}`;

      const res = await api.get(endpoint);
      return res.data?.data || res.data || {};
    },
  });

  const apiStories = apiResponse?.results || (Array.isArray(apiResponse) ? apiResponse : []);
  const totalStoriesCount = apiResponse?.count || apiStories.length || 0;
  const totalPages = Math.ceil(totalStoriesCount / 12);

  const handleCategoryChange = (catSlug: string) => {
    setActiveCategory(catSlug);
    setPage(1);
  };

  const handleSearchChange = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const handleSortChange = (s: (typeof sorts)[number]) => {
    setSort(s);
    setPage(1);
  };

  const displayStories = useMemo(() => {
    if (!apiStories || !Array.isArray(apiStories)) return [];
    return apiStories.map((s: any) => ({
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
      cover: s.cover_image || s.banner_image || coverLane,
      tags: s.tags?.map((t: any) => t.name) || [],
      views: s.views_count || 0,
      likes: s.likes_count || 0,
      likes_count: s.likes_count || 0,
      is_liked: Boolean(s.is_liked),
      is_bookmarked: Boolean(s.is_bookmarked),
    }));
  }, [apiStories]);

  const categoriesList = useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return [];
    return categoriesData.map((c: any) => ({
      slug: c.slug || c.id,
      name: c.name,
      count: typeof c.stories_count === "number" ? c.stories_count : 0,
    }));
  }, [categoriesData]);

  const totalCategoryStoriesCount = useMemo(() => {
    return categoriesList.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);
  }, [categoriesList]);

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            ALL HERE
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] font-display font-bold leading-[1.05]">
            Stories we’d love you to read
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Browse our original stories by genre, mood, or reading moment.
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
              <div className="w-48">
                <CustomSelect
                  value={sort}
                  onChange={(val) => setSort(val as (typeof sorts)[number])}
                  options={sorts.map((s) => ({ label: s, value: s }))}
                />
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
            <button type="button" onClick={() => handleCategoryChange("all")}>
              <CategoryPill tone={activeCategory === "all" ? "solid" : "light"}>
                All ({totalCategoryStoriesCount})
              </CategoryPill>
            </button>
            {categoriesList.map((c: any) => (
              <button key={c.slug} type="button" onClick={() => handleCategoryChange(c.slug)}>
                <CategoryPill tone={activeCategory === c.slug ? "solid" : "light"}>
                  {c.name} ({c.count})
                </CategoryPill>
              </button>
            ))}
          </div>
        </Panel>

        <p className="mt-4 text-[0.875rem] text-subtle font-medium">
          Showing {displayStories.length} stories · sorted by {sort.toLowerCase()}
        </p>

        {isLoading ? (
          <div className="py-16 text-center text-subtle font-medium">
            Loading stories...
          </div>
        ) : displayStories.length === 0 ? (
          <Panel className="mt-8 p-12 text-center">
            <h3 className="font-display text-xl font-bold text-heading">No published stories found</h3>
            <p className="mt-2 text-[0.875rem] text-subtle">
              {query ? `No stories match your search query "${query}".` : "There are currently no published stories available."}
            </p>
          </Panel>
        ) : (
          <div
            className={cn(
              "mt-6 grid gap-6",
              view === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
            )}
          >
            {displayStories.map((story: any, i: number) => (
              <Reveal key={story.slug} delay={i * 50} className="h-full">
                <StoryCard story={story} layout={view === "list" ? "horizontal" : "vertical"} />
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalStoriesCount}
          pageSize={12}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 300, behavior: "smooth" });
          }}
        />
      </div>
    </SiteLayout>
  );
}
