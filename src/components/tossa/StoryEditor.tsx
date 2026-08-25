import { Link } from "@tanstack/react-router";
import { AlertCircle, Edit3, Eye, EyeOff, FileText, Folder, Plus, RefreshCw, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, CustomSelect, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { type Story } from "@/lib/data";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function StoryEditor({
  story,
  role = "writer",
}: {
  story?: Story | undefined;
  role?: "writer" | "admin";
}) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"editor" | "library">("editor");

  const [title, setTitle] = useState(story?.title ?? "");
  const [dek, setDek] = useState(story?.dek ?? (story as any)?.subtitle ?? "");
  const initialBody = (story as any)?.content || (story as any)?.body?.join?.("\n\n") || "";
  const [body, setBody] = useState(initialBody);
  const [preview, setPreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(story?.categorySlug ?? (story as any)?.category?.id ?? (story as any)?.category?.slug ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeEditingSlug, setActiveEditingSlug] = useState<string | null>(story?.slug ?? (story as any)?.id ?? null);
  const [rejectionFeedback, setRejectionFeedback] = useState<string>((story as any)?.rejection_feedback || (story as any)?.feedback || "");
  const initialRejectionReviews = (story as any)?.reviews ? (story as any).reviews.filter((r: any) => r.decision === "REJECTED") : [];
  const [rejectionReviews, setRejectionReviews] = useState<any[]>(initialRejectionReviews);

  const initialTags = story?.tags ? (Array.isArray(story.tags) ? story.tags.map((t: any) => t.name || t).join(", ") : "") : "";
  const [tagsInput, setTagsInput] = useState(initialTags);
  const [readingTimeInput, setReadingTimeInput] = useState(
    String((story as any)?.estimated_reading_time || (story as any)?.reading_time || "5")
  );

  useEffect(() => {
    if (story) {
      setTitle(story.title || "");
      setDek(story.dek || (story as any).subtitle || "");
      setBody((story as any).content || (story as any).body?.join?.("\n\n") || "");
      setSelectedCategory(story.categorySlug || (story as any).category?.id || (story as any).category?.slug || "");
      setActiveEditingSlug(story.slug || (story as any).id || null);
      setRejectionFeedback((story as any).rejection_feedback || (story as any).feedback || "");
      const revs = (story as any).reviews ? (story as any).reviews.filter((r: any) => r.decision === "REJECTED") : [];
      setRejectionReviews(revs);
      if (story.tags) {
        setTagsInput(Array.isArray(story.tags) ? story.tags.map((t: any) => t.name || t).join(", ") : "");
      }
      setReadingTimeInput(String((story as any).estimated_reading_time || (story as any).reading_time || "5"));
    }
  }, [story]);

  // Category creation modal/inline form state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const { data: apiCategories } = useQuery({
    queryKey: ["public-categories-editor"],
    queryFn: async () => {
      const res = await api.get("/public/categories/");
      return res.data?.results || res.data || [];
    },
  });

  const categoriesList = (apiCategories && Array.isArray(apiCategories)) ? apiCategories : [];

  // Stories list query for management section
  const { data: userStoriesData } = useQuery({
    queryKey: ["published-stories-editor-list", role],
    queryFn: async () => {
      const endpoint = isAdmin ? "/admin/stories/" : "/writer/stories/";
      const res = await api.get(endpoint);
      return res.data?.results || res.data || [];
    },
  });

  const userStoriesList = (userStoriesData && Array.isArray(userStoriesData)) ? userStoriesData : [];

  const deleteStoryMutation = useMutation({
    mutationFn: async (storySlugOrId: string) => {
      const endpoint = isAdmin ? `/admin/stories/${storySlugOrId}/` : `/writer/stories/${storySlugOrId}/`;
      return await api.delete(endpoint);
    },
    onSuccess: () => {
      toast.success("Story deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["published-stories-editor-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete story", { description: err.message });
    },
  });

  const paragraphs = useMemo(
    () => body.split(/\n{2,}/).map((p: string) => p.trim()).filter(Boolean),
    [body],
  );

  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const minutes = Math.max(1, Math.round(words / 220));

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setIsCreatingCategory(true);
    try {
      const res = await api.post("/admin/categories/", {
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || "Story Category",
        category_type: "STORY",
      });
      const createdCat = res.data?.data || res.data;
      toast.success(`Category "${newCategoryName}" created successfully!`);
      await queryClient.invalidateQueries({ queryKey: ["public-categories-editor"] });
      if (createdCat?.slug || createdCat?.id) {
        setSelectedCategory(createdCat.slug || createdCat.id);
      }
      setNewCategoryName("");
      setNewCategoryDesc("");
      setShowAddCategoryModal(false);
    } catch (err: any) {
      toast.error("Failed to create category", { description: err.message });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSave = async (status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED") => {
    if (!title.trim() || title.trim().length < 2) {
      toast.error("Please provide a story title (at least 2 characters).");
      return;
    }

    if (!body.trim() || body.trim().length < 100) {
      toast.error("Story body is too short", {
        description: "Story content must be at least 100 characters.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isAdmin ? "/admin/stories/" : "/writer/stories/";
      const payload = {
        title: title.trim(),
        subtitle: dek.trim(),
        content: body,
        category: selectedCategory || categoriesList[0]?.id || categoriesList[0]?.slug,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        reading_time: Number(readingTimeInput) || 5,
        estimated_reading_time: Number(readingTimeInput) || 5,
        status: status,
      };

      const targetSlug = activeEditingSlug || story?.slug;
      if (targetSlug) {
        await api.patch(`${endpoint}${targetSlug}/`, payload);
        toast.success("Story Updated!", { description: `"${title}" has been updated successfully.` });
      } else {
        await api.post(endpoint, payload);
        toast.success(status === "DRAFT" ? "Draft Saved!" : "Story Submitted!", {
          description: status === "DRAFT" ? `"${title}" saved as draft.` : `"${title}" submitted for editorial review.`,
        });
      }

      // Clear story form fields after successful save / submission
      setActiveEditingSlug(null);
      setTitle("");
      setDek("");
      setBody("");
      setTagsInput("");
      setReadingTimeInput("5");

      queryClient.invalidateQueries({ queryKey: ["published-stories-editor-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["writer-stories"] });
    } catch (err: any) {
      toast.error("Failed to save story", {
        description: err.response?.data?.message || err.response?.data?.error || err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStory = (st: any) => {
    setActiveEditingSlug(st.slug || st.id);
    setTitle(st.title || "");
    setDek(st.subtitle || st.seo_description || "");
    setBody(st.content || st.plain_text_content || "");
    setReadingTimeInput(String(st.estimated_reading_time || st.reading_time || 5));
    setRejectionFeedback(st.rejection_feedback || st.feedback || "");
    if (st.category?.slug || st.category?.id) {
      setSelectedCategory(st.category.slug || st.category.id);
    }
    if (st.tags && Array.isArray(st.tags)) {
      setTagsInput(st.tags.map((t: any) => t.name || t).join(", "));
    }
    setActiveTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`Loaded "${st.title}" into editor.`);
  };

  const handleDeleteStory = (st: any) => {
    if (window.confirm(`Are you sure you want to delete "${st.title}"?`)) {
      deleteStoryMutation.mutate(st.slug || st.id);
    }
  };

  const handleClearEditor = () => {
    setActiveEditingSlug(null);
    setTitle("");
    setDek("");
    setBody("");
    setTagsInput("");
    setReadingTimeInput("5");
    setRejectionFeedback("");
    toast.info("Cleared editor canvas to write new story.");
  };

  return (
    <AppShell
      role={role}
      title={activeEditingSlug ? "Edit story" : story ? "Edit story" : isAdmin ? "Write a story" : "New story"}
      blurb={
        activeEditingSlug
          ? "Editing active publication. Save changes or publish revisions."
          : story
            ? "Revise, then resubmit. Editors see a diff of what changed."
            : isAdmin
              ? "Editorial desk drafting — publish straight to the library or submit for review."
              : "Start with a sentence you'd read twice. Everything saves as you type."
      }
      actions={
        activeTab === "editor" ? (
          <>
            {activeEditingSlug && (
              <Button variant="ghostOutline" size="sm" onClick={handleClearEditor} className="gap-1.5 text-xs">
                <Plus className="size-3.5" /> New Story
              </Button>
            )}
            <Button variant="ghostOutline" size="sm" onClick={() => setPreview((v) => !v)} className="gap-1.5">
              {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button
              variant="soft"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleSave("DRAFT")}
              className="gap-1.5"
            >
              <Save className="size-4" /> Save draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleSave(isAdmin ? "PUBLISHED" : "PENDING_REVIEW")}
              className="gap-1.5"
            >
              <Send className="size-4" /> {isAdmin ? "Publish story" : "Submit for review"}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setActiveTab("editor")} className="gap-1.5">
            <Plus className="size-4" /> Write New Story
          </Button>
        )
      }
    >
      {/* Top Workspace Navigation Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
              activeTab === "editor"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-body hover:bg-surface-hover border border-border"
            )}
          >
            <FileText className="size-4" /> {activeEditingSlug ? "Editing Story" : "Write / Edit Story"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
              activeTab === "library"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-body hover:bg-surface-hover border border-border"
            )}
          >
            <Folder className="size-4" /> {isAdmin ? "Admin Stories Desk" : "My Stories"}
            <span className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[0.75rem]",
              activeTab === "library" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary-light text-primary"
            )}>
              {userStoriesList.length}
            </span>
          </button>
        </div>

        {activeEditingSlug && (
          <Button variant="ghostOutline" size="sm" onClick={handleClearEditor} className="text-xs text-primary font-bold">
            + Clear Editor
          </Button>
        )}
      </div>

      {/* View 1: Editor View */}
      {activeTab === "editor" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Writing Workspace */}
          <div className="min-w-0">
            {preview ? (
              <Panel className="prose dark:prose-invert max-w-none p-6 lg:p-8">
                <span className="font-sans text-[0.8125rem] font-bold uppercase tracking-wider text-primary">
                  Preview Mode
                </span>
                <h1 className="mt-2 text-3xl font-display font-bold text-heading sm:text-4xl">{title || "Untitled story"}</h1>
                {dek && <p className="mt-2 text-lg text-subtle italic">{dek}</p>}
                <div className="mt-6 space-y-4 text-body font-serif leading-relaxed text-[1.0625rem]">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((p: string, i: number) => <p key={i}>{p}</p>)
                  ) : (
                    <p className="text-subtle italic">No story content written yet...</p>
                  )}
                </div>
              </Panel>
            ) : (
              <Panel className="p-6 lg:p-8 space-y-5">
                {(rejectionFeedback || rejectionReviews.length > 0) && (
                  <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-destructive space-y-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-5 shrink-0 mt-0.5" />
                      <strong className="text-sm font-bold text-destructive block">
                        Editorial Revisions Requested {rejectionReviews.length > 1 ? `(Rejected ${rejectionReviews.length} times)` : "(Story Rejected)"}
                      </strong>
                    </div>

                    {rejectionReviews.length > 1 ? (
                      <div className="space-y-2 mt-2">
                        {rejectionReviews.map((rv: any, idx: number) => (
                          <div key={rv.id || idx} className="rounded-xl bg-surface/90 p-3 border border-destructive/20 text-xs">
                            <div className="flex items-center justify-between text-subtle font-semibold mb-1">
                              <span className="text-destructive font-bold">Reason #{rejectionReviews.length - idx}</span>
                              <span>{rv.reviewed_at ? new Date(rv.reviewed_at).toLocaleDateString() : "Editorial note"} · By {rv.reviewer_name || "Editor"}</span>
                            </div>
                            <p className="text-body font-normal leading-relaxed text-sm">{rv.feedback}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-body leading-relaxed font-sans">
                        {rejectionFeedback || rejectionReviews[0]?.feedback}
                      </p>
                    )}

                    <p className="text-xs text-subtle pt-1">
                      Please update your story according to the feedback above and click <strong>"Submit for review"</strong> when ready to resubmit.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-subtle font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span>{words} words · ~{minutes} min read</span>
                  </div>
                  {activeEditingSlug ? (
                    <span className="text-primary font-bold">Editing active story</span>
                  ) : (
                    <span>Auto-saves as draft</span>
                  )}
                </div>

                <Field label="Story Title" hint="Max 255 characters. Make it evocative.">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Map Beneath the Floorboards"
                    className="font-display text-[1.125rem] font-bold h-12"
                  />
                </Field>

                <Field label="Subtitle / Dek" hint="One or two sentences to set the tone.">
                  <Textarea
                    value={dek}
                    onChange={(e) => setDek(e.target.value)}
                    rows={2}
                    placeholder="Four monsoons, one cloth-bound account book, and everything a family refuses to say out loud…"
                  />
                </Field>

                <Field label="Story Body" hint="Write prose content. Separate paragraphs with a blank line.">
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={16}
                    placeholder="Write the first line…"
                    className="font-sans text-[1rem] leading-relaxed"
                  />
                </Field>
              </Panel>
            )}
          </div>

          {/* Right Compact Sidebar Controls */}
          <aside className="space-y-6">
            <Panel className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-display font-bold text-heading">Publishing Controls</h2>
                <div className="mt-2.5 flex items-center justify-between">
                  <Badge tone={activeEditingSlug ? "info" : isAdmin ? "success" : "warning"}>
                    {activeEditingSlug ? "Editing Mode" : isAdmin ? "Ready to publish" : "Draft"}
                  </Badge>
                  {activeEditingSlug && (
                    <button
                      type="button"
                      onClick={handleClearEditor}
                      className="text-[0.75rem] font-bold text-primary hover:underline"
                    >
                      + New Story
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <Field label="Category">
                  <CustomSelect
                    value={selectedCategory || (categoriesList?.[0]?.slug ?? "")}
                    onChange={(val) => setSelectedCategory(val)}
                    options={
                      categoriesList.length === 0
                        ? [{ label: "General", value: "" }]
                        : categoriesList.map((c: any) => ({
                            label: c.name,
                            value: c.slug || c.id,
                          }))
                    }
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setShowAddCategoryModal((v) => !v)}
                      className="inline-flex items-center gap-1 font-sans text-[0.8125rem] font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      <Plus className="size-3.5" /> Add Category
                    </button>
                  </div>

                  {showAddCategoryModal && (
                    <form onSubmit={handleCreateCategory} className="mt-2.5 space-y-2.5 rounded-xl border border-primary/20 bg-primary-light/40 p-3.5">
                      <p className="font-sans text-[0.8125rem] font-bold text-heading">New Category</p>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name (e.g. Mythology)"
                        required
                        className="h-9 text-[0.8125rem]"
                      />
                      <Textarea
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                        placeholder="Short description"
                        rows={2}
                        className="text-[0.75rem]"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghostOutline"
                          size="sm"
                          onClick={() => setShowAddCategoryModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={isCreatingCategory}
                        >
                          {isCreatingCategory ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </form>
                  )}
                </Field>

                <Field label="Tags" hint="Comma separated">
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="memoir, monsoon, family"
                    className="h-11 text-[0.875rem]"
                  />
                </Field>

                <Field label="Reading Time (mins)" hint="Duration in minutes">
                  <Input
                    type="number"
                    min="1"
                    value={readingTimeInput}
                    onChange={(e) => setReadingTimeInput(e.target.value)}
                    placeholder="5"
                    className="h-11 text-[0.875rem]"
                  />
                </Field>
              </div>
            </Panel>
          </aside>
        </div>
      )}

      {/* View 2: Library / Stories Desk View */}
      {activeTab === "library" && (
        <Panel className="p-6 lg:p-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-heading">
                {isAdmin ? "Admin Stories Desk" : "Your Stories Desk"}
              </h2>
              <p className="mt-0.5 text-[0.875rem] text-subtle">
                Manage stories authored — edit content or delete entries.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActiveTab("editor")} className="gap-1.5">
              <Plus className="size-4" /> Write New Story
            </Button>
          </div>

          {userStoriesList.length === 0 ? (
            <div className="mt-6 py-12 text-center text-subtle font-medium border border-dashed border-border rounded-2xl">
              No stories found in database. Click "Write New Story" to create your first story!
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userStoriesList.map((st: any) => (
                <div
                  key={st.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone={st.status === "PUBLISHED" ? "success" : st.status === "PENDING_REVIEW" ? "warning" : "info"}>
                        {st.status}
                      </Badge>
                      <span className="font-sans text-[0.75rem] font-bold text-subtle truncate">
                        {st.category?.name || "General"}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-[1.0625rem] font-bold text-heading line-clamp-2 leading-snug">
                      {st.title}
                    </h3>
                    <p className="mt-1 text-[0.8125rem] text-subtle line-clamp-2">
                      {st.subtitle || "No subtitle provided..."}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[0.75rem] text-subtle">
                    <span>{st.created_at ? new Date(st.created_at).toLocaleDateString() : "Recently"}</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghostOutline"
                        size="sm"
                        onClick={() => handleEditStory(st)}
                        className="h-8 px-2.5 text-xs gap-1"
                      >
                        <Edit3 className="size-3" /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteStory(st)}
                        className="h-8 px-2.5 text-xs gap-1"
                      >
                        <Trash2 className="size-3" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </AppShell>
  );
}
