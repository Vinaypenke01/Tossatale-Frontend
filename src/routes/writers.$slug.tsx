import { createFileRoute, notFound } from "@tanstack/react-router";
import { Award, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { Avatar, Button, ButtonLink, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import coverLane from "@/assets/cover-lane.jpg";

export const Route = createFileRoute("/writers/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/public/writers/${params.slug}/`);
      if (res.data) {
        return { writer: res.data };
      }
    } catch {
      // Fallback if detail view throws
    }
    return { writer: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.writer) {
      return { meta: [{ title: "Writer not found — tossatale" }, { name: "robots", content: "noindex" }] };
    }
    const { writer } = loaderData;
    const name = writer.name || writer.user?.full_name || "Writer";
    const bio = writer.bio || "Storyteller profile on tossatale";
    return {
      meta: [
        { title: `${name} — tossatale` },
        { name: "description", content: bio },
        { property: "og:title", content: `${name} on tossatale` },
        { property: "og:description", content: bio },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-5 py-32 text-center">
        <h1 className="text-4xl font-display font-bold text-heading">No such writer</h1>
        <p className="mt-4 text-body">This profile is not available or has been removed.</p>
        <div className="mt-8">
          <ButtonLink to="/writers">All writers</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  ),
  component: WriterProfile,
});

function WriterProfile() {
  const loaderData = Route.useLoaderData();
  const writer = loaderData?.writer;

  const { data: publicStories } = useQuery({
    queryKey: ["public-writer-stories", writer?.slug],
    queryFn: async () => {
      if (!writer?.slug) return [];
      const res = await api.get(`/public/stories/?writer=${writer.slug}`);
      return res.data?.results || res.data || [];
    },
    enabled: Boolean(writer?.slug),
  });

  if (!writer) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-5 py-32 text-center">
          <h1 className="text-4xl font-display font-bold text-heading">No such writer</h1>
          <p className="mt-4 text-body">This profile is not available or has been removed.</p>
          <div className="mt-8">
            <ButtonLink to="/writers">All writers</ButtonLink>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const name = writer.name || writer.user?.full_name || "Writer";
  const initials = name.substring(0, 2).toUpperCase();
  const publishedStories = (publicStories && Array.isArray(publicStories)) ? publicStories : [];

  return (
    <SiteLayout>
      <header className="relative overflow-hidden border-b border-border ink-gradient grain">
        <span className="pointer-events-none absolute -top-20 left-1/4 size-72 animate-drift rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
          <div className="flex flex-wrap items-end gap-7">
            <Avatar initials={initials} size="xl" className="ring-4 ring-white/25" />
            <div className="mr-auto">
              <h1 className="flex flex-wrap items-center gap-3 text-[clamp(2rem,4vw,3rem)] font-display font-bold text-white">
                {name}
                {writer.is_verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-sans text-[0.75rem] font-bold text-white backdrop-blur">
                    <VerifiedBadge /> Verified writer
                  </span>
                )}
              </h1>
              <p className="mt-2 text-[1rem] text-white/75">
                @{writer.slug} · Storyteller
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.875rem] text-white/65">
                <MapPin className="size-3.5" /> India · tossatale author
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="inkOnDark">Follow</Button>
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85">
            {writer.bio || "Author publishing stories on tossatale."}
          </p>

          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/20 pt-7 sm:grid-cols-3">
            {[
              ["Stories", String(writer.total_stories || publishedStories.length)],
              ["Followers", String(writer.total_followers || 0)],
              ["Total reads", String(writer.total_reads || 0)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-display text-[1.7rem] leading-none text-white">{value}</dt>
                <dd className="mt-1.5 text-[0.6875rem] tracking-[0.16em] text-white/65 uppercase">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[1fr_320px] lg:px-8">
        <div>
          <h2 className="text-[1.7rem] font-display font-bold text-heading">Published stories</h2>
          {publishedStories.length === 0 ? (
            <EmptySectionFallback
              icon="write"
              title="No Stories Published Yet"
              description="This writer has not published any public stories yet."
            />
          ) : (
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              {publishedStories.map((s: any, i: number) => (
                <Reveal key={s.slug} delay={i * 60}>
                  <StoryCard story={{
                    slug: s.slug,
                    title: s.title,
                    dek: s.subtitle || s.seo_description || "A longform story.",
                    writer: s.writer?.slug || writer.slug,
                    writerName: name,
                    category: s.category?.name || "General",
                    date: s.published_at ? new Date(s.published_at).toLocaleDateString() : "Recent",
                    readingTime: s.estimated_reading_time || 5,
                    cover: s.cover_image || coverLane,
                    views: s.views_count || 0,
                    likes: s.likes_count || 0,
                  } as any} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Panel className="paper-gradient p-6">
            <h3 className="text-[1.05rem] font-display font-bold text-heading">Support this writer</h3>
            <p className="mt-2 text-[0.9375rem] text-body">
              Members fund the writers they read most. Every membership supports community authors.
            </p>
            <div className="mt-5">
              <ButtonLink to="/auth" size="sm" className="w-full">
                Become a member
              </ButtonLink>
            </div>
          </Panel>
        </aside>
      </div>
    </SiteLayout>
  );
}
