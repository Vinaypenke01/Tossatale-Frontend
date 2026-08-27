import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart3,
  Bookmark,
  BookOpen,
  Clock,
  Download,
  Eye,
  ExternalLink,
  Filter,
  Flame,
  Heart,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Badge, Button, Input, Panel } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/analytics")({
  head: () =>
    pageHead(
      "Platform analytics · tossatale admin",
      "Readership, retention and category performance across all individual stories."
    ),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"likes" | "views" | "bookmarks" | "recent">("likes");
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin-analytics-overview"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics/overview/");
      return res.data?.data || res.data || {};
    },
  });

  const summary = analyticsData?.platform_summary || {
    total_published_stories: 0,
    total_views: 0,
    total_likes: 0,
    total_bookmarks: 0,
    total_shares: 0,
    total_unauthenticated_like_attempts: 0,
    total_writers: 0,
  };

  const categoryBreakdown = Array.isArray(analyticsData?.category_breakdown)
    ? analyticsData.category_breakdown
    : [];

  const topStories = Array.isArray(analyticsData?.top_stories)
    ? analyticsData.top_stories
    : [];

  const allStories = Array.isArray(analyticsData?.all_stories)
    ? analyticsData.all_stories
    : topStories;

  // Filter and sort stories for individual analytics
  const filteredStories = useMemo(() => {
    return allStories
      .filter((s: any) => {
        const matchesSearch =
          !searchQuery.trim() ||
          s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.writer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.writer?.pen_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || s.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "likes") {
          const valA = Number(a.likes_count ?? a.likes ?? 0);
          const valB = Number(b.likes_count ?? b.likes ?? 0);
          if (valB !== valA) return valB - valA;
          return Number(b.views_count ?? b.views ?? 0) - Number(a.views_count ?? a.views ?? 0);
        }
        if (sortBy === "views") {
          const valA = Number(a.views_count ?? a.views ?? 0);
          const valB = Number(b.views_count ?? b.views ?? 0);
          if (valB !== valA) return valB - valA;
          return Number(b.likes_count ?? b.likes ?? 0) - Number(a.likes_count ?? a.likes ?? 0);
        }
        if (sortBy === "bookmarks") {
          const valA = Number(a.bookmarks_count ?? a.bookmarks ?? 0);
          const valB = Number(b.bookmarks_count ?? b.bookmarks ?? 0);
          if (valB !== valA) return valB - valA;
          return Number(b.likes_count ?? b.likes ?? 0) - Number(a.likes_count ?? a.likes ?? 0);
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [allStories, searchQuery, statusFilter, sortBy]);

  const handleExportCSV = async () => {
    try {
      window.open("http://127.0.0.1:8000/api/v1/admin/analytics/platform/export/", "_blank");
      toast.success("Downloading analytics CSV statement...");
    } catch {
      toast.error("Failed to export statement");
    }
  };

  const maxCategoryViews = Math.max(...categoryBreakdown.map((c: any) => c.total_views || 0), 1);

  return (
    <AppShell
      role="admin"
      title="Platform & Story Analytics"
      blurb="Real-time readership metrics, engagement rates, verified likes, bookmarks, and individual story performance."
      actions={
        <Button variant="ghostOutline" onClick={handleExportCSV}>
          <Download className="size-4" /> Export CSV
        </Button>
      }
    >
      {/* 1. Global Platform Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Views / Reads" value={Number(summary.total_views).toLocaleString()} />
        <StatCard label="Published Stories" value={Number(summary.total_published_stories).toLocaleString()} />
        <StatCard label="Verified Likes" value={Number(summary.total_likes).toLocaleString()} />
        <StatCard label="Bookmarks / Saves" value={Number(summary.total_bookmarks || 0).toLocaleString()} />
        <StatCard label="Total Writers" value={Number(summary.total_writers).toLocaleString()} />
      </div>

      {/* 2. Category Breakdown & Top Performing Stories */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown Panel */}
        <Panel className="p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-xl font-display font-bold text-heading">Category breakdown</h2>
            <span className="text-xs font-semibold text-subtle">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-subtle font-medium">Loading categories...</div>
          ) : categoryBreakdown.length === 0 ? (
            <EmptySectionFallback
              icon="category"
              title="Category Statistics"
              description="Category readership performance metrics are tracked dynamically as readers engage with content."
            />
          ) : (
            <div className="mt-4 space-y-4">
              {categoryBreakdown.map((cat: any) => {
                const percentage = Math.round(((cat.total_views || 0) / maxCategoryViews) * 100);
                return (
                  <div key={cat.id || cat.slug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-heading">{cat.name}</span>
                      <div className="flex items-center gap-3 text-subtle">
                        <span>{cat.story_count} {cat.story_count === 1 ? "story" : "stories"}</span>
                        <span>·</span>
                        <span className="font-semibold text-heading">{Number(cat.total_views || 0).toLocaleString()} reads</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Top Performing Stories Panel */}
        <Panel className="p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-xl font-display font-bold text-heading">Top Performing Stories</h2>
            <span className="text-xs font-semibold text-subtle">By Views</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-subtle font-medium">Loading platform analytics...</div>
          ) : topStories.length === 0 ? (
            <EmptySectionFallback
              icon="book"
              title="No Readership Data"
              description="Top performing stories across the platform will display here once readers begin reading."
            />
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {topStories.map((s: any, i: number) => (
                <li key={s.id || s.slug} className="flex items-center gap-3.5 py-3 hover:bg-surface-alt/40 px-2 rounded-xl transition-colors">
                  <span className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold",
                    i === 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                    i === 1 ? "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300" :
                    i === 2 ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" :
                    "bg-surface-alt text-subtle"
                  )}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[0.875rem] font-bold text-heading">{s.title}</p>
                    <p className="text-[0.75rem] text-subtle">
                      {s.writer?.name || s.writer?.pen_name || s.writer?.user?.full_name || "Author"} · {s.category?.name || "General"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-heading">
                      <Eye className="size-3.5 text-blue-500" />
                      {Number(s.views_count || 0).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-rose-500">
                      <Heart className="size-3.5 fill-rose-500/20" />
                      {Number(s.likes_count || 0).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* 3. Comprehensive Individual Story Analytics Section */}
      <Panel className="p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <div>
            <h2 className="text-xl font-display font-bold text-heading flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" /> Individual Story Performance
            </h2>
            <p className="mt-1 text-[0.875rem] text-subtle">
              Complete analytics breakdown for every story across views, likes, saves, and reading metrics.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories, authors..."
                className="h-9 pl-9 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center rounded-xl bg-surface-alt p-1 text-xs font-semibold">
              {["ALL", "PUBLISHED", "PENDING_REVIEW", "DRAFT"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 transition-all",
                    statusFilter === st
                      ? "bg-surface text-primary shadow-xs"
                      : "text-subtle hover:text-heading"
                  )}
                >
                  {st === "ALL" ? "All" : st === "PENDING_REVIEW" ? "In Review" : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center rounded-xl bg-surface-alt p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSortBy("likes")}
                className={cn(
                  "rounded-lg px-3 py-1 transition-all",
                  sortBy === "likes"
                    ? "bg-surface text-primary font-bold shadow-xs border border-border/80"
                    : "text-subtle hover:text-heading"
                )}
              >
                Likes
              </button>
              <button
                type="button"
                onClick={() => setSortBy("views")}
                className={cn(
                  "rounded-lg px-3 py-1 transition-all",
                  sortBy === "views"
                    ? "bg-surface text-primary font-bold shadow-xs border border-border/80"
                    : "text-subtle hover:text-heading"
                )}
              >
                Views
              </button>
              <button
                type="button"
                onClick={() => setSortBy("bookmarks")}
                className={cn(
                  "rounded-lg px-3 py-1 transition-all",
                  sortBy === "bookmarks"
                    ? "bg-surface text-primary font-bold shadow-xs border border-border/80"
                    : "text-subtle hover:text-heading"
                )}
              >
                Saves
              </button>
            </div>
          </div>
        </div>

        {/* Stories Analytics Grid / Cards */}
        {filteredStories.length === 0 ? (
          <div className="py-16 text-center text-subtle font-medium border border-dashed border-border rounded-2xl mt-6">
            No stories match your current search and filter criteria.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story: any) => {
              const viewsCount = story.views_count ?? story.views ?? 0;
              const likesCount = story.likes_count ?? story.likes ?? 0;
              const bookmarksCount = story.bookmarks_count ?? story.bookmarks ?? 0;
              const sharesCount = story.shares_count ?? story.shares ?? 0;
              const unauthLikes = story.unauthenticated_like_attempts ?? 0;
              const readingTime = story.estimated_reading_time || story.reading_time || 5;
              const authorName = story.writer?.name || story.writer?.pen_name || story.writer?.user?.full_name || "Author";

              return (
                <div
                  key={story.id || story.slug}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    {/* Header: Status, Category, Reading Time */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone={story.status === "PUBLISHED" ? "success" : story.status === "PENDING_REVIEW" ? "warning" : story.status === "REJECTED" ? "error" : "info"}>
                        {story.status === "PENDING_REVIEW" ? "In Review" : story.status}
                      </Badge>
                      <span className="font-sans text-[0.75rem] font-bold text-subtle truncate">
                        {story.category?.name || "General"}
                      </span>
                    </div>

                    {/* Story Title & Author */}
                    <h3 className="mt-3 font-display text-[1.0625rem] font-bold text-heading line-clamp-2 leading-snug">
                      {story.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-subtle">
                      <User className="size-3 text-primary" />
                      <span className="font-medium text-body truncate">{authorName}</span>
                    </p>

                    {/* Analytics Strip */}
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-surface-alt/60 p-3 text-center">
                      <div>
                        <span className="text-[0.6875rem] font-semibold text-subtle block">Reads</span>
                        <p className="mt-0.5 font-bold text-heading text-sm flex items-center justify-center gap-1">
                          <Eye className="size-3.5 text-blue-500" />
                          {Number(viewsCount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-[0.6875rem] font-semibold text-subtle block">Likes</span>
                        <p className="mt-0.5 font-bold text-rose-500 text-sm flex items-center justify-center gap-1">
                          <Heart className="size-3.5 fill-rose-500/20" />
                          {Number(likesCount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-[0.6875rem] font-semibold text-subtle block">Saves</span>
                        <p className="mt-0.5 font-bold text-amber-500 text-sm flex items-center justify-center gap-1">
                          <Bookmark className="size-3.5 fill-amber-500/20" />
                          {Number(bookmarksCount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="mt-2.5 flex items-center justify-between text-[0.75rem] text-subtle px-1">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="size-3 text-subtle" />
                        {readingTime} min ({story.word_count || 0} w)
                      </span>
                      {sharesCount > 0 && (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                          <Share2 className="size-3" />
                          {sharesCount} shares
                        </span>
                      )}
                      {unauthLikes > 0 && (
                        <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400" title="Reader Intent / Unauthenticated Like Attempts">
                          <Sparkles className="size-3" />
                          {unauthLikes} intents
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[0.75rem] text-subtle">
                    <span>
                      {story.created_at ? new Date(story.created_at).toLocaleDateString() : "Recently"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStory(story)}
                        className="font-bold text-heading hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        <BookOpen className="size-3" /> Quick Read
                      </button>
                      <Link
                        to="/stories/$slug"
                        params={{ slug: story.slug || story.id }}
                        className="font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        Public View →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Story Reader Preview Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-alt/40">
              <div className="flex items-center gap-2">
                <Badge tone={selectedStory.status === "PUBLISHED" ? "success" : selectedStory.status === "PENDING_REVIEW" ? "warning" : selectedStory.status === "REJECTED" ? "error" : "info"}>
                  {selectedStory.status}
                </Badge>
                <span className="text-xs font-bold text-subtle">
                  {selectedStory.category?.name || "General"} · {selectedStory.estimated_reading_time || selectedStory.reading_time || 5} min read
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface hover:text-heading transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-heading leading-tight">
                  {selectedStory.title}
                </h2>
                {selectedStory.subtitle && (
                  <p className="mt-2 font-display italic text-base text-subtle">
                    {selectedStory.subtitle}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-subtle">
                  <span>Author: <strong className="text-heading font-medium">{selectedStory.writer?.name || selectedStory.writer?.pen_name || selectedStory.writer?.user?.full_name || "Author"}</strong></span>
                  <span>·</span>
                  <span>Published: {selectedStory.published_at || selectedStory.created_at ? new Date(selectedStory.published_at || selectedStory.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-border bg-surface-alt/50 p-4 text-center">
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Views</span>
                  <p className="mt-1 text-lg font-bold text-heading flex items-center justify-center gap-1">
                    <Eye className="size-4 text-blue-500" />
                    {Number(selectedStory.views_count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Likes</span>
                  <p className="mt-1 text-lg font-bold text-rose-500 flex items-center justify-center gap-1">
                    <Heart className="size-4 fill-rose-500/20" />
                    {Number(selectedStory.likes_count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Saves</span>
                  <p className="mt-1 text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
                    <Bookmark className="size-4 fill-amber-500/20" />
                    {Number(selectedStory.bookmarks_count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Shares</span>
                  <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <Share2 className="size-4" />
                    {Number(selectedStory.shares_count || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Story Content with multi-paragraph layout */}
              <div className="border-t border-border pt-5">
                <h4 className="text-xs font-black tracking-wider uppercase text-subtle mb-4">
                  Story Content
                </h4>
                <div className="prose prose-stone dark:prose-invert max-w-none font-serif text-[1.0625rem] leading-relaxed text-body space-y-4 min-w-0 break-words [overflow-wrap:anywhere]">
                  {(selectedStory.content || selectedStory.plain_text_content) ? (
                    (selectedStory.content || selectedStory.plain_text_content)
                      .split(/\n{2,}|\r\n\r\n/)
                      .map((p: string) => p.trim())
                      .filter(Boolean)
                      .map((p: string, idx: number) => (
                        <p key={idx} className="whitespace-pre-line leading-relaxed font-serif break-words [overflow-wrap:anywhere]">
                          {p}
                        </p>
                      ))
                  ) : (
                    <p className="text-subtle italic">No content body available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-surface-alt/40">
              <span className="text-xs text-subtle font-mono truncate max-w-[200px]">
                slug: {selectedStory.slug}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghostOutline" size="sm" onClick={() => setSelectedStory(null)}>
                  Close
                </Button>
                <Link
                  to="/stories/$slug"
                  params={{ slug: selectedStory.slug || selectedStory.id }}
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink className="size-3.5" /> Public Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
