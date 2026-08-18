import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Heart,
  Link2,
  Share2,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal, useScrollProgress } from "@/components/tossa/Reveal";
import {
  Avatar,
  Button,
  ButtonLink,
  CategoryPill,
  Panel,
  VerifiedBadge,
} from "@/components/tossa/kit";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { covers } from "@/lib/data";

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/public/blogs/${params.slug}/`);
      const blogData = res.data?.data || res.data;
      if (blogData && (blogData.title || blogData.id || blogData.slug)) {
        return { blog: blogData };
      }
    } catch {
      // Fallback
    }
    return { blog: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.blog) {
      return {
        meta: [{ title: "Blog not found — tossatale" }, { name: "robots", content: "noindex" }],
      };
    }
    const { blog } = loaderData;
    return {
      meta: [
        { title: `${blog.title} — tossatale` },
        { name: "description", content: blog.subtitle || blog.excerpt || blog.seo_description || "Read blog post on tossatale" },
        { property: "og:title", content: `${blog.title} — tossatale` },
        { property: "og:description", content: blog.subtitle || blog.excerpt || blog.seo_description || "Read blog post on tossatale" },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: BlogNotFound,
  component: BlogDetail,
});

function BlogNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-4xl font-display font-bold text-heading">Blog post not found</h1>
        <p className="mt-4 text-body">
          The blog article you are looking for is unavailable or may have been unpublished.
        </p>
        <div className="mt-8">
          <ButtonLink to="/blogs">Browse our blogs</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  );
}

function FloatingShare() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="sticky top-32 hidden flex-col items-center gap-2 lg:flex">
      <span className="mb-1 text-[0.625rem] font-black tracking-[0.18em] text-subtle uppercase">
        Share
      </span>
      {[
        { icon: Twitter, label: "Share on X" },
        { icon: Share2, label: "Share" },
        {
          icon: Link2,
          label: "Copy link",
          onClick: () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          },
        },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          onClick={item.onClick}
          className="grid size-11 place-items-center rounded-full border border-border bg-surface text-subtle shadow-paper transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
        >
          <item.icon className="size-4" />
        </button>
      ))}
      {copied && <span className="text-[0.6875rem] text-primary">Copied</span>}
    </div>
  );
}

function BlogDetail() {
  const loaderData = Route.useLoaderData();
  const blog = loaderData?.blog;
  const progress = useScrollProgress();
  const [liked, setLiked] = useState(false);

  const categoryParam = blog?.category?.slug || blog?.category?.id;

  const { data: relatedBlogs } = useQuery({
    queryKey: ["public-blogs-related", blog?.id, categoryParam],
    queryFn: async () => {
      let endpoint = "/public/blogs/";
      if (categoryParam) {
        endpoint += `?category=${categoryParam}`;
      }
      const res = await api.get(endpoint);
      let items = res.data?.results || res.data || [];

      // Exclude active blog
      items = items.filter((item: any) => item.slug !== blog?.slug && item.id !== blog?.id);

      // Fallback if fewer than 3 items found
      if (items.length < 3) {
        const fallbackRes = await api.get("/public/blogs/");
        const fallbackItems = fallbackRes.data?.results || fallbackRes.data || [];
        for (const fbItem of fallbackItems) {
          if (fbItem.slug !== blog?.slug && fbItem.id !== blog?.id && !items.some((it: any) => it.id === fbItem.id)) {
            items.push(fbItem);
            if (items.length >= 3) break;
          }
        }
      }
      return items;
    },
    enabled: !!blog,
  });

  if (!blog) {
    return <BlogNotFound />;
  }

  const authorName = blog.author?.full_name || blog.author?.name || "tossatale Editorial";
  const authorInitials = authorName.substring(0, 2).toUpperCase();
  const bgCover = blog.cover_image || covers.terrace;

  return (
    <SiteLayout>
      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article>
        {/* Full-Bleed Hero Section with Cover Image Background */}
        <header className="relative min-h-[480px] w-full overflow-hidden  flex flex-col justify-end text-white border-b border-border">
          {/* Background Cover Image */}
          <img
            src={bgCover}
            alt={blog.title}
            className="absolute inset-0 size-full object-cover  filter  scale-105"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20" />

          {/* Hero Content Overlay */}
          <div className="relative z-10 mx-auto w-full max-w-[920px] px-5 pt-24 pb-14 lg:px-8">
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-white/70">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="px-2">/</span>
              <Link to="/blogs" className="hover:text-white transition-colors">
                Blogs
              </Link>
              <span className="px-2">/</span>
              <span className="text-white/90">{blog.category?.name || "Editorial"}</span>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CategoryPill tone="onImage">{blog.category?.name || "Editorial"}</CategoryPill>
              <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-white/80">
                <Clock className="size-3.5" /> {blog.reading_time || 4} min read
              </span>
            </div>

            <h1 className="mt-4 font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.1] text-white shadow-sm">
              {blog.title}
            </h1>

            {(blog.subtitle || blog.excerpt) && (
              <p className="mt-4 max-w-2xl text-[1.125rem] leading-relaxed text-white/90">
                {blog.subtitle || blog.excerpt}
              </p>
            )}

            {/* Author Details & Byline inside Hero */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-6">
              <div className="flex items-center gap-3.5">
                <Avatar initials={authorInitials} size="lg" />
                <div>
                  <p className="flex items-center gap-1.5 font-sans text-[1rem] font-bold text-white">
                    {authorName} <VerifiedBadge />
                  </p>
                  <p className="text-[0.8125rem] text-white/70">
                    Published {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? "primary" : "inkOnDark"}
                  size="sm"
                  onClick={() => setLiked((v) => !v)}
                  className="gap-1.5"
                >
                  <Heart className={cn("size-4", liked && "fill-current")} />
                  {liked ? "Liked" : "Like"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Prose Article Content Below Hero */}
        <div className="mx-auto max-w-[1040px] px-5 py-14 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_56px]">
            <div className="prose prose-lg dark:prose-invert max-w-none text-body font-sans leading-relaxed space-y-6">
              {blog.content ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <p className="text-lg leading-relaxed text-body">
                  {blog.subtitle || blog.excerpt || "Full blog post content."}
                </p>
              )}
            </div>
            <FloatingShare />
          </div>
        </div>
      </article>

      {/* Related Blogs Section at the end */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="border-t border-border bg-surface-alt/50 py-16">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-heading">
                  More from our editorial team
                </h2>
                <p className="mt-1 text-sm text-subtle">
                  Explore related journal articles and thoughtful ideas.
                </p>
              </div>
              <Link
                to="/blogs"
                className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-bold text-primary"
              >
                View all blogs
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedBlogs.slice(0, 3).map((b: any, i: number) => (
                <Reveal key={b.slug || b.id} delay={i * 70}>
                  <Link to="/blogs/$slug" params={{ slug: b.slug }}>
                    <Panel hover className="h-full overflow-hidden flex flex-col justify-between">
                      <div>
                        {b.cover_image && (
                          <img
                            src={b.cover_image}
                            alt={b.title}
                            loading="lazy"
                            className="aspect-[16/10] w-full object-cover"
                          />
                        )}
                        <div className="p-6">
                          <CategoryPill>{b.category?.name || b.tag || "Editorial"}</CategoryPill>
                          <h3 className="mt-3 text-[1.15rem] leading-snug font-display font-bold text-heading line-clamp-2">
                            {b.title}
                          </h3>
                          <p className="mt-2 text-[0.875rem] text-subtle line-clamp-2">
                            {b.subtitle || b.excerpt || "Read full blog post..."}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2 border-t border-border/40 text-[0.8125rem] text-subtle">
                        {b.published_at ? new Date(b.published_at).toLocaleDateString() : "Recent"} · {b.reading_time || 4} min read
                      </div>
                    </Panel>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
