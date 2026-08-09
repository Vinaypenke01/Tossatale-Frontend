import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { StatCard } from "@/components/tossa/AppShell";
import { Badge, Panel } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { pageHead } from "@/lib/head";
import { stories, writerBySlug } from "@/lib/data";

export const Route = createFileRoute("/reader/history")({
  head: () => pageHead("Reading history · tossatale", "Everything you've read, with how far you got in each story."),
  component: History,
});

const groups = [
  { label: "Today", items: stories.slice(0, 2), progress: [62, 100] },
  { label: "This week", items: stories.slice(2, 5), progress: [100, 41, 100] },
  { label: "Earlier this month", items: stories.slice(5), progress: [100, 88] },
];

function History() {
  return (
    <ReaderLayout
      title="Reading history"
      blurb="Sixty-one hours this year. Mostly memoir, mostly after ten at night."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stories read" value="184" />
        <StatCard label="Hours read" value="61" />
        <StatCard label="Finished" value="86%" hint="of what you start" />
        <StatCard label="Longest streak" value="23 days" />
      </div>

      {groups.map((g) => (
        <section key={g.label}>
          <h2 className="font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
            {g.label}
          </h2>
          <Panel className="mt-4 p-6">
            <ul className="divide-y divide-border">
              {g.items.map((s, i) => {
                const pct = g.progress[i] ?? 100;
                return (
                  <li key={s.slug} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/stories/$slug"
                        params={{ slug: s.slug }}
                        className="block truncate font-sans text-[1rem] font-bold text-heading hover:text-primary"
                      >
                        {s.title}
                      </Link>
                      <p className="mt-1 text-[0.8125rem] text-subtle">
                        {writerBySlug(s.writer)?.name} · {s.category}
                      </p>
                      <div className="mt-2 h-1.5 max-w-sm rounded-full bg-surface-alt">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-subtle">
                        <Clock className="size-3.5" /> {s.readingTime} min
                      </span>
                      <Badge tone={pct === 100 ? "success" : "info"}>
                        {pct === 100 ? "Finished" : `${pct}%`}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </section>
      ))}
    </ReaderLayout>
  );
}
