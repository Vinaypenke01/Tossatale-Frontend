import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/components/tossa/AppShell";
import { Badge, Panel } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/reader/history")({
  head: () => pageHead("Reading history · tossatale", "Everything you've read, with how far you got in each story."),
  component: History,
});

function History() {
  const { data: apiHistory, isLoading } = useQuery({
    queryKey: ["reader-history"],
    queryFn: async () => {
      const res = await api.get("/user/recently-read/");
      return res.data?.results || res.data || [];
    },
  });

  const historyItems = (apiHistory && Array.isArray(apiHistory))
    ? apiHistory.map((item: any) => {
        const rawProgress = Number(item.reading_progress ?? item.progress_percent ?? 0);
        const progressVal = Math.min(100, Math.max(0, Math.round(rawProgress)));
        const isCompleted = Boolean(item.completed) || progressVal >= 95;
        return {
          slug: item.story?.slug || item.story_id,
          title: item.story?.title || "Recently Read Story",
          writerName: item.story?.writer?.name || item.story?.writer?.user?.full_name || "Writer",
          category: item.story?.category?.name || "General",
          readingTime: item.story?.estimated_reading_time || 5,
          progress: progressVal,
          completed: isCompleted,
        };
      })
    : [];

  const finishedCount = historyItems.filter((i: any) => i.completed).length;
  const completionRate = historyItems.length > 0 ? Math.round((finishedCount / historyItems.length) * 100) : 0;

  return (
    <ReaderLayout
      title="Reading history"
      blurb="Everything you've read, with how far you got in each story."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stories read" value={String(historyItems.length)} />
        <StatCard label="Hours read" value="0" />
        <StatCard label="Finished" value={`${completionRate}%`} hint="completion" />
        <StatCard label="Longest streak" value="0 days" />
      </div>

      <section className="mt-8">
        <h2 className="font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
          Recently Read
        </h2>
        <Panel className="mt-4 p-6">
          {isLoading ? (
            <div className="py-12 text-center text-subtle font-medium">Loading history...</div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="font-display text-lg font-bold text-heading">No reading history</h3>
              <p className="mt-1 text-[0.875rem] text-subtle">
                Stories you read will appear here automatically.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {historyItems.map((s: any) => (
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
                      {s.writerName} · {s.category}
                    </p>
                    <div className="mt-2 h-1.5 max-w-sm rounded-full bg-surface-alt">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-subtle">
                      <Clock className="size-3.5" /> {s.readingTime} min
                    </span>
                    <Badge tone={s.completed ? "success" : "info"}>
                      {s.completed ? "Finished" : s.progress > 0 ? `${s.progress}%` : "In progress"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </ReaderLayout>
  );
}
