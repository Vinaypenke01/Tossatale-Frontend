import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen } from "lucide-react";

import { StatCard } from "@/components/tossa/AppShell";
import { Avatar, ButtonLink, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { StoryCard } from "@/components/tossa/StoryCard";
import { pageHead } from "@/lib/head";
import { series, stories, writers, writerBySlug } from "@/lib/data";

export const Route = createFileRoute("/reader/")({
  head: () => pageHead("Your reading dashboard · tossatale", "Pick up where you left off, and see what your writers published."),
  component: ReaderDashboard,
});

function ReaderDashboard() {
  const current = stories[0]!;
  return (
    <ReaderLayout
      title="Welcome back, Aniket"
      blurb="You're 62% through “House of Small Rooms”. Three new chapters landed while you were away."
      actions={
        <ButtonLink to="/stories" variant="primary">
          <BookOpen className="size-4" /> Browse library
        </ButtonLink>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stories read" value="184" delta="+12" hint="this month" />
        <StatCard label="Hours read" value="61" delta="+4.5" />
        <StatCard label="Bookmarks" value="27" hint="6 unread" />
        <StatCard label="Following" value="19" hint="writers" />
      </div>

      <Panel className="overflow-hidden p-6 lg:p-8">
        <div>
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
            Continue reading
          </p>
            <h2 className="mt-3 text-2xl leading-snug">{current.title}</h2>
            <p className="mt-2 text-[1rem] text-body">{current.dek}</p>
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-[0.8125rem] text-subtle">
                <span>{writerBySlug(current.writer)?.name}</span>
                <span>62% · 5 min left</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-surface-alt">
                <div className="h-2 w-[62%] rounded-full bg-primary" />
              </div>
            </div>
            <ButtonLink
              to="/stories/$slug"
              params={{ slug: current.slug }}
              variant="soft"
              className="mt-6"
            >
              Resume story
            </ButtonLink>
          </div>
        </Panel>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Recommended for you</h2>
          <Link to="/stories" className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary">
            See all <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.slice(1, 4).map((s) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="text-xl">Series you follow</h2>
          <ul className="mt-5 space-y-5">
            {series.slice(0, 3).map((s) => (
              <li key={s.slug}>
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-[0.9375rem] font-bold text-heading">{s.title}</span>
                  <span className="text-[0.8125rem] text-subtle">{s.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-surface-alt">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${s.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-xl">New from your writers</h2>
          <ul className="mt-5 space-y-4">
            {writers.slice(0, 4).map((w) => (
              <li key={w.slug} className="flex items-center gap-3">
                <Avatar initials={w.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-sans text-[0.9375rem] font-bold text-heading">
                    {w.name} {w.verified && <VerifiedBadge />}
                  </p>
                  <p className="truncate text-[0.8125rem] text-subtle">Published a new {w.role.toLowerCase()}</p>
                </div>
                <Link
                  to="/writers/$slug"
                  params={{ slug: w.slug }}
                  className="shrink-0 font-sans text-[0.8125rem] font-bold text-primary"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </ReaderLayout>
  );
}
