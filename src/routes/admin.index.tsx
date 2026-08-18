import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FileCheck2, Flag, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, ButtonLink, Panel } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead("Admin overview · tossatale", "Editorial control room for the tossatale storytelling platform."),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin-overview-queue"],
    queryFn: async () => {
      const res = await api.get("/admin/reviews/queue/");
      return res.data?.results || res.data || [];
    },
  });

  const storiesList = (queueData && Array.isArray(queueData)) ? queueData : [];

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
        <StatCard label="Awaiting review" value={String(storiesList.length)} hint="pending review" />
        <StatCard label="Published this week" value="0" hint="on target" />
        <StatCard label="Active writers" value="0" hint="registered" />
        <StatCard label="Avg. read depth" value="100%" hint="completion rate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-heading">Newest submissions</h2>
            <Link
              to="/admin/review-queue"
              className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary"
            >
              All {storiesList.length} <ArrowUpRight className="size-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-subtle font-medium">Loading submissions...</div>
          ) : storiesList.length === 0 ? (
            <EmptySectionFallback
              icon="book"
              title="No Pending Submissions"
              description="There are currently no new story submissions waiting for editorial review."
            />
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {storiesList.slice(0, 5).map((s: any) => (
                <li key={s.id || s.slug} className="flex items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">{s.title}</p>
                    <p className="mt-1 text-[0.8125rem] text-subtle">
                      {s.writer?.name || s.writer?.user?.full_name || "Author"} · {s.category?.name || "General"} · {s.estimated_reading_time || 5} min
                    </p>
                  </div>
                  <Badge tone="warning">{s.status || "Pending"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-xl font-display font-bold text-heading">Needs a decision</h2>
            <ul className="mt-4 space-y-3 text-[0.9375rem] text-body">
              <li className="flex items-center gap-3">
                <FileCheck2 className="size-4 text-primary" /> {storiesList.length} stories in review
              </li>
              <li className="flex items-center gap-3">
                <Flag className="size-4 text-warning" /> 0 flagged comments
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="size-4 text-primary" /> 0 empty feature slots
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
