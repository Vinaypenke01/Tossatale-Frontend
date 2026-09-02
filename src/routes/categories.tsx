import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Panel } from "@/components/tossa/kit";
import { covers } from "@/lib/data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — tossatale" },
      {
        name: "description",
        content:
          "Explore tossatale by category: memoir, fiction, travel, essays, speculative, poetry, food and cinema.",
      },
      { property: "og:title", content: "Categories — tossatale" },
      { property: "og:description", content: "Explore tossatale by category." },
    ],
  }),
  component: CategoriesPage,
});

const coverList = Object.values(covers);

function CategoriesPage() {
  const { data: apiCategories, isLoading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const res = await api.get("/public/categories/");
      return res.data?.results || res.data || [];
    },
  });

  const displayCategories = (apiCategories && Array.isArray(apiCategories))
    ? apiCategories.map((c: any) => ({
        slug: c.slug,
        name: c.name,
        blurb: c.description || "Collection of longform stories.",
        count: c.stories_count || 0,
      }))
    : [];

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Explore
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Story Shelves
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Pick a shelf. Every category is curated to bring you longform stories.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-slate-200/80 dark:bg-zinc-800/80 animate-pulse p-6 flex flex-col justify-end gap-2"
              >
                <div className="h-6 w-3/4 rounded-md bg-slate-300 dark:bg-zinc-700" />
                <div className="h-4 w-5/6 rounded-md bg-slate-300 dark:bg-zinc-700" />
                <div className="h-3 w-1/3 rounded-md bg-slate-300 dark:bg-zinc-700 mt-2" />
              </div>
            ))}
          </div>
        ) : displayCategories.length === 0 ? (
          <Panel className="p-12 text-center">
            <h3 className="font-display text-xl font-bold text-heading">No categories available</h3>
            <p className="mt-2 text-[0.875rem] text-subtle">
              There are currently no categories configured in the database.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayCategories.map((c: any, i: number) => (
              <Reveal key={c.slug} delay={i * 55}>
                <Link to="/stories" search={{ category: c.slug }} className="group block h-full">
                  <Panel hover className="relative h-64 overflow-hidden">
                    <img
                      src={coverList[i % coverList.length]!}
                      alt=""
                      loading="lazy"
                      width={1200}
                      height={800}
                      className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-primary-hover/50" />
                    <span className="relative flex h-full flex-col justify-end p-6">
                      <span className="font-display text-[1.5rem] text-white">{c.name}</span>
                      <span className="mt-1.5 text-[0.9375rem] text-white/80">{c.blurb}</span>
                      <span className="mt-4 flex items-center gap-1.5 text-[0.75rem] tracking-[0.14em] text-white/70 uppercase">
                        {c.count} stories
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Panel>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
