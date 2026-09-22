import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  Layers,
  PenLine,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard, type Role } from "@/components/tossa/AppShell";
import { Badge, Button, CustomSelect, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

function calculateReadingStats(text: string) {
  const clean = text.replace(/<[^>]*>/g, "").trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const minutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 220));
  return { words, minutes };
}

export function SeriesStudio({ role = "writer" }: { role?: "writer" | "admin" }) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const endpointPrefix = isAdmin ? "/admin/stories" : "/writer/stories";

  // 3-Tier Views:
  // "list"   = All Series Portfolio (Default view displaying all serialized story cards)
  // "hub"    = Selected Series Chapter Roadmap & Management
  // "canvas" = Distraction-Free Chapter Prose Writing Space
  const [viewMode, setViewMode] = useState<"list" | "hub" | "canvas">("list");

  // Active Series state
  const [activeSeries, setActiveSeries] = useState<any | null>(null);
  const [isEditingSeriesMeta, setIsEditingSeriesMeta] = useState(false);
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);

  // Series Form State
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesDek, setSeriesDek] = useState("");
  const [seriesCategory, setSeriesCategory] = useState("");
  const [seriesTags, setSeriesTags] = useState("");
  const [seriesStatus, setSeriesStatus] = useState<"ONGOING" | "COMPLETED">("ONGOING");
  const [isChangingSeriesStatus, setIsChangingSeriesStatus] = useState(false);
  const [isSavingSeriesMeta, setIsSavingSeriesMeta] = useState(false);

  // Chapters State
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [chapterTitleInput, setChapterTitleInput] = useState("");
  const [chapterContentInput, setChapterContentInput] = useState("");
  const [isSavingChapter, setIsSavingChapter] = useState(false);
  const [hasUnsavedChapterChanges, setHasUnsavedChapterChanges] = useState(false);

  // Query: Categories List
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => {
      const res: any = await api.get("/public/categories/");
      const unwrapped = res?.data !== undefined ? res.data : res;
      return Array.isArray(unwrapped) ? unwrapped : Array.isArray(unwrapped?.results) ? unwrapped.results : [];
    },
  });

  const categoriesList = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData : [];
  }, [categoriesData]);

  // Query: All Series authored by Writer/Admin
  const {
    data: allSeriesData,
    isLoading: isLoadingAllSeries,
    refetch: refetchAllSeries,
  } = useQuery({
    queryKey: [isAdmin ? "admin-all-series" : "writer-all-series", role],
    queryFn: async () => {
      const res: any = await api.get(`${endpointPrefix}/series/`);
      const unwrapped = res?.data?.data !== undefined ? res.data.data : res?.data !== undefined ? res.data : res;
      return Array.isArray(unwrapped) ? unwrapped : Array.isArray(unwrapped?.results) ? unwrapped.results : [];
    },
  });

  const seriesList = useMemo(() => {
    return Array.isArray(allSeriesData) ? allSeriesData : [];
  }, [allSeriesData]);

  // Query: Active Ongoing Series
  const { data: activeOngoingSeriesData, refetch: refetchActiveOngoingSeries } = useQuery({
    queryKey: [isAdmin ? "admin-active-ongoing-series" : "writer-active-ongoing-series", role],
    queryFn: async () => {
      const res: any = await api.get(`${endpointPrefix}/active-series/`);
      const unwrapped = res?.data?.data !== undefined ? res.data.data : res?.data !== undefined ? res.data : res;
      if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped) && (unwrapped.id || unwrapped.slug)) {
        return unwrapped;
      }
      return null;
    },
  });

  const selectSeries = (s: any, targetView: "hub" | "canvas" = "hub") => {
    setActiveSeries(s);
    setSeriesTitle(s.title || "");
    setSeriesDek(s.dek || s.subtitle || "");
    setSeriesCategory(s.categorySlug || s.category?.slug || s.category?.id || "");
    const tagsVal = s.tags ? (Array.isArray(s.tags) ? s.tags.map((t: any) => t.name || t).join(", ") : s.tags) : "";
    setSeriesTags(tagsVal);
    setSeriesStatus(s.series_status || "ONGOING");
    setIsEditingSeriesMeta(false);
    setIsCreatingNewSeries(false);
    setViewMode(targetView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Query Chapters for Active Series
  const activeSeriesSlug = activeSeries?.slug || activeSeries?.id || null;
  const {
    data: chaptersData,
    isLoading: isLoadingChapters,
    refetch: refetchChapters,
  } = useQuery({
    queryKey: ["story-chapters", activeSeriesSlug, role],
    queryFn: async () => {
      if (!activeSeriesSlug) return [];
      const res: any = await api.get(`${endpointPrefix}/${activeSeriesSlug}/chapters/`);
      const unwrapped = res?.data?.data !== undefined ? res.data.data : res?.data !== undefined ? res.data : res;
      return Array.isArray(unwrapped) ? unwrapped : Array.isArray(unwrapped?.results) ? unwrapped.results : [];
    },
    enabled: !!activeSeriesSlug,
  });

  // Synchronize chapters data
  useEffect(() => {
    if (chaptersData && Array.isArray(chaptersData)) {
      setChapters(chaptersData);
      const safeIdx = activeChapterIndex < chaptersData.length ? activeChapterIndex : 0;
      if (chaptersData[safeIdx]) {
        setChapterTitleInput(chaptersData[safeIdx].title || "");
        setChapterContentInput(chaptersData[safeIdx].content || "");
        setHasUnsavedChapterChanges(false);
      }
    }
  }, [chaptersData]);

  // Aggregate Metrics for Active Series
  const totalChapterWords = useMemo(() => {
    return chapters.reduce((acc, c, idx) => {
      if (idx === activeChapterIndex && chapterContentInput) {
        return acc + calculateReadingStats(chapterContentInput).words;
      }
      return acc + (c.word_count || calculateReadingStats(c.content || "").words || 0);
    }, 0);
  }, [chapters, activeChapterIndex, chapterContentInput]);

  const totalSeriesWords = useMemo(() => {
    const dekWords = calculateReadingStats(seriesDek).words;
    return totalChapterWords + dekWords;
  }, [totalChapterWords, seriesDek]);

  const totalSeriesMinutes = useMemo(() => {
    if (totalSeriesWords === 0) return 1;
    return Math.max(1, Math.ceil(totalSeriesWords / 220));
  }, [totalSeriesWords]);

  const activeChapterStats = useMemo(() => {
    return calculateReadingStats(chapterContentInput);
  }, [chapterContentInput]);

  // Stats across entire portfolio
  const ongoingSeriesCount = useMemo(() => {
    return seriesList.filter((s: any) => s.series_status === "ONGOING" || s.series_status === "ongoing").length;
  }, [seriesList]);

  const completedSeriesCount = useMemo(() => {
    return seriesList.filter((s: any) => s.series_status === "COMPLETED" || s.series_status === "completed").length;
  }, [seriesList]);

  const totalPortfolioChapters = useMemo(() => {
    return seriesList.reduce((acc: number, s: any) => acc + (s.chapter_count || s.chapters?.length || 0), 0);
  }, [seriesList]);

  // Handler: Start New Series
  const handleOpenNewSeriesModal = () => {
    setActiveSeries(null);
    setSeriesTitle("");
    setSeriesDek("");
    setSeriesCategory("");
    setSeriesTags("");
    setSeriesStatus("ONGOING");
    setChapters([]);
    setIsCreatingNewSeries(true);
    setIsEditingSeriesMeta(true);
    setViewMode("hub");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler: Select Chapter to Edit
  const handleOpenChapterEditor = (idx: number) => {
    if (chapters[activeChapterIndex]) {
      setChapters((prev) => {
        const copy = [...prev];
        copy[activeChapterIndex] = {
          ...copy[activeChapterIndex],
          title: chapterTitleInput,
          content: chapterContentInput,
        };
        return copy;
      });
    }
    setActiveChapterIndex(idx);
    const target = chapters[idx];
    setChapterTitleInput(target?.title || "");
    setChapterContentInput(target?.content || "");
    setHasUnsavedChapterChanges(false);
    setViewMode("canvas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler: Save Series Metadata
  const handleSaveSeriesMeta = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!seriesTitle.trim() || seriesTitle.trim().length < 2) {
      toast.error("Series Title is required (at least 2 characters).");
      return;
    }
    if (!seriesDek.trim() || seriesDek.trim().length < 3) {
      toast.error("Series Premise / Synopsis is required.");
      return;
    }

    setIsSavingSeriesMeta(true);
    try {
      if (isCreatingNewSeries || !activeSeriesSlug) {
        // Create new multi-chapter story
        const res: any = await api.post(`${endpointPrefix}/`, {
          title: seriesTitle.trim(),
          dek: seriesDek.trim(),
          subtitle: seriesDek.trim(),
          content: "",
          is_multi_chapter: true,
          series_status: "ONGOING",
          status: isAdmin ? "PUBLISHED" : "DRAFT",
          category_slug: seriesCategory || undefined,
          tags: seriesTags ? seriesTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        });
        const created = res?.data?.data || res?.data || res;
        toast.success(`Series "${seriesTitle}" created! You can now add chapters.`);
        await Promise.all([refetchAllSeries(), refetchActiveOngoingSeries()]);
        selectSeries(created, "hub");
      } else {
        // Update existing series details
        const res: any = await api.patch(`${endpointPrefix}/${activeSeriesSlug}/`, {
          title: seriesTitle.trim(),
          dek: seriesDek.trim(),
          subtitle: seriesDek.trim(),
          category_slug: seriesCategory || undefined,
          tags: seriesTags ? seriesTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          estimated_reading_time: totalSeriesMinutes,
        });
        const updated = res?.data?.data || res?.data || res;
        toast.success("Series details updated.");
        await Promise.all([refetchAllSeries(), refetchActiveOngoingSeries()]);
        selectSeries(updated, "hub");
      }
    } catch (err: any) {
      toast.error("Could not save series details", {
        description: err.response?.data?.message || err.response?.data?.error || err.message,
      });
    } finally {
      setIsSavingSeriesMeta(false);
    }
  };

  // Handler: Toggle Series Status (Ongoing / Completed)
  const handleToggleSeriesStatus = async (newStatus: "ONGOING" | "COMPLETED", targetStory?: any) => {
    const slugToUpdate = targetStory ? targetStory.slug || targetStory.id : activeSeriesSlug;
    if (!slugToUpdate) return;
    setIsChangingSeriesStatus(true);
    try {
      await api.post(`${endpointPrefix}/${slugToUpdate}/series-status/`, {
        series_status: newStatus,
      });
      setSeriesStatus(newStatus);
      toast.success(
        newStatus === "COMPLETED"
          ? "Series marked as Completed! Narrative arc finalized."
          : "Series reopened as Ongoing."
      );
      await Promise.all([
        refetchAllSeries(),
        refetchActiveOngoingSeries(),
        queryClient.invalidateQueries({ queryKey: [isAdmin ? "admin-stories" : "writer-stories"] }),
      ]);
    } catch (err: any) {
      toast.error("Could not update series status", {
        description: err.response?.data?.message || err.response?.data?.error || err.message,
      });
    } finally {
      setIsChangingSeriesStatus(false);
    }
  };

  // Handler: Save Chapter (Draft or Submit/Publish)
  const handleSaveCurrentChapter = async (targetStatus?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED") => {
    if (!activeSeriesSlug) {
      toast.error("Please create or select a series first.");
      return;
    }

    const currentChapter = chapters[activeChapterIndex];
    const chapterId = currentChapter?.id;
    const finalTitle = chapterTitleInput.trim() || `Chapter ${activeChapterIndex + 1}`;
    const defaultPublishStatus = isAdmin ? "PUBLISHED" : "PENDING_REVIEW";
    const statusToApply = targetStatus || defaultPublishStatus;

    if (statusToApply !== "DRAFT") {
      if (!chapterContentInput.trim() || activeChapterStats.words < 20) {
        toast.error("Please write substantial chapter prose before submitting (at least 20 words).");
        return;
      }
    }

    setIsSavingChapter(true);
    try {
      if (chapterId) {
        // Update existing chapter
        const endpoint = `${endpointPrefix}/${activeSeriesSlug}/chapters/${chapterId}/`;
        await api.patch(endpoint, {
          title: finalTitle,
          content: chapterContentInput,
          status: statusToApply,
          order: activeChapterIndex + 1,
        });

        if (statusToApply === "PENDING_REVIEW" && !isAdmin) {
          try {
            await api.post(`${endpointPrefix}/${activeSeriesSlug}/chapters/${chapterId}/submit/`);
          } catch {
            // Already set status
          }
        }

        toast.success(
          statusToApply === "PUBLISHED"
            ? `"${finalTitle}" published live!`
            : statusToApply === "PENDING_REVIEW"
            ? `"${finalTitle}" submitted for editorial review!`
            : `"${finalTitle}" saved as draft.`
        );
      } else {
        // Create new chapter
        const endpoint = `${endpointPrefix}/${activeSeriesSlug}/chapters/`;
        await api.post(endpoint, {
          title: finalTitle,
          content: chapterContentInput,
          status: statusToApply,
          order: activeChapterIndex + 1,
        });

        toast.success(
          statusToApply === "PUBLISHED"
            ? `"${finalTitle}" created and published live!`
            : statusToApply === "PENDING_REVIEW"
            ? `"${finalTitle}" created and submitted for review!`
            : `"${finalTitle}" created as draft.`
        );
      }

      setHasUnsavedChapterChanges(false);
      await refetchChapters();
      await refetchAllSeries();
    } catch (err: any) {
      toast.error("Could not save chapter", {
        description: err.response?.data?.message || err.response?.data?.error || err.message,
      });
    } finally {
      setIsSavingChapter(false);
    }
  };

  // Handler: Add New Chapter
  const handleAddNewChapter = () => {
    if (!activeSeriesSlug) {
      handleOpenNewSeriesModal();
      return;
    }
    const newOrder = chapters.length + 1;
    const newChapterObj = {
      title: `Chapter ${newOrder}`,
      content: "",
      order: newOrder,
      status: "DRAFT",
      word_count: 0,
    };
    setChapters((prev) => [...prev, newChapterObj]);
    setActiveChapterIndex(chapters.length);
    setChapterTitleInput(`Chapter ${newOrder}`);
    setChapterContentInput("");
    setHasUnsavedChapterChanges(false);
    setViewMode("canvas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler: Delete Chapter
  const handleDeleteChapter = async (idx: number) => {
    const ch = chapters[idx];
    if (!window.confirm(`Are you sure you want to delete "${ch.title || `Chapter ${idx + 1}`}"?`)) {
      return;
    }
    if (ch.id && activeSeriesSlug) {
      try {
        await api.delete(`${endpointPrefix}/${activeSeriesSlug}/chapters/${ch.id}/`);
        toast.info("Chapter deleted.");
        await refetchChapters();
        await refetchAllSeries();
      } catch (err: any) {
        toast.error("Could not delete chapter", { description: err.message });
      }
    } else {
      setChapters((prev) => prev.filter((_, i) => i !== idx));
      if (activeChapterIndex >= idx) {
        setActiveChapterIndex(Math.max(0, activeChapterIndex - 1));
      }
    }
  };

  // Handler: Reorder Chapter Up/Down
  const handleReorderChapter = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;

    const newChapters = [...chapters];
    const temp = newChapters[idx];
    newChapters[idx] = newChapters[targetIdx];
    newChapters[targetIdx] = temp;

    setChapters(newChapters);
    if (activeChapterIndex === idx) {
      setActiveChapterIndex(targetIdx);
    } else if (activeChapterIndex === targetIdx) {
      setActiveChapterIndex(idx);
    }

    if (activeSeriesSlug && newChapters.every((c) => c.id)) {
      try {
        const orderedIds = newChapters.map((c) => c.id);
        await api.post(`${endpointPrefix}/${activeSeriesSlug}/chapters/reorder/`, {
          ordered_ids: orderedIds,
        });
        toast.success("Chapters reordered.");
        await refetchChapters();
      } catch (err: any) {
        toast.error("Could not save chapter order", { description: err.message });
      }
    }
  };

  // ===========================================================================
  // VIEW 1: CHAPTER PROSE CANVAS (Distraction-Free Writer)
  // ===========================================================================
  if (viewMode === "canvas") {
    const currentChapter = chapters[activeChapterIndex] || {};
    const chStatus = currentChapter.status || "DRAFT";

    return (
      <AppShell
        role={role}
        title={isAdmin ? "Admin Chapter Studio" : "Chapter Studio"}
        blurb={`Writing for series: "${seriesTitle || "Untitled Series"}"`}
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Top Clean Navigation & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface/90 p-4 shadow-sm backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghostOutline"
                size="sm"
                onClick={() => {
                  setViewMode("hub");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="size-3.5" /> Back to Chapter List
              </Button>

              <div className="h-4 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-heading">
                  Chapter {activeChapterIndex + 1} of {chapters.length}
                </span>
                <Badge
                  tone={
                    chStatus === "PUBLISHED"
                      ? "success"
                      : chStatus === "PENDING_REVIEW"
                      ? "warning"
                      : chStatus === "REJECTED"
                      ? "error"
                      : "neutral"
                  }
                  className="text-[0.625rem] px-2 py-0.5 font-bold"
                >
                  {chStatus === "PUBLISHED"
                    ? "Published Live"
                    : chStatus === "PENDING_REVIEW"
                    ? "In Review"
                    : chStatus === "REJECTED"
                    ? "Needs Revision"
                    : "Draft"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-subtle font-medium hidden md:inline">
                {activeChapterStats.words.toLocaleString()} words · ~{activeChapterStats.minutes}m read
              </span>

              <Button
                type="button"
                variant="ghostOutline"
                size="sm"
                disabled={isSavingChapter}
                onClick={() => handleSaveCurrentChapter("DRAFT")}
                className="gap-1.5 text-xs font-bold h-9 cursor-pointer"
              >
                <Save className="size-3.5" /> {isSavingChapter ? "Saving..." : "Save Draft"}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSavingChapter}
                onClick={() => handleSaveCurrentChapter(isAdmin ? "PUBLISHED" : "PENDING_REVIEW")}
                className="gap-1.5 text-xs font-bold h-9 shadow-xs cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                {isAdmin
                  ? chStatus === "PUBLISHED"
                    ? "Update Live"
                    : "Publish Chapter"
                  : chStatus === "PUBLISHED"
                  ? "Update Live"
                  : "Submit Chapter"}
              </Button>
            </div>
          </div>

          {/* Editorial Feedback Notice (if rejected) */}
          {chStatus === "REJECTED" && currentChapter.rejection_feedback && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4.5 shrink-0" />
                <strong className="text-xs font-bold text-destructive block">
                  Editorial Feedback for Chapter {activeChapterIndex + 1}:
                </strong>
              </div>
              <p className="text-xs text-body leading-relaxed pl-6.5">
                {currentChapter.rejection_feedback}
              </p>
            </div>
          )}

          {/* Pure Distraction-Free Prose Canvas */}
          <Panel className="p-6 sm:p-10 space-y-6 shadow-sm min-h-[600px] flex flex-col">
            {/* Chapter Title Input */}
            <div>
              <input
                type="text"
                value={chapterTitleInput}
                onChange={(e) => {
                  setChapterTitleInput(e.target.value);
                  setHasUnsavedChapterChanges(true);
                }}
                placeholder={`Chapter ${activeChapterIndex + 1}: Title…`}
                className="w-full bg-transparent font-display text-2xl sm:text-3xl font-bold text-heading placeholder:text-subtle/40 border-0 border-b border-border/60 pb-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Chapter Prose Textarea */}
            <div className="flex-1 flex flex-col min-h-[440px]">
              <textarea
                value={chapterContentInput}
                onChange={(e) => {
                  setChapterContentInput(e.target.value);
                  setHasUnsavedChapterChanges(true);
                }}
                placeholder="Write the prose content for this chapter. Separate paragraphs with a blank line…"
                className="w-full flex-1 font-serif text-[1.125rem] leading-relaxed text-body placeholder:text-subtle/40 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none min-h-[440px]"
              />
            </div>

            {/* Bottom Chapter Status Footer */}
            <div className="border-t border-border/70 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
              <div className="flex items-center gap-3">
                <span>{activeChapterStats.words.toLocaleString()} words</span>
                <span>·</span>
                <span>~{activeChapterStats.minutes} min read</span>
                {hasUnsavedChapterChanges && (
                  <span className="text-amber-500 font-medium">● Unsaved edits</span>
                )}
              </div>

              {/* Quick Next/Prev chapter nav */}
              <div className="flex items-center gap-2">
                {activeChapterIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenChapterEditor(activeChapterIndex - 1)}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    ← Previous Chapter
                  </button>
                )}
                {activeChapterIndex < chapters.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleOpenChapterEditor(activeChapterIndex + 1)}
                    className="font-bold text-primary hover:underline cursor-pointer ml-3"
                  >
                    Next Chapter →
                  </button>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  // ===========================================================================
  // VIEW 2: SERIES CHAPTER ROADMAP & MANAGEMENT (Detail View for Selected Series)
  // ===========================================================================
  if (viewMode === "hub" && (activeSeries || isCreatingNewSeries)) {
    return (
      <AppShell
        role={role}
        title={isAdmin ? "Admin Series Studio" : "Series & Chapters Management"}
        blurb={`Managing chapters and narrative sequence for "${seriesTitle || "New Series"}"`}
      >
        <div className="space-y-6">
          {/* Back to All Series Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghostOutline"
              size="sm"
              onClick={() => {
                setViewMode("list");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="gap-2 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Back to All Series Portfolio
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddNewChapter}
                className="gap-1.5 text-xs font-bold h-9 shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" /> Write Chapter {chapters.length + 1}
              </Button>
            </div>
          </div>

          {/* Series Overview & Metadata Card */}
          <Panel className="p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-heading">
                    {seriesTitle || (isCreatingNewSeries ? "New Series Setup" : "Untitled Series")}
                  </h2>
                  <Badge
                    tone={seriesStatus === "COMPLETED" ? "neutral" : "success"}
                    className="text-[0.625rem] px-2 py-0.5 font-bold"
                  >
                    {seriesStatus === "COMPLETED" ? "Completed Series" : "Ongoing Series"}
                  </Badge>
                </div>
                {seriesDek && !isEditingSeriesMeta && (
                  <p className="mt-1.5 text-sm text-subtle italic max-w-3xl leading-relaxed">
                    "{seriesDek}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghostOutline"
                  size="sm"
                  onClick={() => setIsEditingSeriesMeta((v) => !v)}
                  className="gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Edit3 className="size-3.5" /> {isEditingSeriesMeta ? "Cancel Edit" : "Edit Series Details"}
                </Button>

                {activeSeriesSlug && (
                  <Button
                    type="button"
                    variant={seriesStatus === "COMPLETED" ? "soft" : "ghostOutline"}
                    size="sm"
                    disabled={isChangingSeriesStatus}
                    onClick={() =>
                      handleToggleSeriesStatus(seriesStatus === "COMPLETED" ? "ONGOING" : "COMPLETED")
                    }
                    className={cn(
                      "text-xs font-bold gap-1.5 cursor-pointer",
                      seriesStatus === "COMPLETED"
                        ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "text-amber-600 dark:text-amber-400 border-amber-500/30"
                    )}
                  >
                    {isChangingSeriesStatus ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : seriesStatus === "COMPLETED" ? (
                      <>
                        <RefreshCw className="size-3.5" /> Reopen Series
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" /> Mark as Completed
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Series Meta Edit Form */}
            {isEditingSeriesMeta ? (
              <form onSubmit={handleSaveSeriesMeta} className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Series Title *"
                    hint="Mandatory · Max 60 characters"
                  >
                    <Input
                      value={seriesTitle}
                      onChange={(e) => setSeriesTitle(e.target.value)}
                      maxLength={60}
                      required
                      placeholder="e.g. Chronicles of the Emerald Peak"
                      className="h-11 font-display font-bold text-sm"
                    />
                  </Field>

                  <Field
                    label="Category / Genre"
                    hint="Select narrative category"
                  >
                    <CustomSelect
                      value={seriesCategory || (categoriesList?.[0]?.slug ?? "")}
                      onChange={(val) => setSeriesCategory(val)}
                      options={
                        categoriesList.length === 0
                          ? [{ label: "General", value: "" }]
                          : categoriesList.map((c: any) => ({
                              label: c.name,
                              value: c.slug || c.id,
                            }))
                      }
                    />
                  </Field>
                </div>

                <Field
                  label="Series Synopsis / Premise *"
                  hint="Mandatory · Brief logline or overview"
                >
                  <Textarea
                    value={seriesDek}
                    onChange={(e) => setSeriesDek(e.target.value)}
                    required
                    rows={2}
                    placeholder="Four monsoons, one cloth-bound account book, and a secret that threatens to tear the valley apart…"
                    className="text-sm"
                  />
                </Field>

                <Field label="Tags" hint="Comma separated keywords">
                  <Input
                    value={seriesTags}
                    onChange={(e) => setSeriesTags(e.target.value)}
                    placeholder="fantasy, adventure, serialized"
                    className="h-10 text-xs"
                  />
                </Field>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="ghostOutline"
                    size="sm"
                    onClick={() => {
                      if (isCreatingNewSeries) {
                        setViewMode("list");
                      }
                      setIsEditingSeriesMeta(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSavingSeriesMeta}
                    className="gap-1.5 font-bold cursor-pointer"
                  >
                    <Save className="size-3.5" />
                    {isSavingSeriesMeta ? "Saving..." : isCreatingNewSeries ? "Create Series" : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3 pt-1">
                <div className="rounded-2xl border border-border/70 bg-surface-alt/40 p-4 space-y-1">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-subtle">
                    Series Progress
                  </p>
                  <p className="text-base font-bold text-heading flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        seriesStatus === "COMPLETED" ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                      )}
                    />
                    {seriesStatus === "COMPLETED" ? "Concluded (Finished)" : "Active (Ongoing)"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-surface-alt/40 p-4 space-y-1">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-subtle">
                    Total Chapters & Words
                  </p>
                  <p className="text-base font-bold text-heading">
                    {chapters.length} Chapters · {totalSeriesWords.toLocaleString()} Words
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-surface-alt/40 p-4 space-y-1">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-subtle">
                    Total Series Reading Time
                  </p>
                  <p className="text-base font-bold text-heading">
                    ~{totalSeriesMinutes} Minutes Read
                  </p>
                </div>
              </div>
            )}
          </Panel>

          {/* Chapter Roadmap Section */}
          <Panel className="p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-heading flex items-center gap-2">
                  <Layers className="size-5 text-primary" /> Chapter Sequence & Roadmap ({chapters.length})
                </h3>
                <p className="text-xs text-subtle mt-0.5">
                  Ordered sequentially. Reorder chapters, edit prose, and track individual review statuses.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddNewChapter}
                className="gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" /> Add Chapter
              </Button>
            </div>

            {/* Chapter Roadmap Cards */}
            {chapters.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border/80 bg-surface-alt/20 space-y-3">
                <BookOpen className="size-10 text-primary/40 mx-auto" />
                <h4 className="font-display font-bold text-base text-heading">
                  No chapters added to this series yet
                </h4>
                <p className="text-xs text-subtle max-w-sm mx-auto">
                  Begin writing Chapter 1 to start serializing your narrative arc.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddNewChapter}
                  className="gap-1.5 font-bold mt-2 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Write Chapter 1
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((ch: any, idx: number) => {
                  const chStatus = ch.status || "DRAFT";
                  const wordsCount = ch.word_count || calculateReadingStats(ch.content || "").words || 0;
                  const readTime = Math.max(1, Math.ceil(wordsCount / 220));

                  return (
                    <div
                      key={ch.id || idx}
                      className="group rounded-2xl border border-border bg-surface p-4 sm:p-5 transition-all hover:border-primary/50 hover:shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono text-xs font-bold text-primary">
                            {idx + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-display font-bold text-sm sm:text-base text-heading truncate">
                                {ch.title || `Chapter ${idx + 1}`}
                              </h4>
                              <Badge
                                tone={
                                  chStatus === "PUBLISHED"
                                    ? "success"
                                    : chStatus === "PENDING_REVIEW"
                                    ? "warning"
                                    : chStatus === "REJECTED"
                                    ? "error"
                                    : "neutral"
                                }
                                className="text-[0.625rem] px-2 py-0.5 font-bold"
                              >
                                {chStatus === "PUBLISHED"
                                  ? "Published Live"
                                  : chStatus === "PENDING_REVIEW"
                                  ? "In Review"
                                  : chStatus === "REJECTED"
                                  ? "Needs Revision"
                                  : "Draft"}
                              </Badge>
                            </div>
                            <p className="text-xs text-subtle mt-0.5">
                              {wordsCount.toLocaleString()} words · ~{readTime}m read
                            </p>
                          </div>
                        </div>

                        {/* Chapter Actions */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenChapterEditor(idx)}
                            className="gap-1.5 text-xs font-bold h-8 cursor-pointer"
                          >
                            <PenLine className="size-3.5" /> Edit Prose
                          </Button>

                          {/* Reorder Buttons */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleReorderChapter(idx, "up")}
                            className="grid size-8 place-items-center rounded-xl border border-border text-subtle hover:text-heading hover:bg-surface-hover disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ChevronUp className="size-4" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === chapters.length - 1}
                            onClick={() => handleReorderChapter(idx, "down")}
                            className="grid size-8 place-items-center rounded-xl border border-border text-subtle hover:text-heading hover:bg-surface-hover disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ChevronDown className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(idx)}
                            className="grid size-8 place-items-center rounded-xl border border-border text-subtle hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                            title="Delete Chapter"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Editorial Feedback Notice */}
                      {chStatus === "REJECTED" && ch.rejection_feedback && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                          <span className="font-bold block">Editorial Feedback:</span>
                          <p className="text-body leading-relaxed">{ch.rejection_feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </AppShell>
    );
  }

  // ===========================================================================
  // VIEW 3: SERIES PORTFOLIO / LIST VIEW (Default Screen)
  // ===========================================================================
  return (
    <AppShell
      role={role}
      title={isAdmin ? "Admin Series Studio" : "My Series Portfolio"}
      blurb={isAdmin ? "Manage and publish serialized multi-chapter narratives as an editor." : "Longform work, told in parts. Select a series to manage chapters, or start a new narrative arc."}
    >
      <div className="space-y-6">
        {/* Top Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Series" value={String(seriesList.length)} hint="all serialized stories" />
          <StatCard label="Ongoing Series" value={String(ongoingSeriesCount)} hint="actively publishing" />
          <StatCard label="Completed Arc" value={String(completedSeriesCount)} hint="concluded stories" />
          <StatCard label="Total Chapters" value={String(totalPortfolioChapters)} hint="across all series" />
        </div>

        {/* Action Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-heading">
              {isAdmin ? "Editorial Series Portfolio" : "Authored Series & Books"}
            </h2>
            <p className="text-xs sm:text-sm text-subtle mt-1">
              Select any series below to write chapters, reorder episodes, or update narrative premises.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleOpenNewSeriesModal}
            className="gap-2 font-bold shadow-xs cursor-pointer"
          >
            <Plus className="size-4" /> Start New Series
          </Button>
        </div>

        {/* Series Portfolio Grid */}
        {isLoadingAllSeries ? (
          <div className="py-16 text-center text-sm text-subtle animate-pulse">
            Loading serialized stories…
          </div>
        ) : seriesList.length === 0 ? (
          <Panel className="p-8 sm:p-12 text-center space-y-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <Layers className="size-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-heading">
              No Serialized Stories Yet
            </h3>
            <p className="text-sm text-subtle max-w-md mx-auto leading-relaxed">
              Serialized stories allow you to write multi-part episodic narratives with sequential chapters, a Table of Contents, and chapter-by-chapter progression.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenNewSeriesModal}
              className="gap-2 font-bold mt-2 cursor-pointer"
            >
              <Plus className="size-4" /> Start Your First Series
            </Button>
          </Panel>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {seriesList.map((s: any) => {
              const isOngoing = s.series_status === "ONGOING" || s.series_status === "ongoing";
              const chapterCount = s.chapter_count || s.chapters?.length || 0;
              const wordCount = s.word_count || 0;
              const readTime = s.estimated_reading_time || s.reading_time || Math.max(1, Math.ceil(wordCount / 220));

              return (
                <div
                  key={s.id || s.slug}
                  className="group relative flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge
                        tone={isOngoing ? "success" : "neutral"}
                        className="font-bold text-xs gap-1.5 px-3 py-1"
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            isOngoing ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          )}
                        />
                        {isOngoing ? "Ongoing (Active)" : "Completed Series"}
                      </Badge>

                      <span className="font-sans text-xs font-bold text-subtle">
                        {s.category?.name || "General"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-display font-bold text-heading group-hover:text-primary transition-colors">
                        {s.title || "Untitled Series"}
                      </h3>
                      <p className="mt-2 text-sm text-body line-clamp-3 leading-relaxed">
                        {s.dek || s.subtitle || "No series synopsis provided."}
                      </p>
                    </div>

                    {/* Series Stats Bar */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-subtle pt-1 border-t border-border/60">
                      <span className="font-bold text-heading flex items-center gap-1">
                        <BookOpen className="size-3.5 text-primary" /> {chapterCount} {chapterCount === 1 ? "Chapter" : "Chapters"}
                      </span>
                      <span>·</span>
                      <span>{wordCount.toLocaleString()} words</span>
                      <span>·</span>
                      <span>~{readTime}m total read</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => selectSeries(s, "hub")}
                      className="gap-2 font-bold cursor-pointer"
                    >
                      <PenLine className="size-3.5" /> Manage & Write Chapters
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghostOutline"
                        size="sm"
                        onClick={() => {
                          selectSeries(s, "hub");
                          setIsEditingSeriesMeta(true);
                        }}
                        className="text-xs font-bold cursor-pointer"
                      >
                        <Edit3 className="size-3.5" /> Edit Info
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
