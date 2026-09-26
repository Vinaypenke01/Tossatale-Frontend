import { createFileRoute } from "@tanstack/react-router";
import {
  Folder,
  Plus,
  Trash2,
  Edit2,
  Tag as TagIcon,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Button, Field, Input, Panel, Textarea, Badge } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api, formatApiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/admin/categories")({
  head: () =>
    pageHead(
      "Categories & Tags Manager · tossatale admin",
      "Create, organize, and delete story and platform categories and tags.",
    ),
  component: AdminCategoriesPage,
});

const CATEGORY_TYPES = [
  { label: "Story", value: "STORY" },
  { label: "Blog", value: "BLOG" },
  { label: "Video", value: "VIDEO" },
  { label: "General", value: "GENERAL" },
];

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Category Form State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("STORY");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Tag Form State
  const [tagName, setTagName] = useState("");

  // Queries
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: async () => {
      const res = await api.get("/admin/categories/?page_size=100");
      const data = res.data?.data || res.data;
      return data?.results || (Array.isArray(data) ? data : []);
    },
  });

  const { data: tagsData, isLoading: isTagsLoading } = useQuery({
    queryKey: ["admin-tags-list"],
    queryFn: async () => {
      const res = await api.get("/admin/tags/?page_size=100");
      const data = res.data?.data || res.data;
      return data?.results || (Array.isArray(data) ? data : []);
    },
  });

  const categories: any[] = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData : [];
  }, [categoriesData]);

  const tags: any[] = useMemo(() => {
    return Array.isArray(tagsData) ? tagsData : [];
  }, [tagsData]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.category_type?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const q = searchQuery.toLowerCase();
    return tags.filter((t) => t.name?.toLowerCase().includes(q) || t.slug?.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  // Mutations
  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: categoryName.trim(),
        category_type: categoryType,
        description: categoryDesc.trim(),
        icon: categoryIcon.trim(),
        is_featured: isFeatured,
      };
      if (editingCategoryId) {
        return api.patch(`/admin/categories/${editingCategoryId}/`, payload);
      } else {
        return api.post("/admin/categories/", payload);
      }
    },
    onSuccess: () => {
      toast.success(editingCategoryId ? "Category updated successfully!" : "Category created successfully!");
      resetCategoryForm();
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-categories"] });
      queryClient.invalidateQueries({ queryKey: ["public-categories-editor"] });
    },
    onError: (err: any) => {
      toast.error(editingCategoryId ? "Failed to update category" : "Failed to create category", {
        description: formatApiErrorMessage(err),
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/categories/${id}/`);
    },
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-categories"] });
      queryClient.invalidateQueries({ queryKey: ["public-categories-editor"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete category", { description: formatApiErrorMessage(err) });
    },
  });

  const saveTagMutation = useMutation({
    mutationFn: async () => {
      return api.post("/admin/tags/", { name: tagName.trim() });
    },
    onSuccess: () => {
      toast.success("Tag created successfully!");
      setTagName("");
      queryClient.invalidateQueries({ queryKey: ["admin-tags-list"] });
    },
    onError: (err: any) => {
      toast.error("Failed to create tag", { description: formatApiErrorMessage(err) });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/tags/${id}/`);
    },
    onSuccess: () => {
      toast.success("Tag deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-tags-list"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete tag", { description: formatApiErrorMessage(err) });
    },
  });

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryType("STORY");
    setCategoryDesc("");
    setCategoryIcon("");
    setIsFeatured(false);
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id || cat.slug);
    setCategoryName(cat.name || "");
    setCategoryType(cat.category_type || "STORY");
    setCategoryDesc(cat.description || "");
    setCategoryIcon(cat.icon || "");
    setIsFeatured(Boolean(cat.is_featured));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteCategory = (cat: any) => {
    const id = cat.id || cat.slug;
    if (window.confirm(`Are you sure you want to permanently delete the category "${cat.name}"? Stories in this category will remain intact.`)) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleDeleteTag = (tag: any) => {
    const id = tag.id || tag.slug;
    if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      deleteTagMutation.mutate(id);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Categories & Tags"
      blurb="Manage, organize, and delete story categories, blog genres, and discovery tags."
      actions={
        <div className="flex items-center gap-2">
          <a
            href="/categories"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-heading hover:border-primary hover:text-primary transition-colors"
          >
            <ExternalLink className="size-3.5" /> Live Story Shelves
          </a>
        </div>
      }
    >
      {/* ─── TABS ─── */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <button
          onClick={() => {
            setActiveTab("categories");
            resetCategoryForm();
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "categories"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-subtle hover:bg-surface hover:text-heading"
          }`}
        >
          <Folder className="size-4" /> Categories ({categories.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("tags");
            resetCategoryForm();
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "tags"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-subtle hover:bg-surface hover:text-heading"
          }`}
        >
          <TagIcon className="size-4" /> Tags ({tags.length})
        </button>
      </div>

      {/* ─── CATEGORIES TAB ─── */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Create / Edit Category */}
          <div className="lg:col-span-4">
            <Panel className="p-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    {editingCategoryId ? <Edit2 className="size-4" /> : <Plus className="size-4" />}
                  </div>
                  <h3 className="font-display font-bold text-heading">
                    {editingCategoryId ? "Edit Category" : "Add Category"}
                  </h3>
                </div>
                {editingCategoryId && (
                  <button
                    onClick={resetCategoryForm}
                    className="text-xs text-subtle hover:text-heading underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!categoryName.trim()) {
                    toast.error("Category name is required");
                    return;
                  }
                  saveCategoryMutation.mutate();
                }}
                className="mt-5 space-y-4"
              >
                <Field label="Category Name *" hint="e.g. Mythology, Horror, Sci-Fi">
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Category Name"
                    required
                  />
                </Field>

                <Field label="Category Scope">
                  <select
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-heading outline-none focus:border-primary"
                  >
                    {CATEGORY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Description" hint="Optional summary for story shelves">
                  <Textarea
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    placeholder="Short description for readers..."
                    rows={3}
                  />
                </Field>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured-cat"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="featured-cat" className="text-xs font-semibold text-heading cursor-pointer">
                    Feature on Homepage Story Shelves
                  </label>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  {editingCategoryId && (
                    <Button type="button" variant="ghostOutline" size="sm" onClick={resetCategoryForm}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={saveCategoryMutation.isPending}
                  >
                    {saveCategoryMutation.isPending
                      ? "Saving..."
                      : editingCategoryId
                      ? "Update Category"
                      : "Save Category"}
                  </Button>
                </div>
              </form>
            </Panel>
          </div>

          {/* Right List: Search & Categories Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-subtle" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories by name, slug, or scope..."
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <Panel className="p-0 overflow-hidden">
              {isCategoriesLoading ? (
                <div className="p-12 text-center text-subtle animate-pulse">Loading categories...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-12 text-center text-subtle">
                  No categories found. Use the form on the left to add one.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredCategories.map((c) => (
                    <div
                      key={c.id || c.slug}
                      className="flex items-center justify-between p-4.5 hover:bg-surface-alt/40 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                          <Folder className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-display font-bold text-heading text-base">{c.name}</h4>
                            <Badge tone="info" className="text-[0.6875rem]">
                              {c.category_type || "STORY"}
                            </Badge>
                            {c.is_featured && (
                              <Badge tone="success" className="text-[0.6875rem]">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-subtle font-mono">slug: {c.slug}</p>
                          {c.description && (
                            <p className="mt-1 text-xs text-body line-clamp-1 max-w-lg">{c.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditCategory(c)}
                          className="grid size-8 place-items-center rounded-lg text-subtle hover:bg-surface-alt hover:text-heading transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c)}
                          disabled={deleteCategoryMutation.isPending}
                          className="grid size-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* ─── TAGS TAB ─── */}
      {activeTab === "tags" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <Panel className="p-6 sticky top-24">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="size-4" />
                </div>
                <h3 className="font-display font-bold text-heading">Add Tag</h3>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!tagName.trim()) {
                    toast.error("Tag name is required");
                    return;
                  }
                  saveTagMutation.mutate();
                }}
                className="mt-5 space-y-4"
              >
                <Field label="Tag Name *" hint="e.g. monsoon, indie, thriller">
                  <Input
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Tag name"
                    required
                  />
                </Field>

                <div className="pt-3 border-t border-border flex justify-end">
                  <Button type="submit" variant="primary" size="sm" disabled={saveTagMutation.isPending}>
                    {saveTagMutation.isPending ? "Saving..." : "Save Tag"}
                  </Button>
                </div>
              </form>
            </Panel>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-subtle" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tags by name or slug..."
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <Panel className="p-6">
              {isTagsLoading ? (
                <div className="text-center text-subtle animate-pulse">Loading tags...</div>
              ) : filteredTags.length === 0 ? (
                <div className="text-center text-subtle">No tags found. Add one on the left.</div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {filteredTags.map((t) => (
                    <div
                      key={t.id || t.slug}
                      className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt/60 px-3.5 py-1.5 text-xs font-semibold text-heading transition-colors hover:border-primary/40"
                    >
                      <span>#{t.name}</span>
                      <button
                        onClick={() => handleDeleteTag(t)}
                        className="text-subtle hover:text-destructive transition-colors ml-1"
                        title="Delete Tag"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}
