import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Eye, Heart, PenLine, Plus, Sparkles, UserCheck, Clock, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Badge, Button, ButtonLink, Panel, Skeleton, CategoryPill } from "@/components/tossa/kit";
import { useAuth } from "@/components/auth/AuthContext";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/writer/")({
  head: () =>
    pageHead("Creator studio · tossatale", "Your drafts, series and readership in one calm writing studio."),
  component: WriterStudio,
});

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function WriterStudio() {
  const { user } = useAuth();
  const authorName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") || user?.email?.split("@")[0] || "Writer";

  // 1. Fetch Writer Analytics Overview
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["writer-dashboard-analytics"],
    queryFn: async () => {
      try {
        const res = await api.get("/writer/analytics/overview/");
        return res.data?.data || res.data || {};
      } catch {
        return {};
      }
    },
  });

  // 2. Fetch Writer Stories / Drafts
  const { data: storiesData, isLoading: isStoriesLoading } = useQuery({
    queryKey: ["writer-dashboard-stories"],
    queryFn: async () => {
      try {
        const res = await api.get("/writer/stories/");
        return res.data?.results || res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
  });

  // 3. Fetch Writer Profile
  const { data: profileData } = useQuery({
    queryKey: ["writer-dashboard-profile"],
    queryFn: async () => {
      try {
        const res = await api.get("/writer/profile/");
        return res.data?.data || res.data || {};
      } catch {
        return {};
      }
    },
  });

  const summary = analyticsData?.summary || {
    total_views: 0,
    total_likes: 0,
    total_stories: 0,
    published_stories: 0,
    draft_stories: 0,
    in_review_stories: 0,
  };

  const storiesList = Array.isArray(storiesData) ? storiesData : [];
  const drafts = storiesList.slice(0, 5).map((s: any) => ({
    id: s.id,
    slug: s.slug || s.id,
    title: s.title || "Untitled draft",
    subtitle: s.subtitle || "",
    status: s.status,
    category: s.category?.name || "General",
    readingTime: s.estimated_reading_time || 5,
    wordCount: s.word_count || (s.content ? s.content.trim().split(/\s+/).length : 0),
    views: s.views_count || 0,
    likes: s.likes_count || 0,
    date: s.updated_at
      ? new Date(s.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Recent",
  }));

  const topPublishedStories = storiesList
    .filter((s: any) => s.status === "PUBLISHED")
    .sort((a: any, b: any) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 3);

  const greeting = getGreeting(authorName);
  const activeDraftsCount = summary.draft_stories ?? storiesList.filter((s: any) => s.status === "DRAFT").length;
  const publishedCount = summary.published_stories ?? storiesList.filter((s: any) => s.status === "PUBLISHED").length;

  return (
    <AppShell
      role="writer"
      title={greeting}
      blurb={`${activeDraftsCount} active drafts in progress. ${publishedCount} published stories live.`}
      actions={
        <>
          <ButtonLink to="/writer/editor" variant="primary">
            <PenLine className="size-4" /> New story
          </ButtonLink>
          <ButtonLink to="/writer/analytics" variant="soft">
            View analytics
          </ButtonLink>
        </>
      }
    >
      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Reads"
          value={isAnalyticsLoading ? "..." : summary.total_views >= 1000 ? `${(summary.total_views / 1000).toFixed(1)}k` : String(summary.total_views)}
          hint="across all published stories"
        />
        <StatCard
          label="Total Likes"
          value={isAnalyticsLoading ? "..." : String(summary.total_likes)}
          hint="reader appreciations"
        />
        <StatCard
          label="Published Stories"
          value={isAnalyticsLoading ? "..." : String(publishedCount)}
          hint={summary.in_review_stories > 0 ? `${summary.in_review_stories} in review` : "live in library"}
        />
        <StatCard
          label="Drafts in Progress"
          value={isAnalyticsLoading ? "..." : String(activeDraftsCount)}
          hint="in creator studio"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* Main Left: Continue Writing / Recent Stories */}
        <Panel className="p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-heading">Continue writing</h2>
              <p className="text-xs text-subtle mt-0.5">Jump back into your recent drafts and revisions.</p>
            </div>
            <Link
              to="/writer/stories"
              className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary hover:underline"
            >
              All stories ({storiesList.length}) <ArrowUpRight className="size-4" />
            </Link>
          </div>

          {isStoriesLoading ? (
            <div className="mt-5 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-border p-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-light text-primary">
                <PenLine className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-display font-bold text-heading">No stories written yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-subtle">
                Bring your ideas to life. Start writing a longform story or serialized chapter today.
              </p>
              <div className="mt-5">
                <ButtonLink to="/writer/editor" variant="primary" size="sm">
                  <Plus className="size-4" /> Create First Draft
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {drafts.map((s) => {
                const statusTone =
                  s.status === "DRAFT"
                    ? "warning"
                    : s.status === "SUBMITTED"
                    ? "info"
                    : s.status === "REJECTED"
                    ? "error"
                    : "neutral";
                const statusLabel =
                  s.status === "DRAFT"
                    ? "Draft"
                    : s.status === "SUBMITTED"
                    ? "In review"
                    : s.status === "REJECTED"
                    ? "Needs revision"
                    : "Published";

                return (
                  <li key={s.id || s.slug}>
                    <Link
                      to="/writer/editor/$storyId"
                      params={{ storyId: s.id || s.slug }}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-surface-alt/40 p-4 transition-all hover:border-primary/40 hover:bg-primary-light/40 group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-[0.9375rem] font-bold text-heading group-hover:text-primary transition-colors">
                          {s.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.8125rem] text-subtle">
                          <span className="font-medium text-body">{s.category}</span>
                          <span>·</span>
                          <span>Updated {s.date}</span>
                          <span>·</span>
                          <span>{s.readingTime} min read</span>
                          {s.wordCount > 0 && (
                            <>
                              <span>·</span>
                              <span>{s.wordCount} words</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge tone={statusTone}>{statusLabel}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Right Sidebar: Profile & Top Stories */}
        <div className="space-y-6">
          {/* Writer Profile Quick Card */}
          <Panel className="p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="font-sans text-[0.6875rem] font-black tracking-[0.16em] text-primary uppercase">
                Creator Profile
              </span>
              {profileData?.is_verified ? (
                <span className="inline-flex items-center gap-1 text-[0.75rem] font-bold text-primary">
                  <UserCheck className="size-3.5" /> Verified Author
                </span>
              ) : (
                <Badge tone="warning">Pending Verification</Badge>
              )}
            </div>

            <h3 className="mt-3 text-lg font-display font-bold text-heading">{authorName}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-subtle">
              {profileData?.bio || "Author and contributing storyteller at tossatale."}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-divider pt-3 text-xs">
              <span className="text-subtle">{summary.total_stories} total pieces</span>
              <ButtonLink to="/writer/profile" variant="quiet" size="sm" className="px-0 font-bold text-primary">
                Edit profile →
              </ButtonLink>
            </div>
          </Panel>

          {/* Top Published Stories */}
          <Panel className="p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-base font-bold text-heading">Top Performing</h3>
              <span className="text-[0.6875rem] font-bold text-subtle uppercase">By Reads</span>
            </div>

            {topPublishedStories.length === 0 ? (
              <p className="mt-4 text-xs text-subtle">
                Once your submitted stories are approved and published, readership metrics will appear here.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {topPublishedStories.map((story: any) => (
                  <li key={story.slug} className="flex items-center justify-between gap-3 text-sm">
                    <Link
                      to="/stories/$slug"
                      params={{ slug: story.slug }}
                      className="truncate font-sans font-bold text-heading hover:text-primary transition-colors flex-1"
                    >
                      {story.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-subtle shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3 text-subtle" /> {story.views_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="size-3 text-destructive" /> {story.likes_count || 0}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Creator Hub Links */}
          <Panel className="p-5 bg-surface-alt/40 border border-dashed border-border">
            <div className="flex items-center gap-2 text-xs font-bold text-heading">
              <Sparkles className="size-4 text-primary" /> Studio Quick Links
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ButtonLink to="/writer/stories" variant="ghostOutline" size="sm" className="justify-center text-xs">
                My Stories
              </ButtonLink>
              <ButtonLink to="/writer/series" variant="ghostOutline" size="sm" className="justify-center text-xs">
                Story Series
              </ButtonLink>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
