import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Clock, Edit3, Eye, EyeOff, FileText, Folder, Heart, ImagePlus, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, CustomSelect, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/blogs")({
  head: () =>
    pageHead(
      "Post a blog · tossatale admin",
      "Compose and publish journal posts from the tossatale editorial desk.",
    ),
  component: AdminBlogs,
});

function AdminBlogs() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"editor" | "library">("editor");
  const [activeEditingSlug, setActiveEditingSlug] = useState<string | null>(null);

  // Form State (Cleaned up: SEO title/desc removed, Tags added)
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [readingTimeInput, setReadingTimeInput] = useState("5");
  const [isFeatured, setIsFeatured] = useState(false);
  const [preview, setPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Fetch Categories
  const { data: apiCategories } = useQuery({
    queryKey: ["public-categories-blogs"],
    queryFn: async () => {
      const res = await api.get("/public/categories/");
      return res.data?.results || res.data || [];
    },
  });
  const categoriesList = Array.isArray(apiCategories) ? apiCategories : [];

  // Fetch Published & Draft Blogs
  const { data: apiBlogs } = useQuery({
    queryKey: ["admin-blogs-list"],
    queryFn: async () => {
      const res = await api.get("/admin/blogs/");
      return res.data?.results || res.data || [];
    },
  });
  const blogsList = Array.isArray(apiBlogs) ? apiBlogs : [];

  // Delete Blog Mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async (slug: string) => {
      return await api.delete(`/admin/blogs/${slug}/`);
    },
    onSuccess: () => {
      toast.success("Blog post deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs-list"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete blog post", { description: err.message });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        toast.success("Cover image loaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const paragraphs = useMemo(
    () => body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    [body],
  );

  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const minutes = Math.max(1, Math.round(words / 220));

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and content are required to publish a blog!");
      return;
    }
    setIsPublishing(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        excerpt: subtitle.trim(),
        content: body,
        category_id: selectedCategory || categoriesList[0]?.id || null,
        tags: tagsInput.trim(),
        reading_time: Number(readingTimeInput) || 5,
        cover_image: coverImage || "",
        is_featured: isFeatured,
      };

      if (activeEditingSlug) {
        await api.patch(`/admin/blogs/${activeEditingSlug}/`, payload);
        toast.success("Blog Post Updated!", { description: `"${title}" has been updated successfully.` });
      } else {
        await api.post("/admin/blogs/", payload);
        toast.success("Blog Published Live!", { description: `"${title}" is now published live under /blogs.` });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-blogs-list"] });
      handleClearEditor();
    } catch (err: any) {
      toast.error("Failed to save blog post", { description: err.response?.data?.message || err.message });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditBlog = (post: any) => {
    setActiveEditingSlug(post.slug || post.id);
    setTitle(post.title || "");
    setSubtitle(post.subtitle || post.excerpt || "");
    setBody(post.content || (Array.isArray(post.body) ? post.body.join("\n\n") : ""));
    setSelectedCategory(post.category?.id || post.category?.slug || "");
    setCoverImage(post.cover_image || post.cover || null);
    setTagsInput(post.tag || post.tags || "");
    setReadingTimeInput(String(post.reading_time || post.readingTime || 5));
    setIsFeatured(Boolean(post.is_featured));
    setActiveTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`Loaded "${post.title}" into editor.`);
  };

  const handleDeleteBlog = (post: any) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      deleteBlogMutation.mutate(post.slug || post.id);
    }
  };

  const handleClearEditor = () => {
    setActiveEditingSlug(null);
    setTitle("");
    setSubtitle("");
    setBody("");
    setCoverImage(null);
    setTagsInput("");
    setReadingTimeInput("5");
    setIsFeatured(false);
    toast.info("Cleared editor canvas to compose new blog post.");
  };

  return (
    <AppShell
      role="admin"
      title="Post a blog"
      blurb="Journal posts publish instantly under /blogs — no review queue, no waiting."
      actions={
        activeTab === "editor" ? (
          <>
            {activeEditingSlug && (
              <Button variant="ghostOutline" size="sm" onClick={handleClearEditor} className="gap-1.5 text-xs">
                <Plus className="size-3.5" /> Compose New
              </Button>
            )}
            <Button variant="ghostOutline" size="sm" onClick={() => setPreview((v) => !v)} className="gap-1.5">
              {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={isPublishing} className="gap-1.5">
              <Send className="size-4" /> {isPublishing ? "Publishing..." : activeEditingSlug ? "Update post" : "Publish post"}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setActiveTab("editor")} className="gap-1.5">
            <Plus className="size-4" /> Compose New Blog
          </Button>
        )
      }
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Workspace Navigation Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("editor")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
              activeTab === "editor"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-body hover:bg-surface-hover border border-border"
            )}
          >
            <FileText className="size-4" /> {activeEditingSlug ? "Editing Blog Post" : "Compose / Edit Blog"}
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
              activeTab === "library"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-body hover:bg-surface-hover border border-border"
            )}
          >
            <Folder className="size-4" /> Admin Blogs Desk
            <span className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[0.75rem]",
              activeTab === "library" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary-light text-primary"
            )}>
              {blogsList.length}
            </span>
          </button>
        </div>

        {activeEditingSlug && (
          <Button variant="ghostOutline" size="sm" onClick={handleClearEditor} className="text-xs text-primary font-bold">
            + Clear Editor
          </Button>
        )}
      </div>

      {/* View 1: Compact Clean Editor View */}
      {activeTab === "editor" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main Writing Workspace */}
          <div className="min-w-0">
            <Panel className="p-6 lg:p-8 space-y-4">
              {preview ? (
                <article className="prose dark:prose-invert max-w-none">
                  <span className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-primary uppercase">
                    Preview Mode
                  </span>
                  <h2 className="mt-2 font-display text-3xl font-bold text-heading">
                    {title || "Untitled post"}
                  </h2>
                  {subtitle && <p className="mt-2 text-lg italic text-body">{subtitle}</p>}
                  {coverImage && (
                    <img src={coverImage} alt="Cover preview" className="mt-4 h-48 w-full rounded-xl object-cover" />
                  )}
                  <hr className="my-6 border-border" />
                  {paragraphs.length ? (
                    <div className="space-y-4 text-body font-sans leading-relaxed">
                      {paragraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[0.9375rem] text-subtle italic">
                      Nothing written yet — switch back to editing to draft the post.
                    </p>
                  )}
                  <div className="mt-8 flex items-center gap-4 text-[0.8125rem] text-subtle">
                    <span>{words} words</span>
                    <span>·</span>
                    <span>{minutes} min read</span>
                  </div>
                </article>
              ) : (
                <>
                  <Field label="Post Title">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Post title"
                      className="font-display text-[1.125rem] font-bold h-11"
                    />
                  </Field>
                  <Field label="Summary / Excerpt" hint="Short one-line teaser">
                    <Textarea
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="A one-line summary..."
                      rows={2}
                    />
                  </Field>

                  <Field label="Blog Content" hint="Prose body of the post">
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={13}
                      placeholder="Write the post…"
                      className="font-sans text-[1rem] leading-relaxed"
                    />
                  </Field>

                  <div className="mt-3 flex items-center justify-between text-[0.8125rem] text-subtle pt-2 border-t border-border">
                    <span>{words} words · ~{minutes} min read</span>
                    <span className="font-sans font-medium">Auto-saves as draft</span>
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* Right Control Panel (High-Density & Clean) */}
          <aside className="space-y-6">
            <Panel className="p-6 space-y-4">
              <h2 className="text-lg font-display font-bold text-heading">Post Controls</h2>
              
              <Field label="Category">
                <CustomSelect
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val)}
                  options={[
                    { label: "General", value: "" },
                    ...categoriesList.map((c: any) => ({
                      label: c.name,
                      value: c.id || c.slug,
                    })),
                  ]}
                />
              </Field>

              <Field label="Tags" hint="Comma separated">
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="announcements, craft, research"
                  className="h-11 text-[0.875rem]"
                />
              </Field>

              <Field label="Reading Time (mins)">
                <Input
                  type="number"
                  min="1"
                  value={readingTimeInput}
                  onChange={(e) => setReadingTimeInput(e.target.value)}
                  placeholder="5"
                  className="h-11 text-[0.875rem]"
                />
              </Field>

              <div className="border-t border-border pt-3">
                <p className="font-sans text-[0.8125rem] font-bold text-heading">Cover Image</p>
                {coverImage ? (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-border">
                    <img src={coverImage} alt="Cover preview" className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute top-2 right-2 rounded-lg bg-background/90 px-2 py-1 text-xs font-bold text-destructive backdrop-blur hover:bg-background"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={triggerFileSelect}
                    className="mt-2 grid h-28 cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-surface-alt/60 text-subtle transition-all hover:border-primary/50 hover:bg-primary-light/20"
                  >
                    <span className="flex flex-col items-center gap-1.5 text-[0.8125rem] font-medium text-body">
                      <ImagePlus className="size-5 text-primary" /> Click or drop image
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghostOutline"
                  size="sm"
                  onClick={triggerFileSelect}
                  className="mt-2.5 w-full text-xs"
                >
                  {coverImage ? "Change cover image" : "Upload cover"}
                </Button>
              </div>

              <div className="border-t border-border pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="font-sans text-[0.8125rem] font-bold text-heading">Feature post on homepage</span>
                </label>
              </div>
            </Panel>
          </aside>
        </div>
      )}

      {/* View 2: Library / Admin Blogs Desk View */}
      {activeTab === "library" && (
        <Panel className="p-6 lg:p-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-heading">Admin Blogs Desk</h2>
              <p className="mt-0.5 text-[0.875rem] text-subtle">
                Manage published journal posts — edit details or delete entries.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActiveTab("editor")} className="gap-1.5">
              <Plus className="size-4" /> Compose New Blog
            </Button>
          </div>

          {blogsList.length === 0 ? (
            <div className="mt-6 py-12 text-center text-subtle font-medium border border-dashed border-border rounded-2xl">
              No blog posts found in database. Click "Compose New Blog" to write your first post!
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogsList.map((post: any) => {
                const viewsCount = post.views_count ?? post.views ?? 0;
                const likesCount = post.likes_count ?? post.likes ?? 0;
                const readingTime = post.reading_time || post.readingTime || 3;

                return (
                  <div
                    key={post.id || post.slug}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      {(post.cover_image || post.cover) && (
                        <img
                          src={post.cover_image || post.cover}
                          alt={post.title}
                          className="h-32 w-full rounded-xl object-cover mb-3"
                        />
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone={post.status === "PUBLISHED" ? "success" : "info"}>
                          {post.status || "Live"}
                        </Badge>
                        <span className="font-sans text-[0.75rem] font-bold text-subtle truncate">
                          {post.category?.name || post.tag || "General"}
                        </span>
                      </div>
                      <h3 className="mt-2.5 font-display text-[1.0625rem] font-bold text-heading line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-[0.8125rem] text-subtle line-clamp-2">
                        {post.subtitle || post.excerpt || post.plain_text_content || "No summary provided..."}
                      </p>

                      {/* Live Blog Analytics Badges */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-surface-alt/60 p-2.5 text-[0.75rem]">
                        <div className="flex items-center gap-1 font-semibold text-heading" title="Total Views / Reads">
                          <Eye className="size-3.5 text-blue-500" />
                          <span>{Number(viewsCount).toLocaleString()}</span>
                          <span className="text-[0.6875rem] text-subtle font-normal">views</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-heading" title="Registered Likes">
                          <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />
                          <span>{Number(likesCount).toLocaleString()}</span>
                          <span className="text-[0.6875rem] text-subtle font-normal">likes</span>
                        </div>
                        {post.is_featured && (
                          <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400" title="Featured on Homepage">
                            <Sparkles className="size-3.5 text-amber-500 fill-amber-500/20" />
                            <span className="text-[0.6875rem]">Featured</span>
                          </div>
                        )}
                        <div className="ml-auto flex items-center gap-1 text-[0.6875rem] text-subtle font-medium" title="Estimated Reading Time">
                          <Clock className="size-3" />
                          <span>{readingTime}m</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[0.75rem] text-subtle">
                      <span>
                        {post.created_at
                          ? new Date(post.created_at).toLocaleDateString()
                          : post.date || "Recently"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghostOutline"
                          size="sm"
                          onClick={() => handleEditBlog(post)}
                          className="h-8 px-2.5 text-xs gap-1"
                        >
                          <Edit3 className="size-3" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteBlog(post)}
                          className="h-8 px-2.5 text-xs gap-1"
                        >
                          <Trash2 className="size-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}
    </AppShell>
  );
}
