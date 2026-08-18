import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Badge, Button, Input, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/review-queue")({
  head: () =>
    pageHead("Review queue · tossatale admin", "Read, annotate and approve submitted stories before they publish."),
  component: ReviewQueue,
});

const filters = ["All", "New", "In review", "Published", "Needs revision", "Scheduled"] as const;

function ReviewQueue() {
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: apiQueue, isLoading } = useQuery({
    queryKey: ["admin-review-queue", filter],
    queryFn: async () => {
      let statusQuery = "";
      if (filter === "Published") statusQuery = "?status=PUBLISHED";
      else if (filter === "New") statusQuery = "?status=PENDING_REVIEW";
      else if (filter === "Needs revision") statusQuery = "?status=REJECTED";
      else if (filter === "All") statusQuery = "?status=ALL";

      const res = await api.get(`/admin/reviews/queue/${statusQuery}`);
      return res.data?.results || res.data || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (storyId: string) => {
      return await api.post(`/admin/reviews/${storyId}/approve/`);
    },
    onSuccess: () => {
      toast.success("Story approved successfully!", {
        description: "The story is now approved for publishing.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
    },
    onError: (err: any) => {
      toast.error("Approval failed", { description: err.message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ storyId, feedback }: { storyId: string; feedback: string }) => {
      return await api.post(`/admin/reviews/${storyId}/reject/`, { rejection_feedback: feedback });
    },
    onSuccess: () => {
      toast.success("Story rejected with feedback", {
        description: "Feedback sent to the writer.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
    },
    onError: (err: any) => {
      toast.error("Rejection failed", { description: err.message });
    },
  });

  const handleReject = (storyId: string) => {
    const feedback = window.prompt("Enter rejection feedback for the writer (mandatory):");
    if (!feedback || !feedback.trim()) {
      toast.error("Rejection requires feedback!");
      return;
    }
    rejectMutation.mutate({ storyId, feedback: feedback.trim() });
  };

  const rows = (apiQueue && Array.isArray(apiQueue))
    ? apiQueue.map((s: any) => ({
        id: s.id,
        title: s.title,
        dek: s.subtitle || s.seo_description || "Submitted story",
        writerName: s.writer?.name || s.writer?.user?.display_name || s.writer?.user?.first_name || s.writer?.user?.email?.split?.("@")?.[0] || "Writer",
        category: s.category?.name || "General",
        date: s.published_at || s.submitted_at || s.created_at ? new Date(s.published_at || s.submitted_at || s.created_at).toLocaleDateString() : "Recently",
        readingTime: s.estimated_reading_time || 5,
        rawStatus: s.status,
        status: s.status === "PUBLISHED" ? "Published" : s.status === "PENDING_REVIEW" ? "New" : s.status === "REJECTED" ? "Needs revision" : "In review",
      })).filter((r: any) => r.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <AppShell
      role="admin"
      title="Review queue"
      blurb="Every submission, in the order it arrived. Read it, leave notes, then approve or send it back."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="In queue" value={String(rows.length)} hint="pending review" />
        <StatCard label="Median wait" value="0 days" hint="current queue" />
        <StatCard label="Approved this week" value="0" />
        <StatCard label="Sent back" value="0" hint="with notes" />
      </div>

      <Panel className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                suppressHydrationWarning
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1 font-sans text-[0.8125rem] font-bold transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-body hover:border-primary hover:text-primary",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter queue by title or writer…"
            aria-label="Filter review queue"
            className="h-9 text-[0.8125rem] md:max-w-xs"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading review queue...</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="font-display text-lg font-bold text-heading">No stories found</h3>
            <p className="mt-1 text-[0.875rem] text-subtle">
              There are currently no stories matching the "{filter}" filter.
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {rows.map(({ id, title, dek, writerName, category, date, readingTime, status }: any) => (
              <li key={id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={status === "Published" ? "success" : status === "New" ? "warning" : "info"}>{status}</Badge>
                    <span className="font-sans text-[0.75rem] font-bold text-subtle">{category}</span>
                  </div>
                  <h2 className="mt-2 text-[1.125rem] font-display font-bold leading-snug text-heading">{title}</h2>
                  <p className="mt-1 line-clamp-1 text-[0.875rem] text-body">{dek}</p>
                  <p className="mt-2 text-[0.8125rem] text-subtle">
                    Submitted by <strong className="text-heading">{writerName}</strong> · {date} · {readingTime} min read
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {status === "Published" ? (
                    <Badge tone="success" className="px-3.5 py-1.5 font-bold text-xs">Published Live</Badge>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => approveMutation.mutate(id)}
                        className="gap-1.5"
                      >
                        <Check className="size-4" /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(id)}
                        className="gap-1.5"
                      >
                        <X className="size-4" /> Send back
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
