import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, PenLine } from "lucide-react";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Badge, ButtonLink, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { series, stories } from "@/lib/data";

export const Route = createFileRoute("/writer/")({
  head: () =>
    pageHead("Creator studio · tossatale", "Your drafts, series and readership in one calm writing studio."),
  component: WriterStudio,
});

const drafts = stories.slice(0, 4);

function WriterStudio() {
  return (
    <AppShell
      role="writer"
      title="Good morning, Meera"
      blurb="Two drafts are close. One chapter is due Friday. Here's where the work stands."
      actions={
        <>
          <ButtonLink to="/writer/editor" variant="primary">
            <PenLine className="size-4" /> New story
          </ButtonLink>
          <ButtonLink to="/writer/analytics" variant="soft">
            View analytics
          </ButtonLink>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total reads" value="1.2M" delta="+4.1%" hint="last 30 days" />
        <StatCard label="Followers" value="18.4k" delta="+312" hint="this month" />
        <StatCard label="Published" value="42" hint="3 in review" />
        <StatCard label="Earnings (30d)" value="₹48,200" delta="+9%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Continue writing</h2>
            <Link
              to="/writer/stories"
              className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary"
            >
              All stories <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {drafts.map((s, i) => (
              <li key={s.slug}>
                <Link
                  to="/writer/editor/$storyId"
                  params={{ storyId: s.slug }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface-alt/40 p-4 transition-colors hover:border-primary/30 hover:bg-primary-light/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">{s.title}</p>
                    <p className="mt-1 text-[0.8125rem] text-subtle">
                      Edited {s.date} · {s.readingTime} min · {1200 + i * 340} words
                    </p>
                  </div>
                  <Badge tone={i === 0 ? "warning" : i === 1 ? "info" : "neutral"}>
                    {i === 0 ? "Draft" : i === 1 ? "In review" : "Published"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-xl">Your series</h2>
            <ul className="mt-4 space-y-4">
              {series.slice(0, 2).map((s) => (
                <li key={s.slug}>
                  <p className="font-sans text-[0.9375rem] font-bold text-heading">{s.title}</p>
                  <p className="text-[0.8125rem] text-subtle">{s.parts} parts planned</p>
                  <div className="mt-2 h-2 rounded-full bg-surface-alt">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${s.progress}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-6">
            <h2 className="text-xl">This week</h2>
            <ul className="mt-4 space-y-3 text-[0.9375rem] text-body">
              <li>Chapter 4 due Friday</li>
              <li>Editor notes on “Last Stations”</li>
              <li>Newsletter goes out Sunday</li>
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
