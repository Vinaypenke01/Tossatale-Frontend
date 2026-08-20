import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ButtonLink, EmptyState, Input } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { StoryCard } from "@/components/tossa/StoryCard";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/reader/bookmarks")({
  head: () => pageHead("Saved stories · tossatale", "Your reading list, organised into shelves you made yourself."),
  component: Bookmarks,
});

function Bookmarks() {
  const [shelf, setShelf] = useState("All saved");
  const [query, setQuery] = useState("");
  const shelves = ["All saved", "Quick Reads", "Read at your pace", "Late-Night Reads"];

  const { data: apiBookmarks, isLoading } = useQuery({
    queryKey: ["reader-bookmarks"],
    queryFn: async () => {
      const res = await api.get("/user/bookmarks/");
      return res.data?.results || res.data || [];
    },
  });

  const saved = (apiBookmarks && Array.isArray(apiBookmarks))
    ? apiBookmarks.map((b: any) => {
        const storyObj = b.story || {};
        const rawProgress = Number(b.reading_progress ?? storyObj.reading_progress ?? 0);
        const progressVal = Math.min(100, Math.max(0, Math.round(rawProgress)));
        const isLiked = typeof b.is_liked === "boolean" ? b.is_liked : typeof storyObj.is_liked === "boolean" ? storyObj.is_liked : false;

        return {
          id: storyObj.id || b.story_id,
          slug: storyObj.slug || b.story_id,
          title: storyObj.title || "Bookmarked story",
          dek: storyObj.subtitle || storyObj.seo_description || "Saved for later reading.",
          writer: storyObj.writer?.slug || "writer",
          writerName: storyObj.writer?.name || storyObj.writer?.user?.full_name || "Author",
          writerGender: storyObj.writer?.gender || "OTHER",
          writerPhoto: storyObj.writer?.profile_photo || "",
          verified: storyObj.writer?.is_verified || false,
          category: storyObj.category?.name || "General",
          date: b.created_at ? new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Saved",
          readingTime: storyObj.estimated_reading_time || 5,
          views: storyObj.views_count || 0,
          likes: storyObj.likes_count || 0,
          likes_count: storyObj.likes_count || 0,
          is_liked: isLiked,
          is_bookmarked: true,
          bookmarked: true,
          progress: progressVal,
          completed: b.completed || progressVal >= 95,
        };
      }).filter((s: any) => s.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <ReaderLayout
      title="Bookmarks"
      blurb="Stories waiting for a quieter evening."
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {shelves.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShelf(s)}
              className={cn(
                "rounded-full border px-4 py-2 font-sans text-[0.875rem] font-bold transition-colors",
                shelf === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-body hover:border-primary hover:text-primary",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved stories"
          className="md:w-72"
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-subtle font-medium">Loading bookmarks...</div>
      ) : saved.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s: any) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="size-5" />}
          title="Nothing saved yet"
          blurb="Tap the bookmark icon on any story and it will wait for you here."
          action={<ButtonLink to="/stories">Browse the library</ButtonLink>}
        />
      )}
    </ReaderLayout>
  );
}
