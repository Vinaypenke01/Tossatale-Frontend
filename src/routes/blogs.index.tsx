import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { CategoryPill, Panel } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import { covers } from "@/lib/data";

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
  const { data: apiBlogs, isLoading } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => {
      const res = await api.get("/public/blogs/");
      return res.data?.results || res.data || [];
    },
  });

  const displayBlogs = (apiBlogs && Array.isArray(apiBlogs))
    ? apiBlogs.map((b: any) => ({
        slug: b.slug,
        title: b.title,
        dek: b.subtitle || b.excerpt || b.seo_description || "Editorial blog post",
        tag: b.category?.name || "Editorial",
        date: b.published_at ? new Date(b.published_at).toLocaleDateString() : "Recent",
        readingTime: b.reading_time || 4,
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
          <div className="py-16 text-center text-subtle font-medium">Loading blogs...</div>
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
                      <div className="p-6">
                        <CategoryPill>{b.tag}</CategoryPill>
                        <h3 className="mt-3 text-[1.2rem] leading-snug font-display font-bold text-heading line-clamp-2 min-h-[3.25rem]">
                          {b.title}
                        </h3>
                        <p className="mt-2 text-[0.9375rem] text-body line-clamp-3 min-h-[4rem]">
                          {b.dek}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 pb-6 pt-3 border-t border-border/40 text-[0.8125rem] text-subtle">
                      {b.date} · {b.readingTime} min read
                    </div>
                  </Panel>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
