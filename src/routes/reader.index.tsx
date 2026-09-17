import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/components/tossa/AppShell";
import { ButtonLink, Panel } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { StoryCard } from "@/components/tossa/StoryCard";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { useAuth } from "@/components/auth/AuthContext";
import { api } from "@/lib/api";
import coverLane from "@/assets/cover-lane.jpg";

export const Route = createFileRoute("/reader/")({
  head: () => pageHead("Your reading dashboard · tossatale", "Pick up where you left off, and see what your writers published."),
  component: ReaderDashboard,
});

function ReaderDashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["reader-dashboard"],
    queryFn: async () => {
      const res = await api.get("/user/dashboard/");
      return res.data?.data || res.data || {};
    },
  });

  const { data: publicStories } = useQuery({
    queryKey: ["public-stories-reader"],
    queryFn: async () => {
      const res = await api.get("/public/stories/");
      return res.data?.results || res.data || [];
    },
  });

  const stats = dashboardData?.stats || dashboardData?.reading_statistics || {
    total_liked_stories: 0,
    total_bookmarked_stories: 0,
    recently_read_count: 0,
    total_stories_read: 0,
    hours_read: 0,
  };

  const storiesReadCount = stats.recently_read_count ?? stats.total_stories_read ?? (dashboardData?.recently_read?.length || 0);
  const hoursReadCount = stats.hours_read ?? 0;
  const bookmarksCount = stats.total_bookmarked_stories ?? (dashboardData?.bookmarks?.length || 0);
  const likedStoriesCount = stats.total_liked_stories ?? (dashboardData?.liked_stories?.length || 0);

  const storiesList = (publicStories && Array.isArray(publicStories)) ? publicStories : [];
  const recentStoryRecord = dashboardData?.recently_read?.[0];
  const continueReadingStory = recentStoryRecord?.story || storiesList[0];
  const isActualHistory = Boolean(recentStoryRecord?.story);

  return (
    <ReaderLayout
      title={`Welcome back, ${user?.first_name || "Reader"}`}
      blurb="Pick up where you left off, save bookmarks, and follow your favorite storytellers."
      actions={
        <ButtonLink to="/stories" variant="primary">
          <BookOpen className="size-4" /> Browse library
        </ButtonLink>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stories read" value={String(storiesReadCount)} hint="this month" />
        <StatCard label="Hours read" value={String(hoursReadCount)} />
        <StatCard label="Bookmarks" value={String(bookmarksCount)} hint="saved stories" />
        <StatCard label="Liked Stories" value={String(likedStoriesCount)} hint="favorite stories" />
      </div>

      {continueReadingStory ? (
        <Panel className="overflow-hidden p-6 lg:p-8">
          <div>
            <div className="flex items-center justify-between">
              <p className="font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
                {isActualHistory ? "Continue reading" : "Featured Pick"}
              </p>
              {recentStoryRecord?.reading_progress ? (
                <span className="text-xs font-bold text-primary">
                  {Math.round(recentStoryRecord.reading_progress)}% completed
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 text-2xl font-display font-bold leading-snug">{continueReadingStory.title}</h2>
            <p className="mt-2 text-[1rem] text-body">{continueReadingStory.subtitle || continueReadingStory.seo_description || "Featured story."}</p>
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-[0.8125rem] text-subtle">
                <span>{continueReadingStory.writer?.name || continueReadingStory.writer?.user?.full_name || "Author"}</span>
                <span>{continueReadingStory.estimated_reading_time || 5} min read</span>
              </div>
            </div>
            <ButtonLink
              to="/stories/$slug"
              params={{ slug: continueReadingStory.slug }}
              variant="soft"
              className="mt-6"
            >
              {isActualHistory && recentStoryRecord?.reading_progress ? "Resume story" : "Start reading"}
            </ButtonLink>
          </div>
        </Panel>
      ) : (
        <EmptySectionFallback
          icon="book"
          title="No Recent Reading Activity"
          description="Browse the library to discover longform stories and start your reading list."
          actionText="Explore Library"
          onAction={() => window.location.href = "/stories"}
        />
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-heading">Recommended for you</h2>
          <Link to="/stories" className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary">
            See all <ArrowUpRight className="size-4" />
          </Link>
        </div>
        {storiesList.length === 0 ? (
          <EmptySectionFallback
            icon="sparkles"
            title="No Recommendations Available"
            description="Recommended stories will appear here as authors publish new work."
          />
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {storiesList.slice(0, 3).map((s: any) => (
              <StoryCard key={s.slug} story={{
                slug: s.slug,
                title: s.title,
                dek: s.subtitle || s.seo_description || "A longform story.",
                writer: s.writer?.slug || "writer",
                writerName: s.writer?.name || s.writer?.user?.full_name || "Author",
                category: s.category?.name || "General",
                date: s.published_at ? new Date(s.published_at).toLocaleDateString() : "Recent",
                readingTime: s.estimated_reading_time || 5,
                cover: s.cover_image || coverLane,
                views: s.views_count || 0,
                likes: s.likes_count || 0,
              } as any} />
            ))}
          </div>
        )}
      </section>
    </ReaderLayout>
  );
}
