import { createFileRoute, useBlocker } from "@tanstack/react-router";
import {
  Bold,
  Check,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Folder,
  Globe,
  Heading as HeadingIcon,
  Heart,
  ImagePlus,
  Italic,
  Link2,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { Pagination } from "@/components/tossa/Pagination";
import { UnsavedChangesModal } from "@/components/tossa/UnsavedChangesModal";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

function serializeBlogState(
  title: string,
  subtitle: string,
  body: string,
  cat: string,
  tags: string,
  cover: string | null,
) {
  return JSON.stringify({
    title: (title || "").trim(),
    subtitle: (subtitle || "").trim(),
    body: (body || "").trim(),
    cat: (cat || "").trim(),
    tags: (tags || "").trim(),
    cover: cover || "",
  });
}

function renderBlogPreview(rawContent: string) {
  if (!rawContent) return "";
  let formatted = rawContent;

  // Process Markdown links [text](url)
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline font-medium hover:opacity-80">$1</a>'
  );

  // Process Headings
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="font-display font-bold text-2xl text-heading mt-8 mb-3">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="font-display font-bold text-3xl text-heading mt-10 mb-4">$1</h2>');

  // Process Bold & Italic
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

  // Process Blockquotes
  formatted = formatted.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1 italic my-4 text-heading font-serif text-lg bg-surface-alt/40 rounded-r-lg">$1</blockquote>');

  // Process Dividers
  formatted = formatted.replace(/^---$/gim, '<hr class="my-8 border-border" />');

  // Split paragraphs and wrap non-block elements in <p>
  const paragraphs = formatted.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p) => {
    if (/^<(h1|h2|h3|h4|h5|h6|figure|blockquote|ul|ol|div|p|hr)\b/i.test(p)) {
      return p;
    }
    return `<p class="leading-relaxed text-body text-[1.0625rem] mb-5">${p.replace(/\n/g, "<br />")}</p>`;
  }).join("\n");
}

/* =========================================================================
   INSERT LINK MODAL (Custom Dialog - Replaces window.prompt)
   ========================================================================= */

interface InsertLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string, newTab: boolean) => void;
  initialText?: string;
}

function InsertLinkModal({ isOpen, onClose, onInsert, initialText = "" }: InsertLinkModalProps) {
  const [url, setUrl] = useState("https://");
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setUrl((prev) => (prev && prev !== "https://" ? prev : "https://"));
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl || cleanUrl === "https://" || cleanUrl === "http://") {
      toast.error("Please enter a valid destination URL");
      return;
    }
    const finalUrl = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
    const displayText = text.trim() || finalUrl;
    onInsert(finalUrl, displayText, openInNewTab);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-lift overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-alt/40">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Link2 className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-heading">Insert Redirect Link</h3>
              <p className="text-[0.75rem] text-subtle">Add a hyperlink to selected text or a new label</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-hover hover:text-heading transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
              Destination URL <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/story"
                className="h-10 text-sm font-sans pl-3 pr-8"
              />
              <Globe className="absolute right-3 top-3 size-4 text-subtle/50 pointer-events-none" />
            </div>
            <p className="mt-1 text-[0.6875rem] text-subtle">Enter external link, story page, or destination URL.</p>
          </div>

          <div>
            <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
              Display Link Text <span className="text-subtle font-normal">(optional)</span>
            </label>
            <Input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Read full story here"
              className="h-10 text-sm font-sans"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="new-tab-checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="new-tab-checkbox" className="text-[0.8125rem] font-medium text-body cursor-pointer select-none">
              Open link in a new tab (<code className="text-xs text-primary font-mono">target="_blank"</code>)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="ghostOutline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Link2 className="size-3.5" /> Insert Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   COVER IMAGE MODAL (Supports Both File Upload & Web Link URL)
   ========================================================================= */

interface CoverImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imgSrc: string) => void;
  currentCover?: string | null;
}

function CoverImageModal({ isOpen, onClose, onSave }: CoverImageModalProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setPreview(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file");
      return;
    }
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          setPreview(compressed);
          toast.success("Cover image optimized!");
        } else {
          setPreview(result);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setPreview(result);
        setIsProcessing(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const finalSource = mode === "upload" ? preview : url.trim();
    if (!finalSource) {
      toast.error("Please provide a cover image file or URL");
      return;
    }
    onSave(finalSource);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-lift overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-alt/40">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <ImagePlus className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-heading">Set Blog Cover Image</h3>
              <p className="text-[0.75rem] text-subtle">Recommended 16:9 banner for articles and social cards</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-hover hover:text-heading transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-border bg-surface-alt/20 p-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all",
              mode === "upload"
                ? "bg-surface text-primary shadow-xs border border-border"
                : "text-subtle hover:text-heading hover:bg-surface-hover/50"
            )}
          >
            <Upload className="size-3.5" /> Upload File (Local)
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all",
              mode === "url"
                ? "bg-surface text-primary shadow-xs border border-border"
                : "text-subtle hover:text-heading hover:bg-surface-hover/50"
            )}
          >
            <Globe className="size-3.5" /> Image Link / URL
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
            accept="image/*"
            className="hidden"
          />

          {mode === "upload" ? (
            <div>
              {preview ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl border border-border overflow-hidden bg-black/5 aspect-video flex items-center justify-center">
                    <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="absolute top-2 right-2 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-bold text-destructive backdrop-blur hover:bg-background shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Select another photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processFile(file);
                  }}
                  className="grid place-items-center rounded-2xl border-2 border-dashed border-border bg-surface-alt/50 p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary-light/10"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <ImagePlus className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-heading">Click or drag & drop cover image</p>
                  <p className="mt-1 text-xs text-subtle">High-resolution banner · Auto-sized to 16:9</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                  Cover Image Web URL <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    autoFocus
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="h-10 text-sm font-sans pl-3 pr-8"
                  />
                  <Globe className="absolute right-3 top-3 size-4 text-subtle/50 pointer-events-none" />
                </div>
              </div>

              {url.trim() && (
                <div className="rounded-xl border border-border overflow-hidden bg-black/5 aspect-video flex items-center justify-center p-1">
                  <img
                    src={url}
                    alt="Cover preview"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                      toast.error("Image link failed to load. Check that the URL is public and valid.");
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLElement).style.display = "block";
                    }}
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="ghostOutline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isProcessing || (mode === "upload" ? !preview : !url.trim())}
              onClick={handleSave}
              className="gap-1.5"
            >
              <Check className="size-3.5" /> Save Cover
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN ROUTE: AdminBlogs Component
   ========================================================================= */

export const Route = createFileRoute("/admin/blogs")({
  head: () =>
    pageHead(
      "Post a blog · tossatale admin",
      "Blog posts publish instantly.",
    ),
  component: AdminBlogs,
});

function AdminBlogs() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"editor" | "library">("editor");
  const [activeEditingSlug, setActiveEditingSlug] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isReadingTimeCustom, setIsReadingTimeCustom] = useState(false);
  const [readingTimeInput, setReadingTimeInput] = useState("1");
  const [isFeatured, setIsFeatured] = useState(false);
  const [preview, setPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Custom Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInitialText, setLinkInitialText] = useState("");
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Snapshot tracking for unsaved changes navigation blocker
  const savedSnapshotRef = useRef<string>(serializeBlogState("", "", "", "", "", null));

  const isDirty = useMemo(() => {
    if (activeTab !== "editor") return false;
    const current = serializeBlogState(title, subtitle, body, selectedCategory, tagsInput, coverImage);
    return current !== savedSnapshotRef.current;
  }, [activeTab, title, subtitle, body, selectedCategory, tagsInput, coverImage]);

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => {
      if (current.pathname !== next.pathname && isDirty) {
        return true;
      }
      return false;
    },
    withResolver: true,
    enableBeforeUnload: () => isDirty,
  });

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
  const { data: apiBlogsResponse } = useQuery({
    queryKey: ["admin-blogs-list", page],
    queryFn: async () => {
      const res = await api.get(`/admin/blogs/?page=${page}&page_size=12`);
      return res.data;
    },
  });
  const blogsList = apiBlogsResponse?.results || (Array.isArray(apiBlogsResponse?.data?.results) ? apiBlogsResponse.data.results : (Array.isArray(apiBlogsResponse?.data) ? apiBlogsResponse.data : (Array.isArray(apiBlogsResponse) ? apiBlogsResponse : [])));
  const totalBlogsCount = apiBlogsResponse?.count ?? apiBlogsResponse?.data?.count ?? (Array.isArray(blogsList) ? blogsList.length : 0);
  const totalPages = Math.ceil(totalBlogsCount / 12) || 1;

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

  const parsedTags = useMemo(() => {
    if (!tagsInput.trim()) return [];
    return tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
  }, [tagsInput]);

  const words = useMemo(() => {
    const clean = body.replace(/<[^>]*>/g, "").replace(/\[.*?\]\(.*?\)/g, "").trim();
    return clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  }, [body]);

  const minutes = useMemo(() => {
    if (words === 0) return 0;
    return Math.max(1, Math.ceil(words / 220));
  }, [words]);

  useEffect(() => {
    if (!isReadingTimeCustom) {
      setReadingTimeInput(String(minutes || 1));
    }
  }, [minutes, isReadingTimeCustom]);

  const handlePublish = async (): Promise<boolean> => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and content are required to publish a blog!");
      return false;
    }
    setIsPublishing(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        excerpt: subtitle.trim(),
        content: body,
        category_id: selectedCategory.trim() || "General",
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

      savedSnapshotRef.current = serializeBlogState(title, subtitle, body, selectedCategory, tagsInput, coverImage);
      queryClient.invalidateQueries({ queryKey: ["admin-blogs-list"] });
      handleClearEditor();
      return true;
    } catch (err: any) {
      toast.error("Failed to save blog post", { description: err.response?.data?.message || err.message });
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditBlog = (post: any) => {
    setActiveEditingSlug(post.slug || post.id);
    setTitle(post.title || "");
    setSubtitle(post.subtitle || post.excerpt || "");
    const initialContent = post.content || (Array.isArray(post.body) ? post.body.join("\n\n") : "") || "";
    setBody(initialContent);
    const catVal = post.category?.name || post.category?.slug || "";
    setSelectedCategory(catVal);
    const coverVal = post.cover_image || post.cover || null;
    setCoverImage(coverVal);
    const tagVal = Array.isArray(post.tags)
      ? post.tags.map((t: any) => t.name || t).join(", ")
      : (post.tag || post.tags || "");
    setTagsInput(tagVal);
    const savedRT = post.reading_time || post.readingTime;
    if (savedRT) {
      setReadingTimeInput(String(savedRT));
      setIsReadingTimeCustom(true);
    } else {
      setIsReadingTimeCustom(false);
    }
    setIsFeatured(Boolean(post.is_featured));

    savedSnapshotRef.current = serializeBlogState(
      post.title || "",
      post.subtitle || post.excerpt || "",
      initialContent,
      catVal,
      tagVal,
      coverVal,
    );

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
    setSelectedCategory("");
    setCoverImage(null);
    setTagsInput("");
    setReadingTimeInput("1");
    setIsReadingTimeCustom(false);
    setIsFeatured(false);
    savedSnapshotRef.current = serializeBlogState("", "", "", "", "", null);
    toast.info("Ready to compose a new blog post.");
  };

  const handlePublishAndLeave = async () => {
    const success = await handlePublish();
    if (success) {
      blocker.proceed?.();
    }
  };

  const handleStay = () => {
    blocker.reset?.();
  };

  const handleDiscardAndLeave = () => {
    savedSnapshotRef.current = serializeBlogState(title, subtitle, body, selectedCategory, tagsInput, coverImage);
    blocker.proceed?.();
  };

  const insertSnippet = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = document.getElementById("blog-body-textarea") as HTMLTextAreaElement | null;
    if (!textarea) {
      setBody((prev) => prev + before + placeholder + after);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || placeholder;
    const replacement = before + selected + after;
    const newBody = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const openInsertLinkModal = () => {
    const textarea = document.getElementById("blog-body-textarea") as HTMLTextAreaElement | null;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end).trim();
      setLinkInitialText(selected);
    } else {
      setLinkInitialText("");
    }
    setIsLinkModalOpen(true);
  };

  const handleInsertLinkSubmit = (url: string, text: string, newTab: boolean) => {
    const textarea = document.getElementById("blog-body-textarea") as HTMLTextAreaElement | null;
    const formattedLink = `[${text}](${url})`;
    if (!textarea) {
      setBody((prev) => (prev ? `${prev} ${formattedLink}` : formattedLink));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = textarea.value.substring(0, start) + formattedLink + textarea.value.substring(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedLink.length, start + formattedLink.length);
    }, 50);
    toast.success("Redirect link inserted!");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = parsedTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()).join(", ");
    setTagsInput(updated);
  };

  return (
    <AppShell
      role="admin"
      title="Post a blog"
      blurb="Compose, curate, and publish editorial stories with rich imagery."
      actions={
        activeTab === "editor" ? (
          <>
            {activeEditingSlug && (
              <Button variant="ghostOutline" size="sm" onClick={handleClearEditor} className="gap-1.5 text-xs">
                <Plus className="size-3.5" /> Compose New
              </Button>
            )}
            <Button
              variant={preview ? "primary" : "ghostOutline"}
              size="sm"
              onClick={() => setPreview((v) => !v)}
              className="gap-1.5 text-xs"
            >
              {preview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {preview ? "Back to Editor" : "Live Preview"}
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className={cn("gap-1.5 text-xs font-bold", isDirty && "ring-2 ring-primary/50 shadow-sm")}
            >
              <Send className="size-3.5" /> {isPublishing ? "Publishing..." : activeEditingSlug ? "Update Post" : "Publish Post"}
              {isDirty && <span className="size-1.5 rounded-full bg-white dark:bg-black animate-pulse" />}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setActiveTab("editor")} className="gap-1.5 text-xs">
            <Plus className="size-4" /> Compose New Blog
          </Button>
        )
      }
    >
      {/* Top Workspace Navigation Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
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
            <span
              className={cn(
                "ml-1 rounded-full px-2 py-0.5 text-[0.75rem]",
                activeTab === "library"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary-light text-primary"
              )}
            >
              {blogsList.length}
            </span>
          </button>
        </div>

        {activeEditingSlug && (
          <Button variant="ghostOutline" size="sm" onClick={handleClearEditor} className="text-xs text-primary font-bold">
            + Reset to New Draft
          </Button>
        )}
      </div>

      {/* VIEW 1: Full-Featured Blog Editor */}
      {activeTab === "editor" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Writing Workspace */}
          <div className="min-w-0 space-y-6">
            <Panel className="p-6 lg:p-8 space-y-5">
              {preview ? (
                <article className="prose dark:prose-invert max-w-none">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-primary uppercase">
                      Live Reader Preview
                    </span>
                    <span className="text-xs text-subtle">
                      Category: <strong className="text-heading">{selectedCategory || "General"}</strong>
                    </span>
                  </div>

                  <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-heading leading-tight">
                    {title || "Untitled Blog Post"}
                  </h1>

                  {subtitle && (
                    <p className="mt-2 text-lg italic text-subtle leading-relaxed border-l-2 border-primary/40 pl-3">
                      {subtitle}
                    </p>
                  )}

                  {coverImage && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-border shadow-paper">
                      <img src={coverImage} alt="Cover Preview" className="h-64 sm:h-80 w-full object-cover" />
                    </div>
                  )}

                  <hr className="my-6 border-border" />

                  {body.trim() ? (
                    <div
                      className="text-body font-sans leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderBlogPreview(body) }}
                    />
                  ) : (
                    <p className="text-[0.9375rem] text-subtle italic py-8 text-center border border-dashed border-border rounded-xl">
                      Nothing written yet — click "Back to Editor" to draft your blog post.
                    </p>
                  )}

                  {parsedTags.length > 0 && (
                    <div className="mt-8 flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                      <span className="text-xs font-bold text-subtle">Tags:</span>
                      {parsedTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-alt border border-border px-3 py-1 text-xs font-semibold text-body"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between text-xs text-subtle pt-4 border-t border-border">
                    <span>{words} words · ~{minutes} min read</span>
                    <span>tossatale Editorial Preview</span>
                  </div>
                </article>
              ) : (
                <>
                  {/* Title Field */}
                  <Field label="Post Title" hint="Catchy, engaging headline for your blog post">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Behind the Scenes: Constructing the Tossatale Universe"
                      className="font-display text-[1.125rem] font-bold h-12"
                    />
                  </Field>

                  {/* Excerpt Field */}
                  <Field label="Summary / Excerpt" hint="A 1-2 sentence hook displayed in cards and search previews">
                    <Textarea
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Discover how our writing team built the intricate world and multi-character arcs..."
                      rows={2}
                      className="text-sm font-sans"
                    />
                  </Field>

                  {/* Rich Content Editor */}
                  <Field
                    label="Blog Content"
                    hint={
                      <div className="space-y-2 pt-1">
                        {/* Editor Toolbar with Clean Formatting */}
                        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface-alt/70 p-1.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => insertSnippet("**", "**", "bold text")}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold bg-surface hover:bg-surface-hover border border-border text-heading shadow-2xs transition-colors"
                            title="Bold (**text**)"
                          >
                            <Bold className="size-3" /> Bold
                          </button>
                          <button
                            type="button"
                            onClick={() => insertSnippet("*", "*", "italic text")}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold bg-surface hover:bg-surface-hover border border-border text-heading shadow-2xs transition-colors"
                            title="Italic (*text*)"
                          >
                            <Italic className="size-3" /> Italic
                          </button>
                          <button
                            type="button"
                            onClick={() => insertSnippet("\n### ", "\n", "Section Heading")}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold bg-surface hover:bg-surface-hover border border-border text-heading shadow-2xs transition-colors"
                            title="Heading (### Title)"
                          >
                            <HeadingIcon className="size-3" /> Heading
                          </button>
                          <button
                            type="button"
                            onClick={openInsertLinkModal}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary shadow-2xs transition-colors"
                            title="Insert redirect hyperlink"
                          >
                            <Link2 className="size-3.5" /> Insert Link
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <Textarea
                      id="blog-body-textarea"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={16}
                      placeholder="Write your story here... Use the toolbar above to format text with bold, italic, headings, or insert redirect links."
                      className="font-sans text-[1rem] leading-relaxed resize-y mt-2"
                    />
                  </Field>

                  {/* Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs text-subtle">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-heading">
                        <FileText className="size-3.5 text-primary" /> {words} words
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-heading">
                        <Clock className="size-3.5 text-emerald-500" /> ~{minutes} min read
                      </span>
                    </div>
                    <span className="font-medium text-subtle/80">Markdown & HTML supported</span>
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* Right Control Panel (Cover, Category, Tags, Reading Time, Controls) */}
          <aside className="space-y-6">
            <Panel className="p-5 lg:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-base font-display font-bold text-heading">Post Controls & Meta</h2>
                <Badge tone={activeEditingSlug ? "info" : "neutral"}>
                  {activeEditingSlug ? "Editing Mode" : "New Post"}
                </Badge>
              </div>

              {/* Cover Image Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[0.8125rem] font-bold text-heading">Cover Image</label>
                  <span className="text-[0.6875rem] text-subtle">16:9 Banner</span>
                </div>

                {coverImage ? (
                  <div className="relative overflow-hidden rounded-xl border border-border shadow-xs group">
                    <img src={coverImage} alt="Cover preview" className="aspect-video w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <Button
                        type="button"
                        variant="inkOnDark"
                        size="sm"
                        onClick={() => setIsCoverModalOpen(true)}
                        className="text-xs h-8"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setCoverImage(null)}
                        className="text-xs h-8"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsCoverModalOpen(true)}
                    className="grid place-items-center rounded-xl border-2 border-dashed border-border bg-surface-alt/50 p-5 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary-light/10"
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary mb-2">
                      <ImagePlus className="size-5" />
                    </div>
                    <p className="text-xs font-bold text-heading">Add Cover Image</p>
                    <p className="mt-0.5 text-[0.6875rem] text-subtle">Upload file or paste web link</p>
                  </div>
                )}
              </div>

              {/* Category Section */}
              <div className="border-t border-border pt-4">
                <Field
                  label="Category"
                  hint="Type any category or pick from suggestions below"
                >
                  <Input
                    list="blog-category-options"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    placeholder="e.g. Editorial, Film Review, Craft"
                    className="h-10 text-sm"
                  />
                  <datalist id="blog-category-options">
                    {categoriesList.map((c: any) => (
                      <option key={c.id || c.slug} value={c.name} />
                    ))}
                  </datalist>
                </Field>

                {/* Popular Category Quick Chips */}
                {categoriesList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {categoriesList.slice(0, 5).map((c: any) => (
                      <button
                        key={c.id || c.slug}
                        type="button"
                        onClick={() => setSelectedCategory(c.name)}
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-[0.6875rem] font-semibold transition-all",
                          selectedCategory.toLowerCase() === c.name.toLowerCase()
                            ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                            : "bg-surface-alt text-subtle hover:text-heading hover:bg-surface-hover border border-border"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Input with Live Pill Preview */}
              <div className="border-t border-border pt-4">
                <Field
                  label="Tags"
                  hint="Comma-separated topics for exploration"
                >
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. storytelling, cinematography, behind-the-scenes"
                    className="h-10 text-sm"
                  />
                </Field>

                {parsedTags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-lg bg-surface-alt border border-border px-2 py-0.5 text-xs font-semibold text-body"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-subtle hover:text-destructive transition-colors ml-0.5"
                          title="Remove tag"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reading Time */}
              <div className="border-t border-border pt-4">
                <Field
                  label="Reading Time (Minutes)"
                  hint={
                    isReadingTimeCustom ? (
                      <span>
                        Custom manual override ·{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setIsReadingTimeCustom(false);
                            setReadingTimeInput(String(minutes || 1));
                          }}
                          className="text-primary font-bold underline hover:opacity-80 cursor-pointer"
                        >
                          Reset to auto-calc (~{minutes || 1} min)
                        </button>
                      </span>
                    ) : (
                      `Auto-calculated from ${words} words`
                    )
                  }
                >
                  <Input
                    type="number"
                    min="1"
                    value={readingTimeInput}
                    onChange={(e) => {
                      setIsReadingTimeCustom(true);
                      setReadingTimeInput(e.target.value);
                    }}
                    placeholder={String(minutes || 1)}
                    className="h-10 text-sm"
                  />
                </Field>
              </div>

              {/* Feature Post Switch */}
              <div className="border-t border-border pt-4">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-surface-alt/40 cursor-pointer hover:bg-surface-alt/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-4 text-amber-500 fill-amber-500/20" />
                      <span className="font-sans text-[0.8125rem] font-bold text-heading">
                        Feature on Homepage
                      </span>
                    </div>
                    <p className="mt-0.5 text-[0.6875rem] text-subtle leading-normal">
                      Spotlight this article on the tossatale homepage carousel
                    </p>
                  </div>
                </label>
              </div>

              {/* Publish Action Bottom Bar */}
              <div className="border-t border-border pt-4 space-y-2">
                <Button
                  size="md"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full justify-center gap-2 font-bold shadow-paper"
                >
                  <Send className="size-4" />
                  {isPublishing ? "Publishing..." : activeEditingSlug ? "Update Blog Post" : "Publish Blog Live"}
                </Button>
                {activeEditingSlug && (
                  <Button
                    variant="ghostOutline"
                    size="sm"
                    onClick={handleClearEditor}
                    className="w-full justify-center text-xs"
                  >
                    Cancel & Compose New
                  </Button>
                )}
              </div>
            </Panel>
          </aside>
        </div>
      )}

      {/* VIEW 2: Admin Blogs Desk (Library Grid) */}
      {activeTab === "library" && (
        <Panel className="p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-heading">Admin Blogs Desk</h2>
              <p className="mt-0.5 text-[0.875rem] text-subtle">
                Manage, edit, or archive published editorial blog entries.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActiveTab("editor")} className="gap-1.5 text-xs">
              <Plus className="size-4" /> Compose New Blog
            </Button>
          </div>

          {blogsList.length === 0 ? (
            <div className="mt-6 py-16 text-center border border-dashed border-border rounded-2xl bg-surface-alt/30">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
                <FileText className="size-6" />
              </div>
              <h3 className="font-display text-base font-bold text-heading">No blog posts found</h3>
              <p className="mt-1 text-xs text-subtle max-w-sm mx-auto">
                Ready to publish your first editorial article? Click below to start composing.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("editor")}
                className="mt-4 gap-1.5 text-xs"
              >
                <Plus className="size-3.5" /> Start Composing
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                        <div className="mb-3 overflow-hidden rounded-xl border border-border/80 aspect-video">
                          <img
                            src={post.cover_image || post.cover}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
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

                      {/* Live Analytics Badges */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-surface-alt/60 p-2.5 text-[0.75rem]">
                        <div className="flex items-center gap-1 font-semibold text-heading" title="Total Views">
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
                          <Clock className="size-3 text-emerald-500" />
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

          {/* Library Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 border-t border-border pt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalCount={totalBlogsCount}
                pageSize={12}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </Panel>
      )}

      {/* Insert Link Custom Modal */}
      <InsertLinkModal
        isOpen={isLinkModalOpen}
        initialText={linkInitialText}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={handleInsertLinkSubmit}
      />

      {/* Cover Image Custom Modal (Upload File or URL) */}
      <CoverImageModal
        isOpen={isCoverModalOpen}
        currentCover={coverImage}
        onClose={() => setIsCoverModalOpen(false)}
        onSave={(imgSrc) => {
          setCoverImage(imgSrc);
          toast.success("Cover image set!");
        }}
      />

      {/* Unsaved Blog Changes Navigation Blocker Modal */}
      <UnsavedChangesModal
        isOpen={blocker.status === "blocked"}
        isSaving={isPublishing}
        title="Unsaved Blog Post!"
        badgeText="Blog Changes Not Published"
        description="You have composed or edited blog content, cover image, or categories without publishing."
        tipText="Click Publish & Continue to instantly publish your blog post before moving to another screen!"
        saveButtonText="Publish & Continue"
        onSaveAndLeave={handlePublishAndLeave}
        onStay={handleStay}
        onDiscardAndLeave={handleDiscardAndLeave}
      />
    </AppShell>
  );
}
