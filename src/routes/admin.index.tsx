import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FileCheck2, Flag, Sparkles } from "lucide-react";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, ButtonLink, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { stories, writerBySlug } from "@/lib/data";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead("Admin overview · tossatale", "Editorial control room for the tossatale storytelling platform."),
  component: AdminOverview,
});

const activity = [
  { who: "Meera Raghavan", what: "submitted “House of Small Rooms · Part 4”", when: "12 min ago" },
  { who: "Kabir Menon", what: "replied to editorial notes", when: "48 min ago" },
  { who: "Nadia Farouk", what: "published “The Salt Archive · Part 3”", when: "3 hours ago" },
  { who: "Arjun Sethi", what: "requested a feature slot", when: "Yesterday" },
  { who: "Ila Bhattacharya", what: "updated her writer profile", when: "Yesterday" },
];

function AdminOverview() {
  return (
    <AppShell
      role="admin"
      title="Editorial control room"
      blurb="Everything waiting on an editor this week — submissions, features, and the health of the library."
      actions={
        <>
          <ButtonLink to="/admin/review-queue" variant="primary">
            Open review queue
          </ButtonLink>
          <ButtonLink to="/admin/homepage-builder" variant="soft">
            Curate homepage
          </ButtonLink>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting review" value="24" delta="+6" hint="vs last week" />
        <StatCard label="Published this week" value="38" delta="+11%" hint="on target" />
        <StatCard label="Active writers" value="312" delta="+9" hint="new this month" />
        <StatCard label="Avg. read depth" value="86%" delta="+2.4%" hint="finish rate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Newest submissions</h2>
            <Link
              to="/admin/review-queue"
              className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary"
            >
              All 24 <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {stories.slice(0, 5).map((s) => (
              <li key={s.slug} className="flex items-center gap-4 py-4">
                <img src={s.cover} alt="" loading="lazy" className="h-14 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">{s.title}</p>
                  <p className="mt-1 text-[0.8125rem] text-subtle">
                    {writerBySlug(s.writer)?.name} · {s.category} · {s.readingTime} min
                  </p>
                </div>
                <Badge tone={s.featured ? "info" : "warning"}>{s.featured ? "In review" : "New"}</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-xl">Activity</h2>
            <ul className="mt-4 space-y-4">
              {activity.map((a) => (
                <li key={a.what} className="flex gap-3">
                  <Avatar initials={a.who.split(" ").map((n) => n[0]).join("")} size="sm" />
                  <div>
                    <p className="text-[0.9375rem] text-body">
                      <span className="font-sans font-bold text-heading">{a.who}</span> {a.what}
                    </p>
                    <p className="text-[0.75rem] text-subtle">{a.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-6">
            <h2 className="text-xl">Needs a decision</h2>
            <ul className="mt-4 space-y-3 text-[0.9375rem] text-body">
              <li className="flex items-center gap-3">
                <FileCheck2 className="size-4 text-primary" /> 24 stories in review
              </li>
              <li className="flex items-center gap-3">
                <Flag className="size-4 text-warning" /> 3 flagged comments
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="size-4 text-primary" /> 2 empty feature slots
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
