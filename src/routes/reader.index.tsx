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
      return res.data || {};
    },
  });

  const { data: publicStories } = useQuery({
    queryKey: ["public-stories-reader"],
    queryFn: async () => {
      const res = await api.get("/public/stories/");
      return res.data?.results || res.data || [];
    },
  });

  const stats = dashboardData?.stats || {
    total_liked_stories: 0,
    total_bookmarked_stories: 0,
    recently_read_count: 0,
  };

  const storiesList = (publicStories && Array.isArray(publicStories)) ? publicStories : [];
  const currentStory = storiesList[0];

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
        <StatCard label="Stories read" value={String(stats.recently_read_count)} hint="this month" />
        <StatCard label="Hours read" value="0" />
        <StatCard label="Bookmarks" value={String(stats.total_bookmarked_stories)} hint="saved stories" />
        <StatCard label="Liked Stories" value={String(stats.total_liked_stories)} hint="favorite stories" />
      </div>

      {currentStory ? (
        <Panel className="overflow-hidden p-6 lg:p-8">
          <div>
            <p className="font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
              Continue reading
            </p>
            <h2 className="mt-3 text-2xl font-display font-bold leading-snug">{currentStory.title}</h2>
            <p className="mt-2 text-[1rem] text-body">{currentStory.subtitle || currentStory.seo_description || "Featured story."}</p>
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-[0.8125rem] text-subtle">
                <span>{currentStory.writer?.name || currentStory.writer?.user?.full_name || "Author"}</span>
                <span>{currentStory.estimated_reading_time || 5} min read</span>
              </div>
            </div>
            <ButtonLink
              to="/stories/$slug"
              params={{ slug: currentStory.slug }}
              variant="soft"
              className="mt-6"
            >
              Start reading
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
                cover: s.cover_image || "/assets/cover-lane.jpg",
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
