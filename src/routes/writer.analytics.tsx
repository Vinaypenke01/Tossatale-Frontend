import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Button, Panel } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/writer/analytics")({
  head: () =>
    pageHead("Story analytics · tossatale studio", "Reads, finish rates, follower growth and earnings for your work."),
  component: WriterAnalytics,
});

function WriterAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["writer-analytics-overview"],
    queryFn: async () => {
      const res = await api.get("/writer/analytics/overview/");
      return res.data || {};
    },
  });

  const summary = analyticsData?.summary || {
    total_views: 0,
    total_likes: 0,
    total_stories: 0,
    published_stories: 0,
  };

  const topStories = (analyticsData?.top_stories && Array.isArray(analyticsData.top_stories))
    ? analyticsData.top_stories.map((s: any) => ({
        slug: s.slug,
        title: s.title,
        views: s.views_count || 0,
        cover: s.cover_image || "/assets/cover-lane.jpg",
      }))
    : [];

  return (
    <AppShell
      role="writer"
      title="Analytics & earnings"
      blurb="What readers finished, what they abandoned, and what it paid."
      actions={
        <Button variant="ghostOutline">
          <Download className="size-4" /> Download statement
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reads" value={String(summary.total_views)} />
        <StatCard label="Total Likes" value={String(summary.total_likes)} />
        <StatCard label="Published Stories" value={String(summary.published_stories)} />
        <StatCard label="Total Stories" value={String(summary.total_stories)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="text-xl font-display font-bold text-heading">Top performing stories</h2>
          {isLoading ? (
            <div className="py-12 text-center text-subtle font-medium">Loading top stories...</div>
          ) : topStories.length === 0 ? (
            <EmptySectionFallback
              icon="write"
              title="No Story Analytics Available"
              description="Publish stories to start tracking reader engagement, views, and likes."
            />
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {topStories.map((s: any) => (
                <li key={s.slug} className="flex items-center gap-4 py-3">
                  <img src={s.cover} alt="" loading="lazy" className="h-11 w-14 rounded-lg object-cover" />
                  <p className="min-w-0 flex-1 truncate font-sans text-[0.9375rem] font-bold text-heading">
                    {s.title}
                  </p>
                  <span className="shrink-0 text-[0.875rem] text-subtle">{s.views} reads</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-6">
          <h2 className="text-xl font-display font-bold text-heading">Payouts & Statements</h2>
          <div className="mt-5 py-8 text-center">
            <EmptySectionFallback
              icon="series"
              title="No Payout History"
              description="Earnings statement calculations are processed at the end of each billing cycle."
            />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
