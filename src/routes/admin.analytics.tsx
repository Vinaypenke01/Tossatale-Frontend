import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Button, Panel } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/analytics")({
  head: () =>
    pageHead("Platform analytics · tossatale admin", "Readership, retention and category performance across the library."),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin-analytics-overview"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics/overview/");
      return res.data || {};
    },
  });

  const summary = analyticsData?.platform_summary || {
    total_published_stories: 0,
    total_views: 0,
    total_likes: 0,
    total_unauthenticated_like_attempts: 0,
    total_writers: 0,
  };

  const topStories = (analyticsData?.top_stories && Array.isArray(analyticsData.top_stories))
    ? analyticsData.top_stories
    : [];

  const handleExportCSV = async () => {
    try {
      window.open("http://127.0.0.1:8000/api/v1/admin/analytics/platform/export/", "_blank");
      toast.success("Downloading analytics CSV statement...");
    } catch {
      toast.error("Failed to export statement");
    }
  };

  return (
    <AppShell
      role="admin"
      title="Platform analytics"
      blurb="Real-time reading metrics, reader retention, verified likes, and unauthenticated intent analysis."
      actions={
        <Button variant="ghostOutline" onClick={handleExportCSV}>
          <Download className="size-4" /> Export CSV
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Views" value={String(summary.total_views)} />
        <StatCard label="Published Stories" value={String(summary.total_published_stories)} />
        <StatCard label="Verified Likes" value={String(summary.total_likes)} />
        <StatCard label="Dismissed Like Intents" value={String(summary.total_unauthenticated_like_attempts || 0)} />
        <StatCard label="Total Writers" value={String(summary.total_writers)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="text-xl font-display font-bold text-heading">Category breakdown</h2>
          <EmptySectionFallback
            icon="category"
            title="Category Statistics"
            description="Category readership performance metrics are tracked dynamically as readers engage with content."
          />
        </Panel>

        <Panel className="p-6">
          <h2 className="text-xl font-display font-bold text-heading">Best performing stories</h2>
          {isLoading ? (
            <div className="py-12 text-center text-subtle font-medium">Loading platform analytics...</div>
          ) : topStories.length === 0 ? (
            <EmptySectionFallback
              icon="book"
              title="No Readership Data"
              description="Top performing stories across the platform will display here once readers begin reading."
            />
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {topStories.map((s: any, i: number) => (
                <li key={s.slug} className="flex items-center gap-4 py-3">
                  <span className="font-display text-lg text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">{s.title}</p>
                    <p className="text-[0.8125rem] text-subtle">{s.writer?.name || s.writer?.user?.full_name || "Author"}</p>
                  </div>
                  <span className="shrink-0 font-sans text-[0.875rem] font-bold text-heading">{s.views_count || 0} reads</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
