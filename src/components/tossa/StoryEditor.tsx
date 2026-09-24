import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Folder,
  GripVertical,
  Heart,
  Info,
  Layers,
  PenLine,
  Plus,
  RefreshCw,
  Save,
  Send,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, ButtonLink, CustomSelect, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { UnsavedChangesModal } from "@/components/tossa/UnsavedChangesModal";
import { ChaptersWorkspace } from "@/components/tossa/ChaptersWorkspace";
import { type Story } from "@/lib/data";
import { api, formatApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export function StoryEditor({
  story,
  role = "writer",
}: {
  story?: Story | undefined;
  role?: "writer" | "admin";
}) {
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"editor" | "library" | "drafts">("editor");

  const [title, setTitle] = useState(story?.title ?? "");
  const [dek, setDek] = useState(story?.dek ?? (story as any)?.subtitle ?? "");
  const initialBody = (story as any)?.content || (story as any)?.plain_text_content || (Array.isArray((story as any)?.body) ? (story as any).body.join("\n\n") : (story as any)?.body) || "";
  const [body, setBody] = useState(initialBody);
  const [isMultiChapter, setIsMultiChapter] = useState(
    Boolean(story?.is_multi_chapter || (story as any)?.chapters?.length > 0)
  );
  const [seriesStatus, setSeriesStatus] = useState<"ONGOING" | "COMPLETED">(
    (story as any)?.series_status || "ONGOING"
  );
  const [isChangingSeriesStatus, setIsChangingSeriesStatus] = useState(false);
  const [seriesSelectorOpen, setSeriesSelectorOpen] = useState(false);
  const [activeSeriesAlertModal, setActiveSeriesAlertModal] = useState<{
    isOpen: boolean;
    activeStory: any;
  } | null>(null);

  const [chapters, setChapters] = useState<any[]>(
    (story as any)?.chapters || []
  );
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [chapterTitleInput, setChapterTitleInput] = useState("");
  const [chapterContentInput, setChapterContentInput] = useState("");
  const [isSavingChapter, setIsSavingChapter] = useState(false);
  const [showSeriesMeta, setShowSeriesMeta] = useState(true);

  const [preview, setPreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(story?.categorySlug ?? (story as any)?.category?.id ?? (story as any)?.category?.slug ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeEditingSlug, setActiveEditingSlug] = useState<string | null>(story?.slug ?? (story as any)?.id ?? null);
  const [rejectionFeedback, setRejectionFeedback] = useState<string>((story as any)?.rejection_feedback || (story as any)?.feedback || "");
  const initialRejectionReviews = (story as any)?.reviews ? (story as any).reviews.filter((r: any) => r.decision === "REJECTED") : [];
  const [rejectionReviews, setRejectionReviews] = useState<any[]>(initialRejectionReviews);

  const initialTags = story?.tags ? (Array.isArray(story.tags) ? story.tags.map((t: any) => t.name || t).join(", ") : "") : "";
  const [tagsInput, setTagsInput] = useState(initialTags);
  const [isReadingTimeCustom, setIsReadingTimeCustom] = useState(
    Boolean((story as any)?.estimated_reading_time || (story as any)?.reading_time)
  );
  const [readingTimeInput, setReadingTimeInput] = useState(
    String((story as any)?.estimated_reading_time || (story as any)?.reading_time || "1")
  );

  // Snapshot tracking for unsaved story changes
  const savedSnapshotRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  const serializeStoryState = (
    t: string,
    d: string,
    b: string,
    cat: string,
    tags: string,
    mc: boolean,
  ) => {
    return JSON.stringify({
      title: t.trim(),
      dek: d.trim(),
      body: b.trim(),
      category: cat,
      tags: tags.trim(),
      is_multi_chapter: mc,
    });
  };

  useEffect(() => {
    if (story) {
      setTitle(story.title || "");
      setDek(story.dek || (story as any).subtitle || "");
      const resolvedBody = (story as any).content || (story as any).plain_text_content || (Array.isArray((story as any).body) ? (story as any).body.join("\n\n") : (story as any).body) || "";
      setBody(resolvedBody);
      const isMulti = Boolean(story.is_multi_chapter || (story as any).chapters?.length > 0);
      setIsMultiChapter(isMulti);
      setSeriesStatus((story as any).series_status || "ONGOING");
      const initialChs = (story as any).chapters || [];
      setChapters(initialChs);
      if (initialChs.length > 0) {
        setChapterTitleInput(initialChs[0]?.title || "");
        setChapterContentInput(initialChs[0]?.content || "");
      }
      const catVal = story.categorySlug || (story as any).category?.id || (story as any).category?.slug || "";
      setSelectedCategory(catVal);
      setActiveEditingSlug(story.slug || (story as any).id || null);
      setRejectionFeedback((story as any).rejection_feedback || (story as any).feedback || "");
      const revs = (story as any).reviews ? (story as any).reviews.filter((r: any) => r.decision === "REJECTED") : [];
      setRejectionReviews(revs);
      const initialTagsVal = story.tags ? (Array.isArray(story.tags) ? story.tags.map((t: any) => t.name || t).join(", ") : "") : "";
      if (story.tags) {
        setTagsInput(initialTagsVal);
      }
      const savedRT = (story as any).estimated_reading_time || (story as any).reading_time;
      if (savedRT) {
        setReadingTimeInput(String(savedRT));
        setIsReadingTimeCustom(true);
      } else {
        setIsReadingTimeCustom(false);
      }

      savedSnapshotRef.current = serializeStoryState(
        story.title || "",
        story.dek || (story as any).subtitle || "",
        resolvedBody,
        catVal,
        initialTagsVal,
        isMulti,
      );
      hasInitializedRef.current = true;
    } else if (!hasInitializedRef.current) {
      savedSnapshotRef.current = serializeStoryState("", "", "", "", "", false);
      hasInitializedRef.current = true;
    }
  }, [story]);

  const isDirty = useMemo(() => {
    if (activeTab !== "editor") return false;
    if (!hasInitializedRef.current || !savedSnapshotRef.current) {
      return Boolean(title.trim() || body.trim() || chapterTitleInput.trim() || chapterContentInput.trim());
    }
    const current = serializeStoryState(title, dek, body, selectedCategory, tagsInput, isMultiChapter);
    return current !== savedSnapshotRef.current;
  }, [activeTab, title, dek, body, selectedCategory, tagsInput, isMultiChapter, chapterTitleInput, chapterContentInput]);

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

  // Query chapters for active story
  const { data: chaptersData, refetch: refetchChapters } = useQuery({
    queryKey: ["story-chapters", activeEditingSlug, role],
    queryFn: async () => {
      if (!activeEditingSlug) return [];
      const endpoint = isAdmin
        ? `/admin/stories/${activeEditingSlug}/chapters/`
        : `/writer/stories/${activeEditingSlug}/chapters/`;
      const res: any = await api.get(endpoint);
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.data?.results)) return res.data.results;
      if (Array.isArray(res?.data?.data)) return res.data.data;
      if (Array.isArray(res?.results)) return res.results;
      return [];
    },
    enabled: !!activeEditingSlug,
  });

  // Query active ongoing series for writer
  const { data: activeOngoingSeriesData, refetch: refetchActiveOngoingSeries } = useQuery({
    queryKey: ["writer-active-ongoing-series", role],
    queryFn: async () => {
      const endpoint = isAdmin
        ? "/admin/stories/active-series/"
        : "/writer/stories/active-series/";
      const res: any = await api.get(endpoint);
      const unwrapped = res?.data?.data !== undefined ? res.data.data : (res?.data !== undefined ? res.data : res);
      if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped) && (unwrapped.id || unwrapped.slug)) {
        return unwrapped;
      }
      return null;
    },
  });

  // Query all multi-chapter series authored by writer
  const { data: allSeriesData, refetch: refetchAllSeries } = useQuery({
    queryKey: ["writer-all-series", role],
    queryFn: async () => {
      const endpoint = isAdmin
        ? "/admin/stories/series/"
        : "/writer/stories/series/";
      const res: any = await api.get(endpoint);
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.data?.results)) return res.data.results;
      if (Array.isArray(res?.data?.data)) return res.data.data;
      if (Array.isArray(res?.results)) return res.results;
      return [];
    },
  });



  const handleToggleSeriesStatus = async (newStatus: "ONGOING" | "COMPLETED") => {
    if (!activeEditingSlug) {
      setSeriesStatus(newStatus);
      toast.info(`Series status set to ${newStatus === "COMPLETED" ? "Completed" : "Ongoing"}.`);
      return;
    }
    setIsChangingSeriesStatus(true);
    try {
      const endpoint = isAdmin
        ? `/admin/stories/${activeEditingSlug}/series-status/`
        : `/writer/stories/${activeEditingSlug}/series-status/`;
      await api.post(endpoint, { series_status: newStatus });
      setSeriesStatus(newStatus);
      toast.success(
        newStatus === "COMPLETED"
          ? `"${title || "Series"}" marked as Completed! Narrative arc finalized.`
          : `"${title || "Series"}" reopened as Ongoing.`
      );
      await Promise.all([
        refetchActiveOngoingSeries(),
        refetchAllSeries(),
        queryClient.invalidateQueries({ queryKey: ["published-stories-editor-list"] }),
        queryClient.invalidateQueries({ queryKey: ["writer-stories"] }),
      ]);
    } catch (err: any) {
      toast.error("Could not update series status", {
        description: err.response?.data?.message || err.response?.data?.error || err.message,
      });
    } finally {
      setIsChangingSeriesStatus(false);
    }
  };

  useEffect(() => {
    if (chaptersData && Array.isArray(chaptersData)) {
      setChapters(chaptersData);
      if (chaptersData.length > 0) {
        setIsMultiChapter(true);
        const safeIdx = activeChapterIndex < chaptersData.length ? activeChapterIndex : 0;
        if (chaptersData[safeIdx]) {
          setChapterTitleInput(chaptersData[safeIdx].title || "");
          setChapterContentInput(chaptersData[safeIdx].content || "");
        }
      }
    }
  }, [chaptersData]);

  const handleSelectChapter = (idx: number) => {
    // Keep current chapter edits synchronized in local state before switching
    setChapters((prev) => {
      const updated = [...prev];
      if (updated[activeChapterIndex]) {
        updated[activeChapterIndex] = {
          ...updated[activeChapterIndex],
          title: chapterTitleInput,
          content: chapterContentInput,
        };
      }
      return updated;
    });
    setActiveChapterIndex(idx);
    const ch = chapters[idx];
    setChapterTitleInput(ch?.title || "");
    setChapterContentInput(ch?.content || "");
  };

  const handleStartSeries = async () => {
    if (!title.trim() || title.trim().length < 2) {
      toast.error("Series Title is mandatory (at least 2 characters).");
      return;
    }
    if (!dek.trim() || dek.trim().length < 3) {
      toast.error("Series Synopsis / Premise is mandatory.");
      return;
    }

    if (
      !activeEditingSlug &&
      activeOngoingSeriesData &&
      activeOngoingSeriesData.slug !== activeEditingSlug
    ) {
      setActiveSeriesAlertModal({
        isOpen: true,
        activeStory: activeOngoingSeriesData,
      });
      return;
    }

    const saveRes = await handleSave("DRAFT");
    if (saveRes?.success) {
      toast.success(
        activeEditingSlug
          ? `Series details for "${title}" updated successfully!`
          : `Series "${title}" started! You can now write chapters.`
      );
      if (chapters.length === 0) {
        handleAddNewChapter();
      }
    }
  };

  const handleSaveCurrentChapter = async (targetStatus: "DRAFT" | "PENDING_REVIEW" = "DRAFT") => {
    if (!title.trim() || title.trim().length < 2) {
      toast.error("Series Title is mandatory. Please provide a title.");
      return;
    }
    if (!dek.trim() || dek.trim().length < 3) {
      toast.error("Series Synopsis / Premise is mandatory. Please provide a synopsis.");
      return;
    }

    let currentSlug = activeEditingSlug;
    if (!currentSlug) {
      const saveRes = await handleSave("DRAFT");
      if (!saveRes?.success || !saveRes.slug) {
        toast.error("Could not create series draft. Please check required fields.");
        return;
      }
      currentSlug = saveRes.slug;
    }

    if (!chapterTitleInput.trim()) {
      toast.error("Please provide a chapter title.");
      return;
    }
    if (!chapterContentInput.trim()) {
      toast.error("Please provide chapter content.");
      return;
    }

    setIsSavingChapter(true);
    try {
      const activeChapter = chapters[activeChapterIndex];
      const endpointPrefix = isAdmin ? "/admin/stories" : "/writer/stories";

      let savedChapterId = activeChapter?.id;
      if (activeChapter && activeChapter.id) {
        // Update existing chapter
        const res = await api.patch(`${endpointPrefix}/${currentSlug}/chapters/${activeChapter.id}/`, {
          title: chapterTitleInput.trim(),
          content: chapterContentInput,
          status: targetStatus,
        });
        savedChapterId = res.data?.data?.id || activeChapter.id;
      } else {
        // Create new chapter
        const res = await api.post(`${endpointPrefix}/${currentSlug}/chapters/`, {
          title: chapterTitleInput.trim(),
          content: chapterContentInput,
          order: chapters.length + 1,
          status: targetStatus,
        });
        savedChapterId = res.data?.data?.id;
      }

      if (targetStatus === "PENDING_REVIEW" && savedChapterId) {
        try {
          await api.post(`${endpointPrefix}/${currentSlug}/chapters/${savedChapterId}/submit/`);
        } catch {
          // Handled if already pending
        }
        toast.success(`Chapter "${chapterTitleInput}" submitted for editorial review!`);
      } else {
        toast.success(`Chapter "${chapterTitleInput}" saved as draft.`);
      }

      await refetchChapters();
      queryClient.invalidateQueries({ queryKey: ["published-stories-editor-list"] });
      queryClient.invalidateQueries({ queryKey: ["writer-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
    } catch (err: any) {
      toast.error("Failed to save chapter", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSavingChapter(false);
    }
  };

  const handleAddNewChapter = () => {
    if (!title.trim() || title.trim().length < 2) {
      toast.error("Please provide a Series Title first (mandatory).");
      return;
    }
    if (!dek.trim() || dek.trim().length < 3) {
      toast.error("Please provide a Series Synopsis / Premise first (mandatory).");
      return;
    }
    const newOrder = chapters.length + 1;
    const newCh = {
      order: newOrder,
      title: `Chapter ${newOrder}`,
      content: "",
      word_count: 0,
      estimated_reading_time: 1,
    };
    const updated = [...chapters, newCh];
    setChapters(updated);
    setActiveChapterIndex(updated.length - 1);
    setChapterTitleInput(newCh.title);
    setChapterContentInput("");
    toast.info(`Drafting new Chapter ${newOrder}. Enter content and click "Save Chapter".`);
  };

  const handleDeleteChapter = async (idx: number) => {
    const ch = chapters[idx];
    if (!ch) return;
    if (!window.confirm(`Are you sure you want to delete "${ch.title || `Chapter ${ch.order}`}"?`)) {
      return;
    }

    if (ch.id && activeEditingSlug) {
      try {
        const endpointPrefix = isAdmin ? "/admin/stories" : "/writer/stories";
        await api.delete(`${endpointPrefix}/${activeEditingSlug}/chapters/${ch.id}/`);
        toast.success("Chapter deleted successfully.");
        await refetchChapters();
      } catch (err: any) {
        toast.error("Failed to delete chapter", { description: err.message });
      }
    } else {
      const updated = chapters.filter((_, i) => i !== idx);
      setChapters(updated);
      const nextIdx = Math.max(0, idx - 1);
      setActiveChapterIndex(nextIdx);
      setChapterTitleInput(updated[nextIdx]?.title || "");
      setChapterContentInput(updated[nextIdx]?.content || "");
    }
  };

  const handleReorderChapter = async (idx: number, direction: "up" | "down") => {
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === chapters.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const newChapters = [...chapters];
    const temp = newChapters[idx];
    newChapters[idx] = newChapters[targetIdx];
    newChapters[targetIdx] = temp;
    setChapters(newChapters);
    setActiveChapterIndex(targetIdx);

    // If activeEditingSlug and chapters have IDs, send reorder API request
    if (activeEditingSlug && newChapters.every((c) => c.id)) {
      try {
        const endpointPrefix = isAdmin ? "/admin/stories" : "/writer/stories";
        await api.post(`${endpointPrefix}/${activeEditingSlug}/chapters/reorder/`, {
          ordered_ids: newChapters.map((c) => c.id),
        });
        toast.success("Chapters reordered!");
        await refetchChapters();
      } catch (err: any) {
        toast.error("Failed to reorder chapters", { description: err.message });
      }
    }
  };

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

  const rawStoriesList = (userStoriesData && Array.isArray(userStoriesData)) ? userStoriesData : [];
  const userStoriesList = useMemo(() => {
    return rawStoriesList.filter((s: any) => !s.is_multi_chapter && (!s.chapters || s.chapters.length === 0));
  }, [rawStoriesList]);
  const hasSeriesInAccount = useMemo(() => {
    return rawStoriesList.some((s: any) => s.is_multi_chapter || (s.chapters && s.chapters.length > 0));
  }, [rawStoriesList]);
  const draftStoriesList = useMemo(() => {
    return userStoriesList.filter((s: any) => s.status === "DRAFT" || s.status === "REJECTED");
  }, [userStoriesList]);

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
      toast.error("Failed to delete story", { description: formatApiErrorMessage(err) });
    },
  });

  const paragraphs = useMemo(
    () => body.split(/\n{2,}/).map((p: string) => p.trim()).filter(Boolean),
    [body],
  );

  const words = useMemo(() => {
    const clean = body.replace(/<[^>]*>/g, "").trim();
    return clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  }, [body]);

  const minutes = useMemo(() => {
    if (words === 0) return 0;
    return Math.max(1, Math.ceil(words / 220));
  }, [words]);

  const totalChapterWords = useMemo(() => {
    return chapters.reduce((acc, c, idx) => {
      if (idx === activeChapterIndex && chapterContentInput) {
        return acc + chapterContentInput.trim().split(/\s+/).filter(Boolean).length;
      }
      const count = c.word_count || (c.content ? c.content.trim().split(/\s+/).filter(Boolean).length : 0);
      return acc + count;
    }, 0);
  }, [chapters, activeChapterIndex, chapterContentInput]);

  const totalSeriesWords = useMemo(() => {
    const dekWords = dek ? dek.trim().split(/\s+/).filter(Boolean).length : 0;
    return totalChapterWords + dekWords;
  }, [totalChapterWords, dek]);

  const totalSeriesMinutes = useMemo(() => {
    if (totalSeriesWords === 0) return 1;
    return Math.max(1, Math.ceil(totalSeriesWords / 220));
  }, [totalSeriesWords]);

  // Auto-fill reading time input if user hasn't manually set a custom value
  useEffect(() => {
    if (!isReadingTimeCustom) {
      setReadingTimeInput(String(isMultiChapter ? totalSeriesMinutes : minutes || 1));
    }
  }, [minutes, totalSeriesMinutes, isMultiChapter, isReadingTimeCustom]);

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
      toast.error("Failed to create category", { description: formatApiErrorMessage(err) });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSave = async (status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED"): Promise<{ success: boolean; slug?: string | undefined }> => {
    if (!title.trim() || title.trim().length < 2) {
      toast.error(isMultiChapter ? "Series Title is mandatory (at least 2 characters)." : "Please provide a story title (at least 2 characters).");
      return { success: false };
    }

    if (isMultiChapter && (!dek.trim() || dek.trim().length < 3)) {
      toast.error("Series Synopsis / Premise is mandatory.");
      return { success: false };
    }

    if (status !== "DRAFT") {
      if (!isMultiChapter && (!body.trim() || body.trim().length < 100)) {
        toast.error("Story body is too short for submission", {
          description: "Story content must be at least 100 characters to submit for review.",
        });
        return { success: false };
      }
      if (isMultiChapter && chapters.length === 0 && (!body.trim() || body.trim().length < 100)) {
        toast.error("Please add at least one chapter before submitting your series.", {
          description: "Switch to the Chapters tab to write and save your first chapter.",
        });
        return { success: false };
      }
    }

    setIsSubmitting(true);
    try {
      const endpoint = isAdmin ? "/admin/stories/" : "/writer/stories/";
      const effectiveCategory = selectedCategory || categoriesList[0]?.id || categoriesList[0]?.slug;
      const payload = {
        title: title.trim(),
        subtitle: dek.trim(),
        content: body,
        category: effectiveCategory,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        reading_time: Number(readingTimeInput) || (isMultiChapter ? totalSeriesMinutes : 5),
        estimated_reading_time: Number(readingTimeInput) || (isMultiChapter ? totalSeriesMinutes : 5),
        is_multi_chapter: isMultiChapter,
        series_status: isMultiChapter ? seriesStatus : "ONGOING",
        status: status,
      };

      let resolvedSlug: string | null = activeEditingSlug || story?.slug || null;
      const targetSlug = activeEditingSlug || story?.slug;
      if (targetSlug) {
        const res = await api.patch(`${endpoint}${targetSlug}/`, payload);
        const updatedStory = res.data?.data || res.data;
        const newSlug = updatedStory?.slug || updatedStory?.id;
        if (newSlug) {
          resolvedSlug = String(newSlug);
          setActiveEditingSlug(resolvedSlug);
        }
      } else {
        const res = await api.post(endpoint, payload);
        const createdStory = res.data?.data || res.data;
        const newSlug = createdStory?.slug || createdStory?.id;
        if (newSlug) {
          resolvedSlug = String(newSlug);
          setActiveEditingSlug(resolvedSlug);
        }
      }

      // If in chapters workspace or multi-chapter mode, automatically persist/update active chapter draft
      if (resolvedSlug && isMultiChapter && (chapterTitleInput.trim() || chapterContentInput.trim())) {
        try {
          const endpointPrefix = isAdmin ? "/admin/stories" : "/writer/stories";
          const activeChapter = chapters[activeChapterIndex];
          if (activeChapter && activeChapter.id) {
            await api.patch(`${endpointPrefix}/${resolvedSlug}/chapters/${activeChapter.id}/`, {
              title: chapterTitleInput.trim() || `Chapter ${activeChapterIndex + 1}`,
              content: chapterContentInput,
            });
          } else {
            const chRes = await api.post(`${endpointPrefix}/${resolvedSlug}/chapters/`, {
              title: chapterTitleInput.trim() || `Chapter ${chapters.length + 1}`,
              content: chapterContentInput,
              order: (activeChapter?.order) || (chapters.length > 0 ? chapters.length : 1),
            });
            const createdCh = chRes.data?.data || chRes.data;
            if (createdCh) {
              setChapters((prev) => {
                if (prev.length === 0) return [createdCh];
                const next = [...prev];
                next[activeChapterIndex] = createdCh;
                return next;
              });
            }
          }
          await refetchChapters();
        } catch {
          // Chapter sync handled gracefully
        }
      }

      // If submitting for review as writer, call the explicit submit endpoint to transition status
      if (status === "PENDING_REVIEW" && resolvedSlug && !isAdmin) {
        await api.post(`/writer/stories/${resolvedSlug}/submit/`);
      }

      toast.success(
        status === "DRAFT"
          ? "Draft Saved!"
          : status === "PUBLISHED"
          ? "Story Published Live!"
          : isMultiChapter
          ? "Series Submitted for Editorial Review!"
          : "Story Submitted for Editorial Review!",
        {
          description:
            status === "DRAFT"
              ? `"${title}" saved as draft. You can continue writing.`
              : `"${title}" has been submitted and is now in the editorial review queue.`,
        }
      );

      // If submitted for review or published, clear and refresh
      if (status !== "DRAFT") {
        setActiveEditingSlug(null);
        setTitle("");
        setDek("");
        setBody("");
        setIsMultiChapter(false);
        setSeriesStatus("ONGOING");
        setChapters([]);
        setTagsInput("");
        setReadingTimeInput("5");
        savedSnapshotRef.current = serializeStoryState("", "", "", "", "", false);
      } else {
        // Saved as draft: update baseline snapshot so form is clean
        savedSnapshotRef.current = serializeStoryState(title, dek, body, selectedCategory, tagsInput, isMultiChapter);
      }

      queryClient.invalidateQueries({ queryKey: ["published-stories-editor-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["writer-stories"] });
      queryClient.invalidateQueries({ queryKey: ["writer-active-ongoing-series"] });
      queryClient.invalidateQueries({ queryKey: ["writer-all-series"] });
      return { success: true, slug: resolvedSlug || undefined };
    } catch (err: any) {
      toast.error("Failed to save story", {
        description: formatApiErrorMessage(err),
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStory = async (st: any) => {
    const isMulti = Boolean(st.is_multi_chapter || st.chapters?.length > 0 || (st.chapter_count && st.chapter_count > 0));
    if (isMulti) {
      const targetRoute = isAdmin ? "/admin/series" : "/writer/series";
      const targetSlug = st.slug || st.id;
      navigate({ to: targetRoute, search: { series: targetSlug } as any });
      return;
    }
    const slugOrId = st.slug || st.id;
    setActiveEditingSlug(slugOrId);
    setTitle(st.title || "");
    setDek(st.subtitle || st.seo_description || "");
    const initialContent = st.content || st.plain_text_content || (Array.isArray(st.body) ? st.body.join("\n\n") : st.body) || "";
    setBody(initialContent);
    setIsMultiChapter(isMulti);
    setSeriesStatus(st.series_status || "ONGOING");
    if (st.chapters && Array.isArray(st.chapters) && st.chapters.length > 0) {
      setChapters(st.chapters);
      setActiveChapterIndex(0);
      setChapterTitleInput(st.chapters[0]?.title || "");
      setChapterContentInput(st.chapters[0]?.content || "");
    }
    setReadingTimeInput(String(st.estimated_reading_time || st.reading_time || 5));
    setRejectionFeedback(st.rejection_feedback || st.feedback || "");
    const catVal = st.category?.slug || st.category?.id || "";
    if (catVal) {
      setSelectedCategory(catVal);
    }
    const tagsVal = st.tags && Array.isArray(st.tags) ? st.tags.map((t: any) => t.name || t).join(", ") : "";
    if (tagsVal) {
      setTagsInput(tagsVal);
    }
    savedSnapshotRef.current = serializeStoryState(
      st.title || "",
      st.subtitle || st.seo_description || "",
      initialContent,
      catVal,
      tagsVal,
      isMulti,
    );
    setActiveTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`Loaded "${st.title}" into story editor.`);

    // Fetch full story details and dedicated chapter list concurrently
    try {
      const endpointPrefix = isAdmin ? "/admin/stories" : "/writer/stories";
      const [storyRes, chaptersRes] = await Promise.allSettled([
        api.get(`${endpointPrefix}/${slugOrId}/`),
        api.get(`${endpointPrefix}/${slugOrId}/chapters/`),
      ]);

      let loadedChapters: any[] = [];
      if (chaptersRes.status === "fulfilled") {
        const val: any = chaptersRes.value;
        const chData = val?.data?.results || val?.data?.data || val?.data || val?.results || (Array.isArray(val) ? val : []);
        if (Array.isArray(chData) && chData.length > 0) {
          loadedChapters = chData;
        }
      }

      if (storyRes.status === "fulfilled") {
        const val: any = storyRes.value;
        const fullStory = val?.data?.data || val?.data || val;
        if (fullStory && typeof fullStory === "object") {
          if (fullStory.content) setBody(fullStory.content);
          if (fullStory.title) setTitle(fullStory.title);
          if (fullStory.subtitle || fullStory.dek) setDek(fullStory.subtitle || fullStory.dek);
          if (fullStory.series_status) setSeriesStatus(fullStory.series_status);
          const resolvedCat = fullStory.category?.slug || fullStory.category?.id || catVal;
          if (resolvedCat) {
            setSelectedCategory(resolvedCat);
          }
          let resolvedTags = tagsVal;
          if (fullStory.tags && Array.isArray(fullStory.tags)) {
            resolvedTags = fullStory.tags.map((t: any) => t.name || t).join(", ");
            setTagsInput(resolvedTags);
          }
          if (loadedChapters.length === 0 && fullStory.chapters && Array.isArray(fullStory.chapters) && fullStory.chapters.length > 0) {
            loadedChapters = fullStory.chapters;
          }
          const resolvedMulti = Boolean(
            fullStory.is_multi_chapter ||
            loadedChapters.length > 0 ||
            (fullStory.chapter_count && fullStory.chapter_count > 0)
          );
          setIsMultiChapter(resolvedMulti);
          savedSnapshotRef.current = serializeStoryState(
            fullStory.title || st.title || "",
            fullStory.subtitle || fullStory.dek || st.subtitle || "",
            fullStory.content || initialContent,
            resolvedCat,
            resolvedTags,
            resolvedMulti,
          );
        }
      }

      if (loadedChapters.length > 0) {
        setChapters(loadedChapters);
        setActiveChapterIndex(0);
        setChapterTitleInput(loadedChapters[0]?.title || "");
        setChapterContentInput(loadedChapters[0]?.content || "");
        setIsMultiChapter(true);
      }
    } catch {
      // Keep existing populated data
    }
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
    setIsMultiChapter(false);
    setSeriesStatus("ONGOING");
    setChapters([]);
    setActiveChapterIndex(0);
    setChapterTitleInput("");
    setChapterContentInput("");
    setTagsInput("");
    setReadingTimeInput("5");
    setRejectionFeedback("");
    setRejectionReviews([]);
    savedSnapshotRef.current = serializeStoryState("", "", "", "", "", false);
    toast.info("Cleared editor canvas to write new story.");
  };

  const handleToggleMultiChapterInEditor = () => {
    setIsMultiChapter((prev) => !prev);
  };

  const handleSaveAndLeave = async () => {
    const res = await handleSave("DRAFT");
    if (res?.success) {
      blocker.proceed?.();
    }
  };

  const handleStay = () => {
    blocker.reset?.();
  };

  const handleDiscardAndLeave = () => {
    savedSnapshotRef.current = serializeStoryState(title, dek, body, selectedCategory, tagsInput, isMultiChapter);
    blocker.proceed?.();
  };

  const publishingSidebar = (
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
                className="text-[0.75rem] font-bold text-primary hover:underline cursor-pointer"
              >
                + New Story
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          {/* Dedicated Series Studio Link */}
          {activeTab === "editor" && !isAdmin && (
            <Link
              to="/writer/series"
              className="group relative block rounded-2xl border border-border bg-surface-alt/40 p-3.5 space-y-2 transition-all hover:border-primary/50 hover:bg-primary-light/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <span className="text-xs font-bold text-heading">Serialized Longform?</span>
                </div>
                <span className="text-[0.6875rem] font-bold text-primary flex items-center gap-1 group-hover:underline">
                  Open Studio <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <p className="text-[0.75rem] text-subtle leading-relaxed">
                Writing episodic chapters? Head over to the dedicated Series & Chapters Studio.
              </p>
            </Link>
          )}

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

          <Field
            label={isMultiChapter ? "Series Total Reading Time (mins)" : "Reading Time (mins)"}
            hint={
              isReadingTimeCustom ? (
                <span>
                  Custom set ·{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsReadingTimeCustom(false);
                      setReadingTimeInput(String(isMultiChapter ? totalSeriesMinutes : (minutes || 1)));
                    }}
                    className="text-primary font-bold underline hover:opacity-80 cursor-pointer"
                  >
                    Auto-calculate (~{isMultiChapter ? totalSeriesMinutes : (minutes || 1)} min)
                  </button>
                </span>
              ) : isMultiChapter ? (
                `Series Total: ~${totalSeriesMinutes} min (${totalSeriesWords.toLocaleString()} words across ${chapters.length} chapter${chapters.length === 1 ? "" : "s"})`
              ) : (
                `Auto-calculated: ~${minutes || 1} min (${words} words)`
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
              placeholder={String(isMultiChapter ? totalSeriesMinutes : (minutes || 1))}
              className="h-11 text-[0.875rem]"
            />
          </Field>
        </div>
      </Panel>
    </aside>
  );

  return (
    <AppShell
      role={role}
      title={isAdmin ? "Write a story" : "Writer studio"}
      blurb={
        activeTab === "library"
          ? "Manage authored stories, review performance, or make live edits."
          : activeTab === "drafts"
            ? "Your unfinished drafts and revision requests — continue writing anytime."
            : activeEditingSlug
              ? "Editing active publication. Save changes or publish revisions."
              : story
                ? "Revise, then resubmit. Editors see a diff of what changed."
                : isAdmin
                  ? "Write, manage, and publish stories directly."
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
              disabled={isSubmitting || isSavingChapter}
              onClick={() => handleSave("DRAFT")}
              className={cn("gap-1.5", isDirty && "ring-2 ring-primary/50 text-primary font-semibold")}
            >
              <Save className="size-4" /> Save draft
              {isDirty && <span className="size-1.5 rounded-full bg-primary animate-pulse" />}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting || isSavingChapter}
              onClick={() => handleSave(isAdmin ? "PUBLISHED" : "PENDING_REVIEW")}
              className="gap-1.5"
            >
              <Send className="size-4" /> {isAdmin ? "Publish story" : "Submit for review"}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => { handleClearEditor(); setActiveTab("editor"); }} className="gap-1.5">
            <Plus className="size-4" /> Write New Story
          </Button>
        )
      }
    >
      {/* Top Workspace Navigation Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
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
            <FileText className="size-4" /> {activeEditingSlug ? "Editing Story" : "Write / Edit Story"}
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
            <Folder className="size-4" /> {isAdmin ? "Admin Stories Desk" : "My Stories"}
            <span className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[0.75rem]",
              activeTab === "library" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary-light text-primary"
            )}>
              {userStoriesList.length}
            </span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("drafts")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
              activeTab === "drafts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-body hover:bg-surface-hover border border-border"
            )}
          >
            <PenLine className="size-4" /> Drafts
            <span className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[0.75rem]",
              activeTab === "drafts"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : draftStoriesList.length > 0
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                  : "bg-surface-alt text-subtle"
            )}>
              {draftStoriesList.length}
            </span>
          </button>
        </div>

        {activeEditingSlug && activeTab === "editor" && (
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
              <Panel className="prose dark:prose-invert max-w-none p-6 lg:p-8 min-w-0 break-words [overflow-wrap:anywhere]">
                <span className="font-sans text-[0.8125rem] font-bold uppercase tracking-wider text-primary">
                  Preview Mode
                </span>
                <h1 className="mt-2 text-3xl font-display font-bold text-heading sm:text-4xl break-words [overflow-wrap:anywhere]">{title || "Untitled story"}</h1>
                {dek && <p className="mt-2 text-lg text-subtle italic break-words [overflow-wrap:anywhere]">{dek}</p>}
                <div className="mt-6 space-y-4 text-body font-serif leading-relaxed text-[1.0625rem] min-w-0 break-words [overflow-wrap:anywhere]">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((p: string, i: number) => (
                      <p key={i} className="break-words [overflow-wrap:anywhere] whitespace-pre-line">
                        {p}
                      </p>
                    ))
                  ) : (
                    <p className="text-subtle italic">No story content written yet...</p>
                  )}
                </div>
              </Panel>
            ) : (
              <Panel className="p-6 lg:p-8 space-y-5">
                {isMultiChapter && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Layers className="size-5 shrink-0 text-primary" />
                      <div>
                        <strong className="text-sm font-bold block text-heading">Multi-Chapter Series ("{title || "Untitled"}")</strong>
                        <p className="text-xs text-subtle mt-0.5">Chapters and episodic roadmaps are managed in the dedicated Series Studio.</p>
                      </div>
                    </div>
                    <ButtonLink
                      to={isAdmin ? "/admin/series" : "/writer/series"}
                      search={{ series: activeEditingSlug || (story as any)?.slug || (story as any)?.id } as any}
                      variant="primary"
                      size="sm"
                      className="shrink-0 gap-1.5 font-bold text-xs"
                    >
                      Open in Series Studio <ArrowRight className="size-3.5" />
                    </ButtonLink>
                  </div>
                )}

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

                <Field label="Story Title" hint="Max 60 characters. Make it evocative.">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={60}
                    placeholder="The Map Beneath the Floorboards"
                    className="font-display text-[1.125rem] font-bold h-12"
                  />
                </Field>

                <Field label="Synopsis" hint={`One or two sentences · Max 500 characters (${dek.length}/500)`}>
                  <Textarea
                    value={dek}
                    onChange={(e) => setDek(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Four monsoons, one cloth-bound account book, and everything a family refuses to say out loud…"
                  />
                </Field>

                <Field label="Story Body" hint={isMultiChapter ? "Introductory overview or prologue. Write detailed episodes in the Chapters tab." : "Write prose content. Separate paragraphs with a blank line."}>
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
          {publishingSidebar}
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
                Manage your stories: edit content or delete entries.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActiveTab("editor")} className="gap-1.5">
              <Plus className="size-4" /> Write New Story
            </Button>
          </div>

          {hasSeriesInAccount && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-heading">Multi-Chapter Series Studio</h4>
                  <p className="text-xs text-subtle">
                    Multi-chapter stories and sequential chapter roadmaps are managed in the dedicated Series Studio.
                  </p>
                </div>
              </div>
              <ButtonLink
                to={isAdmin ? "/admin/series" : "/writer/series"}
                variant="ghostOutline"
                size="sm"
                className="shrink-0 gap-1.5 font-bold text-xs self-start sm:self-auto"
              >
                Go to Series Studio <ArrowRight className="size-3.5" />
              </ButtonLink>
            </div>
          )}

          {userStoriesList.length === 0 ? (
            <div className="mt-6 py-12 text-center text-subtle font-medium border border-dashed border-border rounded-2xl">
              No stories found in database. Click "Write New Story" to create your first story!
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userStoriesList.map((st: any) => {
                const viewsCount = st.views_count ?? st.views ?? 0;
                const likesCount = st.likes_count ?? st.likes ?? 0;
                const bookmarksCount = st.bookmarks_count ?? st.bookmarks ?? 0;
                const readingTime = st.estimated_reading_time || st.reading_time || 5;
                const isMulti = Boolean(st.is_multi_chapter || (st.chapters && st.chapters.length > 0));
                const isCompletedSeries = st.series_status === "COMPLETED" || st.series_status === "completed";

                return (
                  <div
                    key={st.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge tone={st.status === "PUBLISHED" ? "success" : st.status === "PENDING_REVIEW" ? "warning" : st.status === "REJECTED" ? "error" : "info"}>
                            {st.status === "PENDING_REVIEW" ? "In Review" : st.status}
                          </Badge>
                          {isMulti && (
                            <Badge
                              tone={isCompletedSeries ? "neutral" : "success"}
                              className="gap-1 font-bold text-[0.6875rem]"
                            >
                              <Layers className="size-3" />
                              {isCompletedSeries ? "🏁 Completed" : "🟢 Ongoing"} · {st.chapters_count ?? st.chapters?.length ?? "Series"}
                            </Badge>
                          )}
                        </div>
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

                      {/* Live Story Analytics Badges */}
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
                        <div className="flex items-center gap-1 font-semibold text-heading" title="Saved Bookmarks">
                          <Bookmark className="size-3.5 text-amber-500 fill-amber-500/20" />
                          <span>{Number(bookmarksCount).toLocaleString()}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-[0.6875rem] text-subtle font-medium" title="Estimated Reading Time">
                          <Clock className="size-3" />
                          <span>{readingTime}m</span>
                        </div>
                      </div>

                      {st.rejection_feedback && (
                        <div className="mt-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-[0.75rem] text-destructive flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 shrink-0" />
                          <span className="truncate">{st.rejection_feedback}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[0.75rem] text-subtle">
                      <span>{st.created_at ? new Date(st.created_at).toLocaleDateString() : "Recently"}</span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghostOutline"
                          size="sm"
                          onClick={() => handleEditStory(st)}
                          className="h-8 px-2.5 text-xs gap-1 font-bold"
                        >
                          <Edit3 className="size-3" /> {isMulti ? "Edit Series" : "Edit"}
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
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* View 3: Drafts / In-Progress Stories Tab */}
      {activeTab === "drafts" && (
        <Panel className="p-6 lg:p-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-heading">
                Draft Stories
              </h2>
              <p className="mt-0.5 text-[0.875rem] text-subtle">
                Unfinished drafts and stories awaiting your revisions — click "Continue" to resume writing in the editor.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleClearEditor();
                setActiveTab("editor");
              }}
              className="gap-1.5"
            >
              <Plus className="size-4" /> Start New Draft
            </Button>
          </div>

          {draftStoriesList.length === 0 ? (
            <div className="mt-6 py-16 text-center text-subtle font-medium border border-dashed border-border rounded-2xl">
              <PenLine className="size-8 mx-auto mb-2 text-primary/60" />
              <p className="font-bold text-heading text-base">No drafts currently saved</p>
              <p className="text-xs text-subtle mt-1 max-w-sm mx-auto">
                All your written stories have been submitted or published. Start drafting a new story anytime!
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleClearEditor();
                  setActiveTab("editor");
                }}
                className="mt-4 gap-1.5"
              >
                <Plus className="size-4" /> Write New Story
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {draftStoriesList.map((st: any) => {
                const wordsCount = st.word_count || (st.content ? st.content.trim().split(/\s+/).filter(Boolean).length : 0);
                const readingTime = st.estimated_reading_time || st.reading_time || 5;
                const isMulti = Boolean(st.is_multi_chapter || (st.chapters && st.chapters.length > 0));
                const isCompletedSeries = st.series_status === "COMPLETED" || st.series_status === "completed";

                return (
                  <div
                    key={st.id || st.slug}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge tone={st.status === "REJECTED" ? "error" : "warning"}>
                            {st.status === "REJECTED" ? "Needs Revision" : "Draft"}
                          </Badge>
                          {isMulti && (
                            <Badge
                              tone={isCompletedSeries ? "neutral" : "success"}
                              className="gap-1 font-bold text-[0.6875rem]"
                            >
                              <Layers className="size-3" />
                              {isCompletedSeries ? "🏁 Completed" : "🟢 Ongoing"} · {st.chapters_count ?? st.chapters?.length ?? "Series"}
                            </Badge>
                          )}
                        </div>
                        <span className="font-sans text-[0.75rem] font-bold text-subtle truncate">
                          {st.category?.name || "General"}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-[1.0625rem] font-bold text-heading line-clamp-2 leading-snug">
                        {st.title || "Untitled Draft"}
                      </h3>
                      <p className="mt-1 text-[0.8125rem] text-subtle line-clamp-2">
                        {st.subtitle || "No subtitle provided..."}
                      </p>

                      {/* Draft Meta Details */}
                      <div className="mt-3.5 flex items-center justify-between rounded-xl bg-surface-alt/60 px-3 py-2 text-[0.75rem] text-subtle border border-border/40">
                        <span className="inline-flex items-center gap-1 font-medium text-heading">
                          <Clock className="size-3 text-primary" />
                          <span>{readingTime} min read</span>
                        </span>
                        <span className="text-subtle">
                          {wordsCount} words
                        </span>
                      </div>

                      {st.rejection_feedback && (
                        <div className="mt-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-[0.75rem] text-destructive flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 shrink-0" />
                          <span className="truncate">{st.rejection_feedback}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[0.75rem] text-subtle">
                      <span>
                        Saved {st.updated_at ? new Date(st.updated_at).toLocaleDateString() : (st.created_at ? new Date(st.created_at).toLocaleDateString() : "Recently")}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditStory(st)}
                          className="h-8 px-3 text-xs gap-1 font-bold"
                        >
                          <Edit3 className="size-3" /> {isMulti ? "Continue Series" : "Continue"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteStory(st)}
                          className="h-8 px-2 text-xs"
                          title="Delete Draft"
                        >
                          <Trash2 className="size-3" />
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

      {/* Unsaved Story Navigation Protection Modal */}
      <UnsavedChangesModal
        isOpen={blocker.status === "blocked"}
        isSaving={isSubmitting}
        title="Unsaved Story Changes!"
        badgeText="Story Changes Not Saved"
        description="You have composed or edited story text, title, or metadata without saving a draft or submitting."
        tipText="Save as draft now to preserve all your paragraphs, title, and edits before leaving!"
        saveButtonText="Save Draft & Continue"
        onSaveAndLeave={handleSaveAndLeave}
        onStay={handleStay}
        onDiscardAndLeave={handleDiscardAndLeave}
      />

      {/* Active Ongoing Series Single-Series Restriction Modal */}
      {activeSeriesAlertModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveSeriesAlertModal(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 z-10">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-heading">
                  Active Ongoing Series in Progress
                </h3>
                <p className="text-xs text-subtle font-medium">
                  Single Active Series Rule
                </p>
              </div>
            </div>

            <p className="text-xs text-body leading-relaxed">
              You already have an active series in progress:{" "}
              <strong className="text-heading">"{activeSeriesAlertModal.activeStory?.title}"</strong>.
              Tossatale allows writers to focus on one active serialized series at a time.
            </p>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-subtle flex items-start gap-2">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                To start a brand new series, first complete the narrative arc of your active series in the Chapters workspace by clicking <strong>"Mark as Completed"</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghostOutline"
                size="sm"
                onClick={() => setActiveSeriesAlertModal(null)}
              >
                Stay in Editor
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  const storyToOpen = activeSeriesAlertModal.activeStory;
                  setActiveSeriesAlertModal(null);
                  handleEditStory(storyToOpen);
                }}
                className="gap-1.5"
              >
                <Layers className="size-3.5" /> Open Ongoing Series
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
