import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, Plus } from "lucide-react";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { series, stories } from "@/lib/data";

export const Route = createFileRoute("/writer/series")({
  head: () => pageHead("My series · tossatale studio", "Plan chapters, track progress and schedule serialized releases."),
  component: MySeries,
});

function MySeries() {
  return (
    <AppShell
      role="writer"
      title="My series"
      blurb="Longform work, told in parts. Plan the arc, then keep the promise you made in chapter one."
      actions={
        <Button>
          <Plus className="size-4" /> Start a series
        </Button>
      }
    >
      <div className="space-y-6">
        {series.map((s) => (
          <Panel key={s.slug} className="overflow-hidden">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <img src={s.cover} alt="" loading="lazy" className="h-44 w-full object-cover md:h-full" />
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={s.progress === 0 ? "warning" : "info"}>
                    {s.progress === 0 ? "Planning" : "In progress"}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-subtle">
                    <Layers className="size-3.5" /> {s.parts} parts
                  </span>
                </div>
                <h2 className="mt-3 text-2xl">{s.title}</h2>
                <p className="mt-2 text-[1rem] text-body">{s.blurb}</p>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-[0.8125rem] text-subtle">
                    <span>Published progress</span>
                    <span>{s.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-surface-alt">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${s.progress}%` }} />
                  </div>
                </div>

                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: Math.min(s.parts, 4) }).map((_, i) => {
                    const story = stories[i % stories.length]!;
                    return (
                      <li key={i} className="flex items-center gap-3 rounded-xl bg-surface-alt/50 px-3 py-2">
                        <span className="font-display text-primary">{i + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-[0.875rem] text-body">
                          {story.title}
                        </span>
                        <Link
                          to="/writer/editor/$storyId"
                          params={{ storyId: story.slug }}
                          className="shrink-0 font-sans text-[0.8125rem] font-bold text-primary"
                        >
                          Edit
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
