import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  ExternalLink,
  Flame,
  Globe,
  Heart,
  Mail,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Tag as TagIcon,
  TrendingUp,
  UserCheck,
  UserX,
  X,
  Bookmark,
  FileText,
  MessageSquareQuote,
  Layers,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { AppShell } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/writers/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/admin/writers/${params.slug}/`);
      const writer = res.data?.data || res.data;
      if (writer) {
        return { writer };
      }
    } catch {
      // Fallback
    }
    return { writer: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.writer) {
      return pageHead("Writer not found · tossatale admin", "The requested writer profile does not exist.");
    }
    const name = loaderData.writer.name || loaderData.writer.user?.full_name || "Writer";
    return pageHead(
      `${name} — Writer Analytics & Profile · tossatale admin`,
      `Managing writer profile for ${name}. View aggregated reach, story metrics and live analytics.`,
    );
  },
  notFoundComponent: WriterNotFound,
  component: AdminWriterDetail,
});

function WriterNotFound() {
  return (
    <AppShell role="admin" title="Writer Not Found">
      <Panel className="p-12 text-center">
        <h2 className="text-2xl font-display text-heading">Writer profile not found</h2>
        <p className="mt-2 text-subtle">
          The requested writer does not exist or may have been removed.
        </p>
        <div className="mt-6">
          <ButtonLink to="/admin/writers">
            <ArrowLeft className="size-4" /> Back to writers directory
          </ButtonLink>
        </div>
      </Panel>
    </AppShell>
  );
}

function AdminWriterDetail() {
  const loaderData = Route.useLoaderData();
  const queryClient = useQueryClient();
  const writer = loaderData?.writer;

  // Selected story for modal preview
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  // Fetch all stories by this writer
  const { data: writerStories, isLoading } = useQuery({
    queryKey: ["admin-writer-stories", writer?.slug],
    queryFn: async () => {
      if (!writer?.slug) return [];
      const res = await api.get(`/admin/stories/?writer=${writer.slug}`);
      const data = res.data?.data || res.data;
      return data?.results || (Array.isArray(data) ? data : []);
    },
    enabled: Boolean(writer?.slug),
  });

  const storiesList: any[] = useMemo(() => {
    return Array.isArray(writerStories) ? writerStories : [];
  }, [writerStories]);

  // Aggregate Analytics from stories
  const analytics = useMemo(() => {
    let totalViews = Number(writer?.total_reads || 0);
    let totalLikes = Number(writer?.total_likes || 0);
    let totalShares = Number(writer?.total_shares || 0);
    let totalBookmarks = 0;
    let publishedCount = 0;
    let maxViews = 0;
    let maxLikes = 0;

    storiesList.forEach((s) => {
      const views = Number(s.views_count || 0);
      const likes = Number(s.likes_count || 0);
      const shares = Number(s.shares_count || 0);
      const bookmarks = Number(s.bookmarks_count || 0);

      totalViews += views;
      totalLikes += likes;
      totalShares += shares;
      totalBookmarks += bookmarks;

      if (s.status === "PUBLISHED") publishedCount++;
      if (views > maxViews) maxViews = views;
      if (likes > maxLikes) maxLikes = likes;
    });

    const engagementRate = totalViews > 0 ? (((totalLikes + totalShares + totalBookmarks) / totalViews) * 100).toFixed(1) : "0.0";
    const avgViewsPerStory = storiesList.length > 0 ? Math.round(totalViews / storiesList.length) : 0;

    return {
      totalStories: Math.max(storiesList.length, Number(writer?.total_stories || 0)),
      publishedStories: publishedCount,
      totalViews,
      totalLikes,
      totalShares,
      totalBookmarks,
      engagementRate,
      avgViewsPerStory,
      maxViews,
      maxLikes,
    };
  }, [storiesList, writer]);

  // Mutations for Verify / Unverify
  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (writer.is_verified) {
        return api.post(`/admin/writers/${writer.slug}/unverify/`);
      } else {
        return api.post(`/admin/writers/${writer.slug}/verify/`);
      }
    },
    onSuccess: () => {
      toast.success(writer.is_verified ? "Verification revoked" : "Writer verified successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-writers"] });
      window.location.reload();
    },
    onError: (err: any) => {
      toast.error("Action failed", { description: err.message });
    },
  });

  // Mutations for Activate / Deactivate
  const activateMutation = useMutation({
    mutationFn: async () => {
      if (writer.is_active) {
        return api.post(`/admin/writers/${writer.slug}/deactivate/`);
      } else {
        return api.post(`/admin/writers/${writer.slug}/activate/`);
      }
    },
    onSuccess: () => {
      toast.success(writer.is_active ? "Writer deactivated" : "Writer activated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-writers"] });
      window.location.reload();
    },
    onError: (err: any) => {
      toast.error("Action failed", { description: err.message });
    },
  });

  if (!writer) {
    return <WriterNotFound />;
  }

  const name = writer.name || writer.user?.full_name || "Writer";
  const initials = name.substring(0, 2).toUpperCase();
  const email = writer.email || writer.user?.email || "No email";
  const joinedDate = writer.created_at
    ? new Date(writer.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";

  return (
    <AppShell
      role="admin"
      title={name}
      blurb={`Writer profile & performance analytics · @${writer.slug}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink to="/admin/writers" variant="ghostOutline" size="sm">
            <ArrowLeft className="size-4" /> Directory
          </ButtonLink>
          <a
            href={`/writers/${writer.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-heading hover:border-primary hover:text-primary transition-colors"
          >
            <ExternalLink className="size-3.5" /> Live Profile
          </a>
        </div>
      }
    >
      {/* ─── 1. TOP ANALYTICS & REACH METRICS ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Views / Reads */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-paper transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-subtle uppercase">
              Total Reach & Reads
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Eye className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-[2.2rem] font-bold leading-none text-heading">
            {analytics.totalViews.toLocaleString()}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-subtle">
            <span className="font-bold text-primary">~{analytics.avgViewsPerStory.toLocaleString()}</span> avg reads / story
          </div>
        </div>

        {/* Total Likes */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-paper transition-all hover:border-destructive/40">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-subtle uppercase">
              Supporters & Likes
            </span>
            <div className="grid size-8 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <Heart className="size-4 fill-destructive" />
            </div>
          </div>
          <p className="mt-2 font-display text-[2.2rem] font-bold leading-none text-heading">
            {analytics.totalLikes.toLocaleString()}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-subtle">
            <span className="font-bold text-destructive">{analytics.engagementRate}%</span> reader engagement rate
          </div>
        </div>

        {/* Total Shares & Bookmarks */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-paper transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-subtle uppercase">
              Shares & Saves
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Share2 className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-[2.2rem] font-bold leading-none text-heading">
            {(analytics.totalShares + analytics.totalBookmarks).toLocaleString()}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-subtle">
            <span>{analytics.totalShares} shares · {analytics.totalBookmarks} bookmarks</span>
          </div>
        </div>

        {/* Published Stories Count */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-paper transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-subtle uppercase">
              Portfolio
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-[2.2rem] font-bold leading-none text-heading">
            {analytics.totalStories}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-subtle">
            <span className="font-bold text-success">{analytics.publishedStories} Published</span> · {analytics.totalStories - analytics.publishedStories} In Progress
          </div>
        </div>
      </div>

      {/* ─── 2. WRITER PROFILE & CONTROLS CARD ─── */}
      <Panel className="p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar initials={initials} gender={writer.gender} src={writer.profile_photo} size="xl" className="shrink-0 size-20 text-2xl shadow-paper" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-heading">
                  {name}
                </h2>
                {writer.is_verified && <VerifiedBadge />}
                <Badge tone={writer.is_active ? "success" : "error"} className="ml-1">
                  {writer.is_active ? "Active Account" : "Deactivated"}
                </Badge>
              </div>

              <p className="mt-1 font-mono text-xs text-subtle">
                @{writer.slug} · <span className="font-sans text-body">{email}</span>
              </p>

              <p className="mt-3.5 max-w-2xl text-[0.9375rem] text-body leading-relaxed">
                {writer.bio || "No biography provided yet. Registered storyteller on Tossatale."}
              </p>

              {/* Social links / Website */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-subtle">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" /> Joined {joinedDate}
                </span>
                {writer.website_url && (
                  <a
                    href={writer.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="size-3.5" /> Website
                  </a>
                )}
                {writer.x_url && (
                  <a
                    href={writer.x_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    X (Twitter)
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0 border-t border-border pt-4 md:border-t-0 md:pt-0">
            <Button
              variant={writer.is_verified ? "ghostOutline" : "primary"}
              size="sm"
              disabled={verifyMutation.isPending}
              onClick={() => verifyMutation.mutate()}
              className="gap-1.5"
            >
              {writer.is_verified ? (
                <>
                  <ShieldAlert className="size-3.5 text-warning" />
                  <span>Revoke Badge</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" />
                  <span>Verify Author</span>
                </>
              )}
            </Button>

            <Button
              variant={writer.is_active ? "ghostOutline" : "primary"}
              size="sm"
              disabled={activateMutation.isPending}
              onClick={() => activateMutation.mutate()}
              className={cn("gap-1.5", writer.is_active && "text-destructive hover:bg-destructive/10")}
            >
              {writer.is_active ? (
                <>
                  <UserX className="size-3.5" />
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <UserCheck className="size-3.5" />
                  <span>Activate</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Panel>

      {/* ─── 3. STORIES LIST WITH REACH METRICS & SMART BADGES ─── */}
      <Panel className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-heading">
              Stories & Essays by {name}
            </h2>
            <p className="mt-0.5 text-xs text-subtle">
              Click any story card to preview full text, review editorial status, and inspect reach analytics.
            </p>
          </div>
          <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-bold text-body border border-border">
            {storiesList.length} total stories
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-subtle font-medium">
            <div className="mx-auto mb-3 size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading writer stories and analytics...
          </div>
        ) : storiesList.length === 0 ? (
          <EmptySectionFallback
            icon="write"
            title="No Stories Found"
            description="This writer has not published or drafted any stories in the system yet."
          />
        ) : (
          <div className="mt-5 grid gap-3.5">
            {storiesList.map((s: any) => {
              const views = Number(s.views_count || 0);
              const likes = Number(s.likes_count || 0);
              const shares = Number(s.shares_count || 0);
              const bookmarks = Number(s.bookmarks_count || 0);
              const isTopPerformer = views > 0 && views === analytics.maxViews;
              const isMostLoved = likes > 0 && likes === analytics.maxLikes;

              return (
                <div
                  key={s.id || s.slug}
                  onClick={() => setSelectedStory(s)}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 transition-all hover:border-primary/60 hover:shadow-paper cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge tone={s.status === "PUBLISHED" ? "success" : s.status === "REJECTED" ? "error" : "warning"}>
                        {s.status}
                      </Badge>

                      {s.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[0.6875rem] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Star className="size-3 fill-amber-500" /> Featured
                        </span>
                      )}

                      {isTopPerformer && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[0.6875rem] font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20 animate-pulse">
                          <Flame className="size-3 text-orange-500" /> Top Performer
                        </span>
                      )}

                      {isMostLoved && !isTopPerformer && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[0.6875rem] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <Heart className="size-3 fill-rose-500" /> Most Loved
                        </span>
                      )}

                      <span className="text-[0.75rem] text-subtle">
                        {s.category?.name || "General"} · {s.estimated_reading_time || 5} min read
                      </span>
                    </div>

                    {/* Story Title & Subtitle */}
                    <h3 className="font-display text-lg font-bold text-heading group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                    {s.subtitle && (
                      <p className="mt-1 text-xs text-subtle line-clamp-1">
                        {s.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Reach / Analytics Pill Bar */}
                  <div className="flex items-center gap-3 shrink-0 border-t border-border pt-3 md:border-t-0 md:pt-0">
                    <div className="flex items-center gap-4 bg-surface-alt px-4 py-2 rounded-xl border border-border text-xs">
                      {/* Views */}
                      <div className="flex items-center gap-1.5 text-heading font-semibold" title="Total Reads / Views">
                        <Eye className="size-3.5 text-blue-500" />
                        <span>{views.toLocaleString()}</span>
                      </div>

                      {/* Likes */}
                      <div className="flex items-center gap-1.5 text-heading font-semibold" title="Registered Likes">
                        <Heart className="size-3.5 text-destructive fill-destructive" />
                        <span>{likes.toLocaleString()}</span>
                      </div>

                      {/* Shares */}
                      <div className="flex items-center gap-1.5 text-subtle" title="Total Shares">
                        <Share2 className="size-3.5 text-emerald-500" />
                        <span>{shares}</span>
                      </div>

                      {/* Bookmarks */}
                      <div className="flex items-center gap-1.5 text-subtle" title="Reading Bookmarks">
                        <Bookmark className="size-3.5 text-amber-500" />
                        <span>{bookmarks}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghostOutline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStory(s);
                      }}
                      className="text-xs"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* ─── 4. INTERACTIVE STORY PREVIEW MODAL ─── */}
      {selectedStory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="relative flex flex-col max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-alt/60">
              <div className="flex items-center gap-2">
                <Badge tone={selectedStory.status === "PUBLISHED" ? "success" : "warning"}>
                  {selectedStory.status}
                </Badge>
                {selectedStory.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Star className="size-3 fill-amber-500" /> Featured
                  </span>
                )}
                <span className="text-xs text-subtle">
                  {selectedStory.category?.name || "General"} · {selectedStory.estimated_reading_time || 5} min read
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

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Title & Subtitle */}
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
                  <span>Author: <strong className="text-heading font-medium">{name}</strong></span>
                  <span>·</span>
                  <span>Published: {selectedStory.published_at ? new Date(selectedStory.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Draft"}</span>
                </div>
              </div>

              {/* Reach & Performance Stats in Modal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-border bg-surface-alt/50 p-4 text-center">
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Views</span>
                  <p className="mt-1 text-lg font-bold text-heading">
                    {Number(selectedStory.views_count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Likes</span>
                  <p className="mt-1 text-lg font-bold text-destructive">
                    {Number(selectedStory.likes_count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Shares</span>
                  <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {Number(selectedStory.shares_count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-subtle block font-bold">Bookmarks</span>
                  <p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
                    {Number(selectedStory.bookmarks_count || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Rejection / Review feedback note if any */}
              {selectedStory.rejection_feedback && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-destructive mb-1">
                    <MessageSquareQuote className="size-4" />
                    <span>Editorial Review Feedback:</span>
                  </div>
                  <p className="text-xs text-body leading-relaxed">{selectedStory.rejection_feedback}</p>
                </div>
              )}

              {/* Story Excerpt / Content Body */}
              <div className="border-t border-border pt-5">
                <h4 className="text-xs font-black tracking-wider uppercase text-subtle mb-3">
                  Story Content
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none font-serif text-[1rem] leading-relaxed text-body whitespace-pre-wrap">
                  {selectedStory.plain_text_content || selectedStory.content || "No content body available for this draft."}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-surface-alt/40">
              <span className="text-xs text-subtle font-mono">
                slug: {selectedStory.slug}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghostOutline" size="sm" onClick={() => setSelectedStory(null)}>
                  Close
                </Button>
                {selectedStory.status === "PUBLISHED" && (
                  <a
                    href={`/stories/${selectedStory.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="size-3.5" /> Read Live Story
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
