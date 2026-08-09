import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { ButtonLink, Panel, SectionHeading } from "@/components/tossa/kit";
import { series, stories, writerBySlug } from "@/lib/data";

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
        {series.map((s, i) => {
          const writer = writerBySlug(s.writer);
          const chapters = stories.filter((st) => st.series === s.title);
          return (
            <Reveal key={s.slug} delay={i * 60}>
              <Panel hover className="grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
                <img
                  src={s.cover}
                  alt={s.title}
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="size-full min-h-64 object-cover"
                />
                <div className="p-8 lg:p-10">
                  <p className="text-[0.6875rem] font-black tracking-[0.18em] text-primary uppercase">
                    {s.parts} parts · {writer?.name}
                  </p>
                  <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight">{s.title}</h2>
                  <p className="mt-3 text-[1.0625rem] text-body">{s.blurb}</p>

                  <ol className="mt-6 divide-y divide-divider border-t border-divider">
                    {Array.from({ length: Math.min(4, s.parts) }).map((_, idx) => {
                      const chapter = chapters[idx];
                      return (
                        <li key={idx} className="flex items-center gap-3 py-3">
                          <span className="font-display text-[1.05rem] text-primary/50">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          {chapter ? (
                            <Link
                              to="/stories/$slug"
                              params={{ slug: chapter.slug }}
                              className="text-[0.9375rem] font-bold text-heading hover:text-primary"
                            >
                              {chapter.title}
                            </Link>
                          ) : (
                            <span className="text-[0.9375rem] text-subtle">
                              Chapter {idx + 1} · available to read
                            </span>
                          )}
                          <span className="ml-auto text-[0.8125rem] text-subtle">
                            {8 + idx * 3} min
                          </span>
                        </li>
                      );
                    })}
                  </ol>

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
          );
        })}
      </div>

      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <SectionHeading
          eyebrow="Also worth your evening"
          title="Standalone stories"
          action={{ label: "Browse all", to: "/stories" }}
        />
      </div>
    </SiteLayout>
  );
}
