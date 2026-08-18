import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Heart, PenLine, Send } from "lucide-react";
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
        description: "Editorial team will review your story shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["writer-stories"] });
    },
    onError: (err: any) => {
      toast.error("Submission failed", {
        description: err.message || "Could not submit story for review.",
      });
    },
  });

  const rows = (apiStories && Array.isArray(apiStories))
    ? apiStories.map((s: any) => ({
        id: s.id,
        slug: s.slug || s.id,
        title: s.title,
        category: s.category?.name || "General",
        date: s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
        readingTime: s.estimated_reading_time || 5,
        views: s.views_count || 0,
        likes: s.likes_count || 0,
        status: s.status === "DRAFT" ? "Draft" : s.status === "PENDING_REVIEW" ? "In review" : "Published",
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
            {rows.map(({ id, slug, title, category, date, readingTime, views, likes, status, rawStatus }: any) => (
              <li key={id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Badge tone={status === "Draft" ? "warning" : status === "In review" ? "info" : "success"}>
                    {status}
                  </Badge>
                  <h2 className="mt-2 text-[1.125rem] leading-snug font-display font-bold">{title}</h2>
                  <p className="mt-1 text-[0.8125rem] text-subtle">
                    {category} · {date} · {readingTime} min
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5 text-[0.8125rem] text-subtle">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-3.5" /> {views}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="size-3.5" /> {likes}
                  </span>
                  {rawStatus === "DRAFT" && (
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => submitMutation.mutate(id)}
                      className="gap-1.5"
                    >
                      <Send className="size-3.5" /> Submit
                    </Button>
                  )}
                  <Link
                    to="/writer/editor/$storyId"
                    params={{ storyId: slug }}
                    className="font-sans font-bold text-primary"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
