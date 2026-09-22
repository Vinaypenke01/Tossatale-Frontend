import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Facebook,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { cn, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { covers, defaultCover } from "@/lib/data";

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

function ShareModal({
  isOpen,
  onClose,
  title,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const currentUrl = getShareUrl();
  const shareTitle = title || "Blog post on tossatale";

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      color: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " — " + currentUrl)}`,
      icon: MessageCircle,
    },
    {
      name: "LinkedIn",
      color: "bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border-[#0A66C2]/30",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      icon: Linkedin,
    },
    {
      name: "Facebook",
      color: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border-[#1877F2]/30",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      icon: Facebook,
    },
    {
      name: "Telegram",
      color: "bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 border-[#229ED9]/30",
      href: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
      icon: Send,
    },
    {
      name: "Email",
      color: "bg-surface-alt text-subtle hover:text-heading border-border",
      href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent("Read this blog on tossatale:\n" + currentUrl)}`,
      icon: Mail,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex w-full max-w-md flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-alt/40">
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-primary" />
            <h3 className="font-display text-base font-bold text-heading">Share this post</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface hover:text-heading transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs text-subtle">Post Title</p>
            <h4 className="mt-0.5 font-display text-sm font-bold text-heading line-clamp-2">
              {shareTitle}
            </h4>
          </div>

          {/* Copy Link Field with dedicated copy button */}
          <div>
            <label className="text-xs font-bold text-subtle block mb-1.5">
              Post Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="h-10 flex-1 rounded-xl border border-border bg-surface-alt px-3.5 text-xs text-body font-mono select-all focus:outline-hidden"
              />
              <Button
                type="button"
                variant={copied ? "primary" : "soft"}
                size="sm"
                onClick={handleCopyLink}
                className="h-10 px-4 text-xs font-bold gap-1.5 shrink-0"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Social Channels */}
          <div>
            <label className="text-xs font-bold text-subtle block mb-2.5">
              Share via
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {shareLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all hover:scale-[1.02]",
                    item.color
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border px-6 py-3.5 bg-surface-alt/30 flex justify-end">
          <Button
            variant="ghostOutline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderBlogContent(rawContent: string) {
  if (!rawContent) return "";
  let formatted = rawContent;

  // 1. Process Markdown links [text](url)
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline font-medium hover:opacity-80">$1</a>'
  );

  // 2. Process Markdown images ![alt](url)
  formatted = formatted.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<figure class="my-6"><img src="$2" alt="$1" class="rounded-xl w-full max-h-[500px] object-cover" /><figcaption class="mt-2 text-center text-xs text-subtle italic">$1</figcaption></figure>'
  );

  // 3. Process Headings (### and ##)
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="font-display font-bold text-2xl text-heading mt-8 mb-3">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="font-display font-bold text-3xl text-heading mt-10 mb-4">$1</h2>');

  // 4. Process Bold (**text** or __text__)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // 5. Process Italic (*text* or _text_)
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

  // 6. Process Blockquotes (> quote)
  formatted = formatted.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1 italic my-4 text-heading font-serif text-lg">$1</blockquote>');

  // 7. Split paragraphs and wrap non-block elements in <p>
  const paragraphs = formatted.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p) => {
    if (/^<(h1|h2|h3|h4|h5|h6|figure|blockquote|ul|ol|div|p)\b/i.test(p)) {
      return p;
    }
    return `<p class="leading-relaxed text-body text-[1.0625rem] mb-5">${p.replace(/\n/g, "<br />")}</p>`;
  }).join("\n");
}

function BlogDetail() {
  const loaderData = Route.useLoaderData();
  const blog = loaderData?.blog;
  const progress = useScrollProgress();
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: relatedBlogs } = useQuery({
    queryKey: ["public-blogs-related", blog?.id, blog?.category?.slug],
    queryFn: async () => {
      const res = await api.get("/public/blogs/");
      const items = res.data?.results || res.data || [];
      return items.filter((item: any) => item.slug !== blog?.slug && item.id !== blog?.id);
    },
    enabled: !!blog,
  });

  if (!blog) {
    return <BlogNotFound />;
  }

  const authorName = blog.author?.name || blog.author?.user?.full_name || "Our Bloggers";
  const authorInitials = authorName.substring(0, 2).toUpperCase();

  return (
    <SiteLayout>
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={blog.title}
      />

      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article>
        {/* Cinematic High-Contrast Hero Section */}
        <header className="relative overflow-hidden bg-slate-950 py-12 lg:py-16 text-white dark:bg-black border-b border-white/10 shadow-md">
          {/* Background Cover Image with Rich Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={blog.cover_image || covers.terrace || defaultCover}
              alt=""
              className="h-full w-full object-cover opacity-40 dark:opacity-30 scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-550 via-slate-550/80 to-slate-550/40 dark:from-black dark:via-black/85 dark:to-black/60" />
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-primary/15 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-[820px] px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-white/70">
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span className="px-2 text-white/40">/</span>
                <Link to="/blogs" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <CategoryPill tone="onImage">{blog.category?.name || "General"}</CategoryPill>
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-white/80 font-medium">
                  <Clock className="size-3.5" /> {blog.estimated_reading_time || blog.reading_time || 5} min read
                </span>
              </div>
            </div>

            <h1 className="mt-4 text-[clamp(1.85rem,3.8vw,3.2rem)] leading-[1.15] font-display font-bold text-white drop-shadow-xs">
              {blog.title}
            </h1>

            {(blog.subtitle || blog.excerpt) && (
              <p className="mt-3.5 max-w-2xl text-[1.0625rem] sm:text-[1.125rem] leading-relaxed text-white/90">
                {blog.subtitle || blog.excerpt}
              </p>
            )}

            {/* Author Details & Byline inside Hero */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
              <div className="flex items-center gap-3.5">
                <Avatar initials={authorInitials} size="lg" />
                <div>
                  <p className="flex items-center gap-1.5 font-sans text-[1rem] font-bold text-white">
                    {authorName} <VerifiedBadge />
                  </p>
                  <p className="text-[0.8125rem] text-white/70" suppressHydrationWarning>
                    Published {formatDate(blog.published_at)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="inkOnDark"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="gap-1.5 font-semibold bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  title="Share this post"
                >
                  <Share2 className="size-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Centered Prose Article Content Below Hero */}
        <div className="mx-auto max-w-[800px] px-5 py-12 lg:py-14 lg:px-8">
          <div className="min-w-0 prose prose-lg dark:prose-invert max-w-none text-body font-sans leading-relaxed space-y-6 break-words [overflow-wrap:anywhere]">
            {blog.content ? (
              <div dangerouslySetInnerHTML={{ __html: renderBlogContent(blog.content) }} className="break-words [overflow-wrap:anywhere]" />
            ) : (
              <p className="text-lg leading-relaxed text-body break-words [overflow-wrap:anywhere]">
                {blog.subtitle || blog.excerpt || "Full blog post content."}
              </p>
            )}
          </div>

          {/* Completed Blog Reading Tags Section */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-subtle mr-1">
                Tags:
              </span>
              {blog.tags.map((t: any) => (
                <span
                  key={t.id || t.slug || t.name}
                  className="inline-flex items-center rounded-full bg-surface px-3.5 py-1 text-xs font-semibold text-heading border border-border/80 shadow-xs"
                >
                  #{t.name || t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Related Blogs Section at the end */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="border-t border-border bg-surface-alt/50 py-16">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-heading">
                  Related Blogs
                </h2>
                <p className="mt-1 text-sm text-subtle">
                  Latest blogs from our collection.
                </p>
              </div>
              <Link
                to="/blogs"
                className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-bold text-primary hover:text-primary-hover transition-colors"
              >
                More
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedBlogs.slice(0, 3).map((b: any, i: number) => {
                const bAuthor = b.author?.name || b.author?.user?.full_name || "Our Bloggers";
                const bPhoto = b.author?.profile_photo || b.author?.avatar || "";
                const bDate = formatDate(b.published_at, "Recent");
                const bReadingTime = b.reading_time || b.estimated_reading_time || 4;

                return (
                  <Reveal key={b.slug || b.id || i} delay={i * 70} className="h-full">
                    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1">
                      <div>
                        {b.cover_image && (
                          <Link to="/blogs/$slug" params={{ slug: b.slug }} className="block overflow-hidden">
                            <img
                              src={b.cover_image}
                              alt={b.title || ""}
                              loading="lazy"
                              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>
                        )}
                        <div className="p-5 sm:p-6">
                          <CategoryPill>{b.category?.name || b.tag || "Blog"}</CategoryPill>
                          <Link to="/blogs/$slug" params={{ slug: b.slug }} className="block group/title">
                            <h3 className="mt-3 text-[1.125rem] leading-snug font-display font-bold text-heading group-hover/title:text-primary transition-colors line-clamp-2">
                              {b.title}
                            </h3>
                          </Link>
                          <p className="mt-2 text-[0.875rem] text-body line-clamp-2 leading-relaxed">
                            {b.subtitle || b.excerpt || "Read full blog post..."}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 border-t border-divider pt-3.5 space-y-2.5">
                        {/* Author & Read here */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar src={bPhoto} initials={bAuthor.substring(0, 2).toUpperCase()} size="xs" />
                            <div className="min-w-0">
                              <span className="block font-sans text-[0.8125rem] font-bold text-heading truncate">
                                {bAuthor}
                              </span>
                              <span className="block text-[0.71875rem] text-subtle" suppressHydrationWarning>
                                {bDate}
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

                        {/* Reading Time */}
                        <div className="flex items-center justify-end text-[0.75rem] text-subtle">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5 text-emerald-500" />
                            <span>{bReadingTime} min read</span>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
