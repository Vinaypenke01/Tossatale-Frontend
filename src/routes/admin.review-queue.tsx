import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Check, Clock, Eye, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, Input, Panel, Textarea } from "@/components/tossa/kit";
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
  const [readingStory, setReadingStory] = useState<any | null>(null);
  const [rejectingStory, setRejectingStory] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
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
        description: "The story is now published and live in the tossatale library.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
    },
    onError: (err: any) => {
      toast.error("Approval failed", {
        description: err.response?.data?.message || err.message || "Could not approve story.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ storyId, feedback }: { storyId: string; feedback: string }) => {
      return await api.post(`/admin/reviews/${storyId}/reject/`, { rejection_feedback: feedback });
    },
    onSuccess: () => {
      toast.success("Story sent back with feedback", {
        description: "Feedback has been delivered to the writer's studio dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
      setRejectingStory(null);
      setFeedbackText("");
    },
    onError: (err: any) => {
      toast.error("Rejection failed", {
        description: err.response?.data?.message || err.message || "Could not reject story.",
      });
    },
  });

  const handleOpenReject = (story: any) => {
    setRejectingStory(story);
    setFeedbackText("");
  };

  const handleConfirmReject = () => {
    if (!feedbackText.trim() || feedbackText.trim().length < 5) {
      toast.error("Editorial feedback is mandatory (at least 5 characters).");
      return;
    }
    rejectMutation.mutate({
      storyId: rejectingStory.id,
      feedback: feedbackText.trim(),
    });
  };

  const rows = (apiQueue && Array.isArray(apiQueue))
    ? apiQueue.map((s: any) => ({
        id: s.id,
        title: s.title,
        dek: s.subtitle || s.seo_description || "Submitted story",
        subtitle: s.subtitle || "",
        content: s.content || s.body || "No story content provided.",
        coverImage: s.cover_image || s.featured_image || "",
        writerName: s.writer?.name || s.writer?.user?.display_name || s.writer?.user?.first_name || s.writer?.user?.email?.split?.("@")?.[0] || "Writer",
        writerGender: s.writer?.gender || "OTHER",
        category: s.category?.name || "General",
        date: s.published_at || s.submitted_at || s.created_at ? new Date(s.published_at || s.submitted_at || s.created_at).toLocaleDateString() : "Recently",
        readingTime: s.estimated_reading_time || 5,
        wordCount: s.word_count || (s.content ? s.content.trim().split(/\s+/).length : 0),
        rawStatus: s.status,
        status: s.status === "PUBLISHED" ? "Published" : s.status === "PENDING_REVIEW" ? "New" : s.status === "REJECTED" ? "Needs revision" : "In review",
      })).filter((r: any) => r.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <AppShell
      role="admin"
      title="Review queue"
      blurb="Every submission, in the order it arrived. Click any story to read, leave notes, and approve."
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
            {rows.map((story: any) => (
              <li
                key={story.id}
                className="group flex flex-col gap-4 py-5 sm:flex-row sm:items-center transition-colors hover:bg-surface-alt/30 px-3 rounded-2xl"
              >
                <div
                  onClick={() => setReadingStory(story)}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={story.status === "Published" ? "success" : story.status === "New" ? "warning" : "info"}>{story.status}</Badge>
                    <span className="font-sans text-[0.75rem] font-bold text-subtle">{story.category}</span>
                  </div>
                  <h2 className="mt-2 text-[1.125rem] font-display font-bold leading-snug text-heading group-hover:text-primary transition-colors">
                    {story.title}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-[0.875rem] text-body">{story.dek}</p>
                  <p className="mt-2 text-[0.8125rem] text-subtle">
                    Submitted by <strong className="text-heading">{story.writerName}</strong> · {story.date} · {story.readingTime} min read · {story.wordCount} words
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    variant="ghostOutline"
                    size="sm"
                    onClick={() => setReadingStory(story)}
                    className="gap-1.5"
                  >
                    <Eye className="size-4" /> Read
                  </Button>
                  {story.status === "Published" ? (
                    <Badge tone="success" className="px-3.5 py-1.5 font-bold text-xs">Published Live</Badge>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(story.id)}
                        className="gap-1.5"
                      >
                        <Check className="size-4" /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenReject(story)}
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

      {/* Story Reader Pop-up Modal */}
      {readingStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setReadingStory(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Badge tone={readingStory.status === "Published" ? "success" : readingStory.status === "New" ? "warning" : "info"}>
                  {readingStory.status}
                </Badge>
                <span className="text-xs font-bold text-subtle font-sans">{readingStory.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setReadingStory(null)}
                aria-label="Close story preview"
                className="grid size-9 place-items-center rounded-full text-subtle hover:bg-surface-hover hover:text-heading transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable Full Story Content) */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {readingStory.coverImage && (
                <img
                  src={readingStory.coverImage}
                  alt={readingStory.title}
                  className="w-full max-h-80 object-cover rounded-2xl border border-border shadow-xs"
                />
              )}

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-heading">
                  {readingStory.title}
                </h1>
                {readingStory.subtitle && (
                  <p className="mt-2 text-[1.0625rem] text-body font-sans font-medium">
                    {readingStory.subtitle}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3 border-y border-border py-3">
                  <Avatar
                    initials={readingStory.writerName.substring(0, 2).toUpperCase()}
                    gender={readingStory.writerGender}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-heading">{readingStory.writerName}</p>
                    <p className="text-xs text-subtle">
                      Submitted on {readingStory.date} · {readingStory.readingTime} min read · {readingStory.wordCount} words
                    </p>
                  </div>
                </div>
              </div>

              {/* Story Content Typography */}
              <div className="prose prose-stone dark:prose-invert max-w-none text-[1.0625rem] leading-relaxed font-serif whitespace-pre-line text-body border-t border-border pt-4">
                {readingStory.content}
              </div>
            </div>

            {/* Modal Review Actions Bar */}
            <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-md">
              <Button variant="ghostOutline" size="sm" onClick={() => setReadingStory(null)}>
                Close Preview
              </Button>
              <div className="flex items-center gap-2">
                {readingStory.status !== "Published" && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        const storyToReject = readingStory;
                        setReadingStory(null);
                        handleOpenReject(storyToReject);
                      }}
                      className="gap-1.5"
                    >
                      <X className="size-4" /> Send back
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={approveMutation.isPending}
                      onClick={() => {
                        approveMutation.mutate(readingStory.id);
                        setReadingStory(null);
                      }}
                      className="gap-1.5"
                    >
                      <Check className="size-4" /> Approve Story
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Feedback Modal */}
      {rejectingStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setRejectingStory(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-heading">Send Back for Revision</h3>
                <p className="text-xs text-subtle truncate max-w-sm mt-0.5">"{rejectingStory.title}"</p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingStory(null)}
                className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-hover"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-heading">
                Editorial Feedback <span className="text-destructive">*</span>
              </label>
              <Textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Explain what revisions are needed before this story can be approved..."
                className="w-full text-sm"
              />
              <p className="text-[0.75rem] text-subtle">
                This note will be sent directly to <strong>{rejectingStory.writerName}</strong> in their Studio dashboard.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button variant="ghostOutline" size="sm" onClick={() => setRejectingStory(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={rejectMutation.isPending || !feedbackText.trim()}
                onClick={handleConfirmReject}
                className="gap-1.5"
              >
                {rejectMutation.isPending ? "Sending..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
