import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, BookOpen, Check, ChevronDown, ChevronUp, Clock, Eye, History, Layers, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, Input, Panel, Textarea } from "@/components/tossa/kit";
import { Pagination } from "@/components/tossa/Pagination";
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
  const [page, setPage] = useState(1);
  const [readingStory, setReadingStory] = useState<any | null>(null);
  const [activeModalChapterIdx, setActiveModalChapterIdx] = useState<number>(0);
  const [rejectingStory, setRejectingStory] = useState<any | null>(null);
  const [rejectingChapter, setRejectingChapter] = useState<{ storyId: string; chapter: any } | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [chapterFeedbackText, setChapterFeedbackText] = useState("");
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const toggleHistory = (storyId: string) => {
    setExpandedHistories((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["admin-review-queue", filter, page],
    queryFn: async () => {
      let statusQuery = "status=ALL";
      if (filter === "Published") statusQuery = "status=PUBLISHED";
      else if (filter === "In review") statusQuery = "status=PENDING_REVIEW";
      else if (filter === "Rejected") statusQuery = "status=REJECTED";

      const res: any = await api.get(`/admin/reviews/queue/?${statusQuery}&page=${page}&page_size=12`);
      return res.data;
    },
  });

  const { data: readingChaptersData } = useQuery({
    queryKey: ["admin-review-story-chapters", readingStory?.id],
    queryFn: async () => {
      if (!readingStory?.id || !readingStory.isMultiChapter) return [];
      const res: any = await api.get(`/admin/stories/${readingStory.id}/chapters/`);
      const unwrapped = res?.data?.results || res?.data?.data || res?.data || res?.results || (Array.isArray(res) ? res : []);
      return Array.isArray(unwrapped) ? unwrapped : [];
    },
    enabled: Boolean(readingStory?.id && readingStory.isMultiChapter),
  });

  const apiQueue = apiResponse?.results || (Array.isArray(apiResponse?.data?.results) ? apiResponse.data.results : (Array.isArray(apiResponse?.data) ? apiResponse.data : (Array.isArray(apiResponse) ? apiResponse : [])));
  const totalReviewsCount = apiResponse?.count ?? apiResponse?.data?.count ?? (Array.isArray(apiQueue) ? apiQueue.length : 0);
  const totalPages = Math.ceil(totalReviewsCount / 12) || 1;

  const approveMutation = useMutation({
    mutationFn: async (storyId: string) => {
      return await api.post(`/admin/reviews/${storyId}/approve/`);
    },
    onSuccess: () => {
      toast.success("Story approved successfully!", {
        description: "The story is now published and live in the tossatale library.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-story-chapters"] });
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

  const approveChapterMutation = useMutation({
    mutationFn: async ({ storyId, chapterId }: { storyId: string; chapterId: string }) => {
      return await api.post(`/admin/stories/${storyId}/chapters/${chapterId}/publish/`);
    },
    onSuccess: () => {
      toast.success("Chapter approved & published live!", {
        description: "The chapter is now live for public readers.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-story-chapters"] });
    },
    onError: (err: any) => {
      toast.error("Chapter approval failed", {
        description: err.response?.data?.message || err.message || "Could not approve chapter.",
      });
    },
  });

  const rejectChapterMutation = useMutation({
    mutationFn: async ({ storyId, chapterId, feedback }: { storyId: string; chapterId: string; feedback: string }) => {
      return await api.post(`/admin/stories/${storyId}/chapters/${chapterId}/reject/`, { rejection_feedback: feedback });
    },
    onSuccess: () => {
      toast.success("Chapter rejected with feedback", {
        description: "Chapter status updated to Rejected and feedback sent to writer.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-story-chapters"] });
      setRejectingChapter(null);
      setChapterFeedbackText("");
    },
    onError: (err: any) => {
      toast.error("Chapter rejection failed", {
        description: err.response?.data?.message || err.message || "Could not reject chapter.",
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

  const handleConfirmChapterReject = () => {
    if (!rejectingChapter) return;
    if (!chapterFeedbackText.trim() || chapterFeedbackText.trim().length < 5) {
      toast.error("Chapter rejection feedback is mandatory (at least 5 characters).");
      return;
    }
    rejectChapterMutation.mutate({
      storyId: rejectingChapter.storyId,
      chapterId: rejectingChapter.chapter.id,
      feedback: chapterFeedbackText.trim(),
    });
  };

  const rows = (apiQueue && Array.isArray(apiQueue))
    ? apiQueue.map((s: any) => {
        const reviewsList = Array.isArray(s.reviews) ? s.reviews : [];
        const rejectionReviews = reviewsList.filter((r: any) => r.decision === "REJECTED");
        const rejectionCount = s.rejection_count ?? (rejectionReviews.length > 0 ? rejectionReviews.length : s.rejection_feedback ? 1 : 0);
        const isMultiChapter = Boolean(s.is_multi_chapter || s.chapters?.length > 0 || (s.chapter_count && s.chapter_count > 0));
        const chaptersList = Array.isArray(s.chapters) ? s.chapters : [];
        const pendingChapters = chaptersList.filter((c: any) => c.status === "PENDING_REVIEW");

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
          isMultiChapter,
          seriesStatus: s.series_status || "ONGOING",
          chapterCount: s.chapter_count || chaptersList.length,
          pendingChaptersCount: pendingChapters.length,
          chapters: chaptersList,
          rejectionFeedback: s.rejection_feedback || "",
          rejectionCount: Number(rejectionCount),
          reviews: reviewsList,
          rejectionReviews: rejectionReviews,
          status: s.status === "PUBLISHED" ? "Published" : s.status === "PENDING_REVIEW" ? "In review" : s.status === "REJECTED" ? "Rejected" : s.status === "DRAFT" ? "Draft" : "In review",
        };
      }).filter((r: any) => r.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const stats = apiResponse?.data?.stats || apiResponse?.stats || {};
  const inQueueCount = stats.total_in_queue ?? (filter === "In review" ? totalReviewsCount : rows.filter((r) => r.rawStatus === "PENDING_REVIEW").length);
  const rejectedCount = stats.total_rejected ?? (filter === "Rejected" ? totalReviewsCount : rows.filter((r) => r.rawStatus === "REJECTED").length);
  const publishedCount = stats.total_published ?? (filter === "Published" ? totalReviewsCount : rows.filter((r) => r.rawStatus === "PUBLISHED").length);
  const totalSubmissionsCount = stats.total_submissions ?? (filter === "All" ? totalReviewsCount : rows.length);

  return (
    <AppShell
      role="admin"
      title="Review queue"
      blurb="Every submission, in the order it arrived. Read, leave editorial feedback, approve or track rejection histories."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="In queue" value={String(inQueueCount)} hint="pending editorial review" />
        <StatCard label="Rejected" value={String(rejectedCount)} hint="needs author revision" />
        <StatCard label="Published" value={String(publishedCount)} hint="live in library" />
        <StatCard label="Total Submissions" value={String(totalSubmissionsCount)} hint="all states" />
      </div>

      <Panel className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
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
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
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

                      {/* Multi-chapter Series Badge */}
                      {story.isMultiChapter && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge tone="info" className="font-bold gap-1">
                            <Layers className="size-3" />
                            <span>
                              Series ({story.chapterCount || story.chapters?.length || 0}{" "}
                              {(story.chapterCount || story.chapters?.length) === 1 ? "Chapter" : "Chapters"})
                            </span>
                          </Badge>
                          {story.pendingChaptersCount > 0 && (
                            <Badge tone="warning" className="font-bold gap-1">
                              <span>
                                ⏳ {story.pendingChaptersCount} {story.pendingChaptersCount === 1 ? "Chapter" : "Chapters"} in Review
                              </span>
                            </Badge>
                          )}
                        </div>
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
                      onClick={() => {
                        setActiveModalChapterIdx(0);
                        setReadingStory(story);
                      }}
                      className="gap-1.5"
                    >
                      <Eye className="size-4" /> Read
                    </Button>
                    {story.rawStatus === "PUBLISHED" ? (
                      <div className="flex items-center gap-2">
                        <Badge tone="success" className="px-3.5 py-1.5 font-bold text-xs">Published Live</Badge>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenReject(story)}
                          className="gap-1.5"
                          title="Unpublish this story and send feedback to writer"
                        >
                          <X className="size-4" /> Unpublish & Reject
                        </Button>
                      </div>
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

        {/* Review Queue Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 border-t border-border pt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalReviewsCount}
              pageSize={12}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
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

                {readingStory.isMultiChapter && (
                  <Badge tone="info" className="font-bold gap-1">
                    <BookOpen className="size-3" />
                    <span>Multi-Chapter Series</span>
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

              {/* Multi-Chapter Series Chapters Studio Inspector */}
              {readingStory.isMultiChapter && (
                (() => {
                  const chaptersToRender =
                    readingChaptersData && readingChaptersData.length > 0
                      ? readingChaptersData
                      : readingStory.chapters || [];
                  const activeChapter = chaptersToRender[activeModalChapterIdx] || chaptersToRender[0];

                  return (
                    <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/15 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <BookOpen className="size-3.5" /> Series Table of Chapters ({chaptersToRender.length})
                          </span>
                          <Badge
                            tone={readingStory.seriesStatus === "COMPLETED" ? "neutral" : "success"}
                            className="text-[0.625rem] px-2 py-0.5 font-bold"
                          >
                            {readingStory.seriesStatus === "COMPLETED" ? "Completed Series" : "Ongoing Series"}
                          </Badge>
                        </div>
                        <span className="text-xs text-subtle font-medium">
                          Click any chapter below to review its contents
                        </span>
                      </div>

                      {/* Chapter Navigation Chips */}
                      {chaptersToRender.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {chaptersToRender.map((ch: any, idx: number) => {
                            const isSelected = activeModalChapterIdx === idx;
                            const chStatus = ch.status || "DRAFT";
                            return (
                              <button
                                key={ch.id || idx}
                                type="button"
                                onClick={() => setActiveModalChapterIdx(idx)}
                                className={cn(
                                  "rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
                                  isSelected
                                    ? "bg-primary text-white shadow-xs"
                                    : "bg-surface border border-border text-heading hover:bg-surface-hover hover:border-primary/40"
                                )}
                              >
                                <span className={cn("size-4 grid place-items-center rounded-md text-[0.625rem]", isSelected ? "bg-white/20 text-white" : "bg-surface-alt text-subtle")}>
                                  {idx + 1}
                                </span>
                                <span className="truncate max-w-[140px]">{ch.title || `Chapter ${idx + 1}`}</span>
                                <span
                                  className={cn(
                                    "size-2 rounded-full shrink-0",
                                    chStatus === "PUBLISHED"
                                      ? "bg-emerald-500"
                                      : chStatus === "PENDING_REVIEW"
                                      ? "bg-amber-500 animate-pulse"
                                      : chStatus === "REJECTED"
                                      ? "bg-rose-500"
                                      : "bg-zinc-400"
                                  )}
                                  title={`Status: ${chStatus}`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-subtle italic">No chapters recorded for this series draft.</p>
                      )}

                      {/* Active Chapter Details */}
                      {activeChapter && (
                        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 mt-3 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-display font-bold text-base text-heading flex items-center gap-1.5">
                                <span className="text-primary font-mono text-xs">Ch.{activeChapter.order || activeModalChapterIdx + 1}:</span>
                                {activeChapter.title || `Chapter ${activeModalChapterIdx + 1}`}
                              </h3>
                              <Badge
                                tone={
                                  activeChapter.status === "PUBLISHED"
                                    ? "success"
                                    : activeChapter.status === "PENDING_REVIEW"
                                    ? "warning"
                                    : activeChapter.status === "REJECTED"
                                    ? "error"
                                    : "neutral"
                                }
                                className="text-[0.6875rem] px-2 py-0.5 font-bold"
                              >
                                {activeChapter.status === "PUBLISHED"
                                  ? "Published"
                                  : activeChapter.status === "PENDING_REVIEW"
                                  ? "Pending Review"
                                  : activeChapter.status === "REJECTED"
                                  ? "Rejected"
                                  : "Draft"}
                              </Badge>
                              <span className="text-xs text-subtle">
                                {(activeChapter.content ? activeChapter.content.trim().split(/\s+/).filter(Boolean).length : activeChapter.word_count || 0).toLocaleString()} words · ~{Math.max(1, Math.ceil((activeChapter.content ? activeChapter.content.trim().split(/\s+/).filter(Boolean).length : 0) / 220))}m read
                              </span>
                            </div>

                            {/* Chapter Review Actions */}
                            <div className="flex items-center gap-2">
                              {activeChapter.status === "PUBLISHED" ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="size-3.5" /> Published Live
                                  </span>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      setRejectingChapter({
                                        storyId: readingStory.id,
                                        chapter: activeChapter,
                                      });
                                      setChapterFeedbackText(activeChapter.rejection_feedback || "");
                                    }}
                                    className="gap-1 text-xs h-7.5 px-2.5 font-bold"
                                    title="Unpublish this chapter and send feedback"
                                  >
                                    <X className="size-3.5" /> Unpublish Chapter
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      setRejectingChapter({
                                        storyId: readingStory.id,
                                        chapter: activeChapter,
                                      });
                                      setChapterFeedbackText(activeChapter.rejection_feedback || "");
                                    }}
                                    className="gap-1 text-xs h-7.5 px-2.5 font-bold"
                                  >
                                    <X className="size-3.5" /> {activeChapter.status === "REJECTED" ? "Reject Again" : "Reject Chapter"}
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={approveChapterMutation.isPending}
                                    onClick={() => {
                                      approveChapterMutation.mutate({
                                        storyId: readingStory.id,
                                        chapterId: activeChapter.id,
                                      });
                                    }}
                                    className="gap-1 text-xs h-7.5 px-2.5 font-bold"
                                  >
                                    <Check className="size-3.5" /> Approve & Publish Chapter
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Rejection Feedback if any on chapter */}
                          {activeChapter.rejection_feedback && (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive space-y-1">
                              <span className="font-bold flex items-center gap-1">
                                <AlertCircle className="size-3.5" /> Chapter Revision Note:
                              </span>
                              <p className="text-body">{activeChapter.rejection_feedback}</p>
                            </div>
                          )}

                          <div className="prose prose-stone dark:prose-invert max-w-none text-[1.0625rem] leading-relaxed font-serif text-body pt-1 space-y-3">
                            {activeChapter.content ? (
                              activeChapter.content
                                .split(/\n{2,}|\r\n\r\n/)
                                .map((p: string) => p.trim())
                                .filter(Boolean)
                                .map((p: string, idx: number) => (
                                  <p key={idx} className="whitespace-pre-line leading-relaxed font-serif">
                                    {p}
                                  </p>
                                ))
                            ) : (
                              <p className="text-subtle italic">This chapter has no text content.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* Single Story Content Typography */}
              {(!readingStory.isMultiChapter || (readingStory.chapters?.length === 0 && !readingChaptersData?.length)) && (
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
              )}
            </div>

            {/* Modal Review Actions Bar */}
            <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-md">
              <Button variant="ghostOutline" size="sm" onClick={() => setReadingStory(null)}>
                Close Preview
              </Button>
              <div className="flex items-center gap-2">
                {readingStory.rawStatus === "PUBLISHED" ? (
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
                    <X className="size-4" /> Unpublish & Reject Story
                  </Button>
                ) : (
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
                      <X className="size-4" /> {readingStory.rawStatus === "REJECTED" ? "Reject Entire Story" : "Reject Entire Story"}
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
                      <Check className="size-4" /> {readingStory.isMultiChapter ? "Approve & Publish All Chapters" : "Approve & Publish"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Rejection Feedback Modal */}
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
                  {rejectingStory.rawStatus === "PUBLISHED"
                    ? "Unpublish Story & Request Revisions"
                    : rejectingStory.rejectionCount > 0
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
                <X className="size-4" /> {rejectMutation.isPending ? "Submitting..." : rejectingStory.rawStatus === "PUBLISHED" ? "Unpublish & Send Feedback" : `Record Rejection ${rejectingStory.rejectionCount > 0 ? `#${rejectingStory.rejectionCount + 1}` : ""}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Rejection Feedback Modal */}
      {rejectingChapter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setRejectingChapter(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-heading">
                  Reject Chapter & Request Revisions
                </h3>
                <p className="text-xs text-subtle truncate max-w-sm mt-0.5">
                  Ch.{rejectingChapter.chapter.order}: "{rejectingChapter.chapter.title || 'Untitled Chapter'}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingChapter(null)}
                className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-hover hover:text-heading"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-body leading-relaxed">
              Provide editorial guidance for the author explaining what needs improvement in this specific chapter.
            </p>

            <Textarea
              rows={4}
              value={chapterFeedbackText}
              onChange={(e) => setChapterFeedbackText(e.target.value)}
              placeholder="e.g. Please clarify the dialogue sequence between characters in this chapter and check grammar."
              className="text-sm"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghostOutline"
                size="sm"
                onClick={() => setRejectingChapter(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={rejectChapterMutation.isPending || !chapterFeedbackText.trim()}
                onClick={handleConfirmChapterReject}
                className="gap-1.5 font-bold"
              >
                <X className="size-4" /> {rejectChapterMutation.isPending ? "Rejecting..." : "Reject Chapter"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

