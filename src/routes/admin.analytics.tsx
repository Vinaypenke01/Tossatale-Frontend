import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Button, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { categories, stories, writerBySlug } from "@/lib/data";

export const Route = createFileRoute("/admin/analytics")({
  head: () =>
    pageHead("Platform analytics · tossatale admin", "Readership, retention and category performance across the library."),
  component: AdminAnalytics,
});

const bars = [
  { label: "Mon", value: 62 },
  { label: "Tue", value: 74 },
  { label: "Wed", value: 58 },
  { label: "Thu", value: 88 },
  { label: "Fri", value: 100 },
  { label: "Sat", value: 81 },
  { label: "Sun", value: 69 },
];

function AdminAnalytics() {
  return (
    <AppShell
      role="admin"
      title="Platform analytics"
      blurb="Ninety days of reading behaviour — where attention goes and how deep it runs."
      actions={
        <Button variant="ghostOutline">
          <Download className="size-4" /> Export CSV
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Reads (90d)" value="4.82M" delta="+18.2%" hint="vs prior period" />
        <StatCard label="Reading hours" value="1.4M" delta="+12%" />
        <StatCard label="Finish rate" value="86%" delta="+2.4%" />
        <StatCard label="New members" value="41,206" delta="+7.8%" />
      </div>

      <Panel className="p-6">
        <h2 className="text-xl">Reads this week</h2>
        <div className="mt-8 flex h-56 items-end gap-3">
          {bars.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-3">
              <div
                className="w-full rounded-t-xl ink-gradient transition-all duration-700"
                style={{ height: `${b.value}%` }}
              />
              <span className="font-sans text-[0.75rem] font-bold text-subtle">{b.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="text-xl">Top categories</h2>
          <ul className="mt-5 space-y-4">
            {categories.slice(0, 6).map((c) => {
              const pct = Math.min(100, Math.round((c.count / 500) * 100));
              return (
                <li key={c.slug}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[0.9375rem] font-bold text-heading">{c.name}</span>
                    <span className="text-[0.8125rem] text-subtle">{c.count} stories</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-surface-alt">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-xl">Best performing stories</h2>
          <ul className="mt-5 divide-y divide-border">
            {stories.slice(0, 6).map((s, i) => (
              <li key={s.slug} className="flex items-center gap-4 py-3">
                <span className="font-display text-lg text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">{s.title}</p>
                  <p className="text-[0.8125rem] text-subtle">{writerBySlug(s.writer)?.name}</p>
                </div>
                <span className="shrink-0 font-sans text-[0.875rem] font-bold text-heading">{s.views}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
