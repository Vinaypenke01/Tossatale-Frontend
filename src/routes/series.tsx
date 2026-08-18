import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { ButtonLink, Panel, SectionHeading } from "@/components/tossa/kit";
import { api } from "@/lib/api";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Story series — tossatale" },
      {
        name: "description",
        content:
          "Longform serials on tossatale, published chapter by chapter on a schedule you can trust.",
      },
      { property: "og:title", content: "Story series — tossatale" },
      { property: "og:description", content: "Longform serials published chapter by chapter." },
    ],
  }),
  component: SeriesPage,
});

function SeriesPage() {
  const { data: apiSeries, isLoading } = useQuery({
    queryKey: ["public-series"],
    queryFn: async () => {
      const res = await api.get("/public/series/");
      return res.data?.results || res.data || [];
    },
  });

  const displaySeries = (apiSeries && Array.isArray(apiSeries))
    ? apiSeries.map((s: any) => ({
        slug: s.slug,
        title: s.title,
        blurb: s.description || "Longform story series.",
        writerName: s.writer?.name || s.writer?.user?.full_name || "Writer",
        parts: s.total_stories || 1,
        progress: 0,
      }))
    : [];

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Chapter by chapter
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Story series
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Serialised longform, released on a rhythm. Start at part one — we'll remember where you
            stopped.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] space-y-8 px-5 py-16 lg:px-8">
        {isLoading ? (
          <div className="py-16 text-center text-subtle font-medium">Loading story series...</div>
        ) : displaySeries.length === 0 ? (
          <Panel className="p-12 text-center">
            <h3 className="font-display text-xl font-bold text-heading">No story series available</h3>
            <p className="mt-2 text-[0.875rem] text-subtle">
              There are currently no multi-part story series published.
            </p>
          </Panel>
        ) : (
          displaySeries.map((s: any, i: number) => (
            <Reveal key={s.slug} delay={i * 60}>
              <Panel hover className="p-8 lg:p-10">
                <div>
                  <p className="text-[0.6875rem] font-black tracking-[0.18em] text-primary uppercase">
                    {s.parts} parts · {s.writerName}
                  </p>
                  <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight font-display font-bold text-heading">{s.title}</h2>
                  <p className="mt-3 text-[1.0625rem] text-body">{s.blurb}</p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <ButtonLink to="/stories">
                      <BookOpen className="size-4" />
                      {s.progress > 0 ? "Continue series" : "Start from part one"}
                    </ButtonLink>
                    <span className="text-[0.8125rem] text-subtle">
                      {s.progress > 0 ? `${s.progress}% complete` : "Not started"}
                    </span>
                  </div>
                </div>
              </Panel>
            </Reveal>
          ))
        )}
      </div>

      <div className="mx-auto max-w-[1240px] px-5 lg:px-8 pb-16">
        <SectionHeading
          eyebrow="Also worth your evening"
          title="Standalone stories"
          action={{ label: "Browse all", to: "/stories" }}
        />
      </div>
    </SiteLayout>
  );
}
