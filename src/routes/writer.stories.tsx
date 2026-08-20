import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Check, Eye, Heart, PenLine, Send, Trash2, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, ButtonLink, Panel, Button } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/writer/stories")({
  head: () => pageHead("My stories · tossatale studio", "Every draft, submission and published story you've written."),
  component: MyStories,
});

const tabs = ["All", "Drafts", "In review", "Published"] as const;

function MyStories() {
  const [tab, setTab] = useState<string>("All");
  const [viewingStory, setViewingStory] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: apiStories, isLoading } = useQuery({
    queryKey: ["writer-stories"],
    queryFn: async () => {
      const res = await api.get("/writer/stories/");
      return res.data?.results || res.data || [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (storyId: string) => {
      return await api.post(`/writer/stories/${storyId}/submit/`);
    },
    onSuccess: () => {
      toast.success("Story submitted for review!", {
        description: "The tossatale editorial team will review your story shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["writer-stories"] });
      setViewingStory(null);
    },
    onError: (err: any) => {
      toast.error("Submission failed", {
        description: err.response?.data?.message || err.message || "Could not submit story for review.",
      });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      return await api.delete(`/writer/stories/${storyId}/`);
    },
    onSuccess: () => {
      toast.success("Draft deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["writer-stories"] });
      setViewingStory(null);
    },
    onError: (err: any) => {
      toast.error("Failed to delete draft", {
        description: err.response?.data?.message || err.message || "Could not delete story.",
      });
    },
  });

  const handleDeleteStory = (story: any) => {
    if (window.confirm(`Are you sure you want to delete the draft "${story.title}"?`)) {
      deleteStoryMutation.mutate(story.slug || story.id);
    }
  };

  const rows = (apiStories && Array.isArray(apiStories))
    ? apiStories.map((s: any) => ({
        id: s.id,
        slug: s.slug || s.id,
        title: s.title,
        subtitle: s.subtitle || "",
        content: s.content || s.body || "No content written yet.",
        coverImage: s.cover_image || s.featured_image || "",
        category: s.category?.name || "General",
        date: s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
        readingTime: s.estimated_reading_time || 5,
        wordCount: s.word_count || (s.content ? s.content.trim().split(/\s+/).length : 0),
        views: s.views_count || 0,
        likes: s.likes_count || 0,
        rejectionFeedback: s.rejection_feedback || "",
        status: s.status === "DRAFT" ? "Draft" : s.status === "PENDING_REVIEW" ? "In review" : s.status === "REJECTED" ? "Needs revision" : "Published",
        rawStatus: s.status,
      })).filter((r: any) => (tab === "All" ? true : r.status === (tab === "Drafts" ? "Draft" : tab)))
    : [];

  return (
    <AppShell
      role="writer"
      title="My stories"
      blurb="Your drafts, submissions and published stories."
      actions={
        <ButtonLink to="/writer/editor" variant="primary">
          <PenLine className="size-4" /> New story
        </ButtonLink>
      }
    >
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-2 font-sans text-[0.875rem] font-bold transition-colors",
              tab === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-body hover:border-primary hover:text-primary",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Panel className="p-6">
        {isLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading your stories...</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="font-display text-lg font-bold text-heading">No stories found</h3>
            <p className="mt-1 text-[0.875rem] text-subtle">
              {tab === "All" ? "You haven't written any stories yet. Click 'New story' to start writing!" : `You have no stories under '${tab}'.`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((story: any) => (
              <li key={story.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center group hover:bg-surface-alt/30 px-3 rounded-2xl transition-colors">
                <div
                  onClick={() => setViewingStory(story)}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Badge tone={story.status === "Draft" ? "warning" : story.status === "In review" ? "info" : story.status === "Needs revision" ? "error" : "success"}>
                      {story.status}
                    </Badge>
                    <span className="font-sans text-[0.75rem] font-bold text-subtle">{story.category}</span>
                  </div>
                  <h2 className="mt-2 text-[1.125rem] leading-snug font-display font-bold text-heading group-hover:text-primary transition-colors">
                    {story.title}
                  </h2>
                  <p className="mt-1 text-[0.8125rem] text-subtle">
                    {story.date} · {story.readingTime} min read · {story.wordCount} words
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[0.8125rem] text-subtle">
                  <Button
                    variant="ghostOutline"
                    size="sm"
                    onClick={() => setViewingStory(story)}
                    className="gap-1.5"
                  >
                    <Eye className="size-3.5" /> View
                  </Button>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Eye className="size-3.5" /> {story.views}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Heart className="size-3.5" /> {story.likes}
                  </span>
                  {(story.rawStatus === "DRAFT" || story.rawStatus === "REJECTED") && (
                    <Button
                      variant="soft"
                      size="sm"
                      disabled={submitMutation.isPending}
                      onClick={() => submitMutation.mutate(story.id)}
                      className="gap-1.5"
                    >
                      <Send className="size-3.5" /> Submit
                    </Button>
                  )}
                  {story.rawStatus === "DRAFT" && (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deleteStoryMutation.isPending}
                      onClick={() => handleDeleteStory(story)}
                      className="h-8 px-2 text-xs"
                      title="Delete Draft"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                  <Link
                    to="/writer/editor/$storyId"
                    params={{ storyId: story.slug }}
                    className="font-sans font-bold text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Story View/Preview Pop-up Modal */}
      {viewingStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setViewingStory(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Badge tone={viewingStory.status === "Draft" ? "warning" : viewingStory.status === "In review" ? "info" : viewingStory.status === "Needs revision" ? "error" : "success"}>
                  {viewingStory.status}
                </Badge>
                <span className="text-xs font-bold text-subtle font-sans">{viewingStory.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingStory(null)}
                aria-label="Close story preview"
                className="grid size-9 place-items-center rounded-full text-subtle hover:bg-surface-hover hover:text-heading transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable Story Content) */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {viewingStory.rejectionFeedback && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-[0.875rem] text-destructive flex items-start gap-3">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Editorial Feedback:</strong>
                    <p className="mt-1 leading-relaxed">{viewingStory.rejectionFeedback}</p>
                  </div>
                </div>
              )}

              {viewingStory.coverImage && (
                <img
                  src={viewingStory.coverImage}
                  alt={viewingStory.title}
                  className="w-full max-h-80 object-cover rounded-2xl border border-border shadow-xs"
                />
              )}

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-heading">
                  {viewingStory.title}
                </h1>
                {viewingStory.subtitle && (
                  <p className="mt-2 text-[1.0625rem] text-body font-sans font-medium">
                    {viewingStory.subtitle}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-y border-border py-3 text-xs text-subtle">
                  <span>Created on {viewingStory.date}</span>
                  <span>{viewingStory.readingTime} min read · {viewingStory.wordCount} words · {viewingStory.views} views</span>
                </div>
              </div>

              {/* Story Content Typography */}
              <div className="prose prose-stone dark:prose-invert max-w-none text-[1.0625rem] leading-relaxed font-serif whitespace-pre-line text-body border-t border-border pt-4">
                {viewingStory.content}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-md">
              <Button variant="ghostOutline" size="sm" onClick={() => setViewingStory(null)}>
                Close
              </Button>
              <div className="flex items-center gap-2">
                {viewingStory.rawStatus === "DRAFT" && (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deleteStoryMutation.isPending}
                    onClick={() => handleDeleteStory(viewingStory)}
                    className="gap-1.5"
                  >
                    <Trash2 className="size-4" /> Delete Draft
                  </Button>
                )}
                <ButtonLink
                  to="/writer/editor/$storyId"
                  params={{ storyId: viewingStory.slug }}
                  variant="ghostOutline"
                  size="sm"
                  className="gap-1.5"
                >
                  <PenLine className="size-4" /> Edit Story
                </ButtonLink>
                {(viewingStory.rawStatus === "DRAFT" || viewingStory.rawStatus === "REJECTED") && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={submitMutation.isPending}
                    onClick={() => submitMutation.mutate(viewingStory.id)}
                    className="gap-1.5"
                  >
                    <Send className="size-4" /> {viewingStory.rawStatus === "REJECTED" ? "Resubmit for Review" : "Submit for Review"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
