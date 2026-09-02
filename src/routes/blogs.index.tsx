import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { BlogsGridSkeleton } from "@/components/tossa/Skeletons";
import { Pagination } from "@/components/tossa/Pagination";
import { CategoryPill, Panel } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import { covers } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Our Blogs — tossatale" },
      {
        name: "description",
        content:
          "A place for curious minds, thoughtful ideas, and things worth discovering.",
      },
      { property: "og:title", content: "Our Blogs — tossatale" },
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
      const res = await api.get(`/public/blogs/?page=${page}&page_size=12`);
      return res.data?.data || res.data || {};
    },
  });

  const rawBlogs = apiResponse?.results || (Array.isArray(apiResponse) ? apiResponse : []);
  const totalBlogsCount = apiResponse?.count || rawBlogs.length || 0;
  const totalPages = Math.ceil(totalBlogsCount / 12);

  const displayBlogs = (rawBlogs && Array.isArray(rawBlogs))
    ? rawBlogs.map((b: any) => ({
        slug: b.slug,
        title: b.title,
        dek: b.subtitle || b.excerpt || b.seo_description || "Editorial blog post",
        tag: b.category?.name || "Editorial",
        date: formatDate(b.published_at, "Recent"),
        readingTime: b.reading_time || 4,
        views: b.views_count ?? b.views ?? 0,
        likes: b.likes_count ?? b.likes ?? 0,
        cover: b.cover_image || covers.terrace,
      }))
    : [];

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <h1 className="text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Our Blogs
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            A place for curious minds, thoughtful ideas, and things worth discovering.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
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
                <Link to="/blogs/$slug" params={{ slug: b.slug }} className="block h-full">
                  <Panel hover className="h-full overflow-hidden flex flex-col justify-between">
                    <div>
                      <img
                        src={b.cover}
                        alt={b.title}
                        loading="lazy"
                        width={1200}
                        height={800}
                        className="aspect-[16/10] w-full object-cover"
                      />
                      <div className="p-5">
                        <CategoryPill>{b.tag}</CategoryPill>
                        <h3 className="mt-2.5 text-[1.125rem] leading-snug font-display font-bold text-heading line-clamp-2">
                          {b.title}
                        </h3>
                        <p className="mt-1.5 text-[0.875rem] text-body line-clamp-3">
                          {b.dek}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-3 border-t border-border/40 flex items-center justify-between text-[0.8125rem] text-subtle" suppressHydrationWarning>
                      <span>{b.date} · {b.readingTime} min read</span>
                    </div>
                  </Panel>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalBlogsCount}
          pageSize={12}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 300, behavior: "smooth" });
          }}
        />
      </div>
    </SiteLayout>
  );
}
