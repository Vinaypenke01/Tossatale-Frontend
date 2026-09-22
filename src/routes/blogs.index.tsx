import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";

import blogHeaderArt from "@/assets/Blog page header - September 18, 2026 at 23.21.40.png";
import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { BlogsGridSkeleton } from "@/components/tossa/Skeletons";
import { Pagination } from "@/components/tossa/Pagination";
import { Avatar, CategoryPill, Panel } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import { covers } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Our blogs — tossatale" },
      {
        name: "description",
        content:
          "A place for curious minds, thoughtful ideas, and things worth discovering.",
      },
      { property: "og:title", content: "Our blogs — tossatale" },
      { property: "og:description", content: "A place for curious minds, thoughtful ideas, and things worth discovering." },
    ],
  }),
  component: BlogsPage,
});

function BlogsPage() {
  const [page, setPage] = useState(1);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["public-blogs", page],
    queryFn: async () => {
      const res = await api.get(`/public/blogs/?page=${page}&page_size=9`);
      return res.data?.data || res.data || {};
    },
  });

  const rawBlogs = apiResponse?.results || (Array.isArray(apiResponse) ? apiResponse : []);
  const totalBlogsCount = apiResponse?.count || rawBlogs.length || 0;
  const totalPages = Math.ceil(totalBlogsCount / 9);

  const displayBlogs = (rawBlogs && Array.isArray(rawBlogs))
    ? rawBlogs.map((b: any) => ({
        slug: b.slug,
        title: b.title,
        dek: b.subtitle || b.excerpt || b.seo_description || "Editorial blog post",
        tag: b.category?.name || "Blog",
        authorName: b.author?.name || b.author?.user?.full_name || "Our Bloggers",
        authorPhoto: b.author?.profile_photo || b.author?.avatar || "",
        date: formatDate(b.published_at, "Recent"),
        readingTime: b.estimated_reading_time || b.reading_time || 4,
        cover: b.cover_image || covers.terrace,
      }))
    : [];

  return (
    <SiteLayout>
      <header className="relative overflow-hidden bg-heading border-b border-border text-white">
        {/* Background Cover Image with Rich Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={blogHeaderArt}
            alt=""
            className="h-full w-full object-cover opacity-45 dark:opacity-35 scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
          <div className="pointer-events-none absolute -top-24 left-1/4 size-[500px] rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-[#FF6B35] uppercase">
            INSIGHTS & STORIES
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] font-display font-bold leading-[1.05] text-white drop-shadow-xs">
            Our blogs
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-white/90">
            A place for curious minds, thoughtful ideas, and things worth discovering.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:py-16 lg:px-8">
        {isLoading ? (
          <BlogsGridSkeleton count={6} />
        ) : displayBlogs.length === 0 ? (
          <Panel className="p-12 text-center">
            <h3 className="font-display text-xl font-bold text-heading">No blogs published</h3>
            <p className="mt-2 text-[0.875rem] text-subtle">
              There are currently no blog articles published.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayBlogs.map((b: any, i: number) => (
              <Reveal key={b.slug} delay={i * 60} className="h-full">
                <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1">
                  <div>
                    <Link to="/blogs/$slug" params={{ slug: b.slug }} className="block overflow-hidden">
                      <img
                        src={b.cover}
                        alt={b.title}
                        loading="lazy"
                        width={1200}
                        height={800}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <div className="p-5 sm:p-6">
                      <CategoryPill>{b.tag}</CategoryPill>
                      <Link to="/blogs/$slug" params={{ slug: b.slug }} className="block group/title">
                        <h3 className="mt-3 text-[1.125rem] leading-snug font-display font-bold text-heading group-hover/title:text-primary transition-colors line-clamp-2">
                          {b.title}
                        </h3>
                      </Link>
                      <p className="mt-2 text-[0.875rem] leading-relaxed text-body line-clamp-3">
                        {b.dek}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 border-t border-divider pt-3.5 space-y-2.5">
                    {/* Author Byline & Read here CTA */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar src={b.authorPhoto} initials={b.authorName.substring(0, 2).toUpperCase()} size="xs" />
                        <div className="min-w-0">
                          <span className="block font-sans text-[0.8125rem] font-bold text-heading truncate">
                            {b.authorName}
                          </span>
                          <span className="block text-[0.71875rem] text-subtle" suppressHydrationWarning>
                            {b.date}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/blogs/$slug"
                        params={{ slug: b.slug }}
                        className="group/read shrink-0 font-sans text-[0.8125rem] font-bold text-heading hover:text-[#FF6B35] transition-colors relative pb-0.5"
                      >
                        <span>Read here</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-200 group-hover/read:w-full" />
                      </Link>
                    </div>

                    {/* Reading Time Row (No Like or View Button) */}
                    <div className="flex items-center justify-end text-[0.8125rem] pt-1">
                      <span className="inline-flex items-center gap-1.5 text-subtle text-[0.75rem]">
                        <Clock className="size-3.5 text-emerald-500" />
                        <span>{b.readingTime} min read</span>
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalBlogsCount}
          pageSize={9}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 300, behavior: "smooth" });
          }}
        />
      </div>
    </SiteLayout>
  );
}
