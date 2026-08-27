import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, BookOpen, Check, ChevronDown, ChevronUp, Clock, Eye, History, MessageSquare, X } from "lucide-react";
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

const filters = ["All", "In review", "Published", "Rejected"] as const;

function ReviewQueue() {
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [readingStory, setReadingStory] = useState<any | null>(null);
  const [rejectingStory, setRejectingStory] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const toggleHistory = (storyId: string) => {
    setExpandedHistories((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const { data: apiQueue, isLoading } = useQuery({
    queryKey: ["admin-review-queue", filter],
    queryFn: async () => {
      let statusQuery = "";
      if (filter === "Published") statusQuery = "?status=PUBLISHED";
      else if (filter === "In review") statusQuery = "?status=PENDING_REVIEW";
      else if (filter === "Rejected") statusQuery = "?status=REJECTED";
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
      toast.success("Story rejected & feedback sent", {
        description: "Status changed to Rejected and feedback recorded in review history.",
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
    ? apiQueue.map((s: any) => {
        const reviewsList = Array.isArray(s.reviews) ? s.reviews : [];
        const rejectionReviews = reviewsList.filter((r: any) => r.decision === "REJECTED");
        const rejectionCount = s.rejection_count ?? (rejectionReviews.length > 0 ? rejectionReviews.length : s.rejection_feedback ? 1 : 0);

        return {
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
          rejectionFeedback: s.rejection_feedback || "",
          rejectionCount: Number(rejectionCount),
          reviews: reviewsList,
          rejectionReviews: rejectionReviews,
          status: s.status === "PUBLISHED" ? "Published" : s.status === "PENDING_REVIEW" ? "In review" : s.status === "REJECTED" ? "Rejected" : s.status === "DRAFT" ? "Draft" : "In review",
        };
      }).filter((r: any) => r.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const inReviewCount = rows.filter((r) => r.rawStatus === "PENDING_REVIEW").length;
  const rejectedCount = rows.filter((r) => r.rawStatus === "REJECTED").length;
  const publishedCount = rows.filter((r) => r.rawStatus === "PUBLISHED").length;

  return (
    <AppShell
      role="admin"
      title="Review queue"
      blurb="Every submission, in the order it arrived. Read, leave editorial feedback, approve or track rejection histories."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="In queue" value={String(inReviewCount)} hint="pending editorial review" />
        <StatCard label="Rejected" value={String(rejectedCount)} hint="needs author revision" />
        <StatCard label="Published" value={String(publishedCount)} hint="live in library" />
        <StatCard label="Total Submissions" value={String(rows.length)} hint="all states" />
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
                  "rounded-full border px-3.5 py-1.5 font-sans text-[0.8125rem] font-bold transition-colors",
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
            className="w-full md:w-72 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading review queue...</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="font-display text-lg font-bold text-heading">Queue is empty</h3>
            <p className="mt-1 text-[0.875rem] text-subtle">
              {filter === "All" ? "No stories found in the queue." : `No stories currently marked as '${filter}'.`}
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {rows.map((story) => {
              const isExpanded = Boolean(expandedHistories[story.id]);
              const rejections = story.rejectionReviews.length > 0
                ? story.rejectionReviews
                : story.rejectionFeedback
                ? [{ id: "current", feedback: story.rejectionFeedback, reviewed_at: story.date, reviewer_name: "Editorial Team" }]
                : [];

              return (
                <li
                  key={story.id}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start group hover:bg-surface-alt/30 px-3 rounded-2xl transition-colors"
                >
                  <div
                    onClick={() => setReadingStory(story)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          story.rawStatus === "PUBLISHED"
                            ? "success"
                            : story.rawStatus === "REJECTED"
                            ? "error"
                            : story.rawStatus === "PENDING_REVIEW"
                            ? "info"
                            : "warning"
                        }
                      >
                        {story.rawStatus === "REJECTED" ? "Rejected" : story.status}
                      </Badge>

                      {/* Rejection Count Badge */}
                      {story.rejectionCount > 0 && (
                        <Badge tone="error" className="font-bold gap-1 bg-destructive/15 text-destructive border-destructive/30">
                          <History className="size-3" />
                          <span>{story.rejectionCount} {story.rejectionCount === 1 ? "Rejection" : "Rejections"}</span>
                        </Badge>
                      )}

                      <span className="font-sans text-[0.75rem] font-bold text-subtle">{story.category}</span>
                    </div>

                    <h2 className="mt-2 text-[1.125rem] font-display font-bold leading-snug text-heading group-hover:text-primary transition-colors">
                      {story.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[0.875rem] text-body">{story.dek}</p>

                    {/* Rejection Reasons & History Accordion in Row */}
                    {rejections.length > 0 && (
                      <div
                        className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive max-w-xl cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>
                              Rejection History ({story.rejectionCount} {story.rejectionCount === 1 ? "time" : "times"})
                            </span>
                          </div>
                          {rejections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleHistory(story.id)}
                              className="text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                            >
                              {isExpanded ? "Collapse" : `View all (${rejections.length})`}
                              {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            </button>
                          )}
                        </div>

                        {/* If single or not expanded, show the latest rejection */}
                        {!isExpanded && (
                          <div className="mt-2 text-body">
                            <span className="font-bold text-destructive">Latest Reason: </span>
                            <span>{rejections[0]?.feedback || story.rejectionFeedback}</span>
                          </div>
                        )}

                        {/* If expanded, show full chronological list of each rejection reason */}
                        {isExpanded && (
                          <div className="mt-3 space-y-2.5 border-t border-destructive/20 pt-2.5">
                            {rejections.map((rv: any, idx: number) => (
                              <div key={rv.id || idx} className="rounded-lg bg-surface/80 p-2.5 border border-destructive/20 text-xs">
                                <div className="flex items-center justify-between text-[0.7rem] text-subtle font-semibold mb-1">
                                  <span className="text-destructive font-bold">Rejection #{rejections.length - idx}</span>
                                  <span>{rv.reviewed_at ? new Date(rv.reviewed_at).toLocaleString() : "Previous review"} · By {rv.reviewer_name || "Editor"}</span>
                                </div>
                                <p className="text-body font-normal leading-relaxed">{rv.feedback}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="mt-2.5 text-[0.8125rem] text-subtle">
                      Submitted by <strong className="text-heading">{story.writerName}</strong> · {story.date} · {story.readingTime} min read · {story.wordCount} words
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1">
                    <Button
                      variant="ghostOutline"
                      size="sm"
                      onClick={() => setReadingStory(story)}
                      className="gap-1.5"
                    >
                      <Eye className="size-4" /> Read
                    </Button>
                    {story.rawStatus === "PUBLISHED" ? (
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
                          <Check className="size-4" /> {story.rawStatus === "REJECTED" ? "Approve Anyway" : "Approve"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenReject(story)}
                          className="gap-1.5"
                        >
                          <X className="size-4" /> {story.rawStatus === "REJECTED" ? "Reject Again" : "Reject Story"}
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
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
                <Badge
                  tone={
                    readingStory.rawStatus === "PUBLISHED"
                      ? "success"
                      : readingStory.rawStatus === "REJECTED"
                      ? "error"
                      : "info"
                  }
                >
                  {readingStory.rawStatus === "REJECTED" ? "Rejected" : readingStory.status}
                </Badge>

                {readingStory.rejectionCount > 0 && (
                  <Badge tone="error" className="font-bold gap-1 bg-destructive/15 text-destructive border-destructive/30">
                    <History className="size-3" />
                    <span>Rejected {readingStory.rejectionCount}x</span>
                  </Badge>
                )}

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
              {/* Full Rejection Breakdown in Modal */}
              {readingStory.rejectionCount > 0 && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-destructive space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="size-5 shrink-0" />
                    <span>Rejection History ({readingStory.rejectionCount} {readingStory.rejectionCount === 1 ? "Rejection" : "Rejections"})</span>
                  </div>

                  <div className="space-y-2.5">
                    {(readingStory.rejectionReviews.length > 0
                      ? readingStory.rejectionReviews
                      : [{ id: "current", feedback: readingStory.rejectionFeedback, reviewed_at: readingStory.date, reviewer_name: "Editorial Team" }]
                    ).map((rv: any, idx: number, arr: any[]) => (
                      <div key={rv.id || idx} className="rounded-xl bg-surface p-3.5 border border-destructive/20 text-xs">
                        <div className="flex items-center justify-between text-subtle font-semibold mb-1">
                          <span className="text-destructive font-bold">Reason #{arr.length - idx}</span>
                          <span>{rv.reviewed_at ? new Date(rv.reviewed_at).toLocaleString() : "Previous review"} · Reviewer: {rv.reviewer_name || "Editor"}</span>
                        </div>
                        <p className="text-body font-normal leading-relaxed text-sm mt-1">{rv.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              <div className="prose prose-stone dark:prose-invert max-w-none text-[1.0625rem] leading-relaxed font-serif text-body border-t border-border pt-4 space-y-4 min-w-0 break-words [overflow-wrap:anywhere]">
                {readingStory.content ? (
                  readingStory.content
                    .split(/\n{2,}|\r\n\r\n/)
                    .map((p: string) => p.trim())
                    .filter(Boolean)
                    .map((p: string, idx: number) => (
                      <p key={idx} className="whitespace-pre-line leading-relaxed font-serif break-words [overflow-wrap:anywhere]">
                        {p}
                      </p>
                    ))
                ) : (
                  <p className="text-subtle italic">No story content available.</p>
                )}
              </div>
            </div>

            {/* Modal Review Actions Bar */}
            <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-md">
              <Button variant="ghostOutline" size="sm" onClick={() => setReadingStory(null)}>
                Close Preview
              </Button>
              <div className="flex items-center gap-2">
                {readingStory.rawStatus !== "PUBLISHED" && (
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
                      <X className="size-4" /> {readingStory.rawStatus === "REJECTED" ? "Reject Again" : "Reject Story"}
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
                      <Check className="size-4" /> Approve & Publish
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
                <h3 className="font-display text-lg font-bold text-heading">
                  {rejectingStory.rejectionCount > 0
                    ? `Reject Story (Rejection #${rejectingStory.rejectionCount + 1})`
                    : "Reject Story & Provide Feedback"}
                </h3>
                <p className="text-xs text-subtle truncate max-w-sm mt-0.5">"{rejectingStory.title}"</p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingStory(null)}
                className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-hover hover:text-heading"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-body leading-relaxed">
              Please enter the specific reason and editorial feedback for this rejection. Each rejection is logged with its timestamp and reason for author review.
            </p>

            <Textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Please expand on the character's backstory in chapter 2 and fix typographical issues before resubmitting."
              className="text-sm"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghostOutline"
                size="sm"
                onClick={() => setRejectingStory(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={rejectMutation.isPending || !feedbackText.trim()}
                onClick={handleConfirmReject}
                className="gap-1.5 font-bold"
              >
                <X className="size-4" /> {rejectMutation.isPending ? "Submitting..." : `Record Rejection ${rejectingStory.rejectionCount > 0 ? `#${rejectingStory.rejectionCount + 1}` : ""}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
