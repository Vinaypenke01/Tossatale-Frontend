import React from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Layers,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge, Button, Field, Input, Panel } from "./kit";

export interface ChaptersWorkspaceProps {
  role?: "writer" | "admin";
  activeEditingSlug: string | null;
  // Series Metadata
  title: string;
  setTitle: (val: string) => void;
  dek: string;
  setDek: (val: string) => void;
  seriesStatus: "ONGOING" | "COMPLETED";
  isChangingSeriesStatus: boolean;
  showSeriesMeta: boolean;
  setShowSeriesMeta: React.Dispatch<React.SetStateAction<boolean>>;
  handleStartSeries: () => Promise<void>;
  handleToggleSeriesStatus: (newStatus: "ONGOING" | "COMPLETED") => Promise<void>;
  // Series Portfolio
  seriesSelectorOpen: boolean;
  setSeriesSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allSeriesData: any[];
  activeOngoingSeriesData: any;
  handleEditStory: (story: any) => Promise<void>;
  handleClearEditor: () => void;
  setIsMultiChapter: (val: boolean) => void;
  setActiveTab: (tab: "editor" | "chapters" | "library" | "drafts") => void;
  // Chapters State & Handlers
  chapters: any[];
  activeChapterIndex: number;
  chapterTitleInput: string;
  setChapterTitleInput: (val: string) => void;
  chapterContentInput: string;
  setChapterContentInput: (val: string) => void;
  isSavingChapter: boolean;
  handleSelectChapter: (idx: number) => void;
  handleSaveCurrentChapter: (targetStatus?: "DRAFT" | "PENDING_REVIEW") => Promise<void>;
  handleAddNewChapter: () => void;
  handleDeleteChapter: (idx: number) => Promise<void>;
  handleReorderChapter: (idx: number, direction: "up" | "down") => Promise<void>;
  // Feedback & Metrics
  rejectionFeedback?: string;
  rejectionReviews?: any[];
  totalChapterWords: number;
  totalSeriesWords: number;
  totalSeriesMinutes: number;
  isSubmitting?: boolean;
  // Sidebar slot
  publishingSidebar?: React.ReactNode;
}

export function ChaptersWorkspace({
  activeEditingSlug,
  title,
  setTitle,
  dek,
  setDek,
  seriesStatus,
  isChangingSeriesStatus,
  showSeriesMeta,
  setShowSeriesMeta,
  handleStartSeries,
  handleToggleSeriesStatus,
  seriesSelectorOpen,
  setSeriesSelectorOpen,
  allSeriesData,
  activeOngoingSeriesData,
  handleEditStory,
  handleClearEditor,
  setIsMultiChapter,
  setActiveTab,
  chapters,
  activeChapterIndex,
  chapterTitleInput,
  setChapterTitleInput,
  chapterContentInput,
  setChapterContentInput,
  isSavingChapter,
  handleSelectChapter,
  handleSaveCurrentChapter,
  handleAddNewChapter,
  handleDeleteChapter,
  handleReorderChapter,
  rejectionFeedback,
  rejectionReviews = [],
  totalChapterWords,
  totalSeriesWords,
  totalSeriesMinutes,
  isSubmitting = false,
  publishingSidebar,
}: ChaptersWorkspaceProps) {
  const activeChapterWordCount = chapterContentInput.trim().split(/\s+/).filter(Boolean).length;
  const activeChapterReadTime = Math.max(1, Math.ceil(activeChapterWordCount / 220));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main Content Area: Single Unified Studio Panel */}
      <div className="min-w-0">
        <Panel className="p-0 overflow-hidden flex flex-col min-h-[720px] shadow-sm">
          {/* Editorial Feedback Banner (if any) */}
          {(rejectionFeedback || rejectionReviews.length > 0) && (
            <div className="border-b border-destructive/30 bg-destructive/10 p-4 text-destructive space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4.5 shrink-0" />
                <strong className="text-xs font-bold text-destructive block">
                  Editorial Revisions Requested{" "}
                  {rejectionReviews.length > 1
                    ? `(Rejected ${rejectionReviews.length} times)`
                    : "(Series Needs Revision)"}
                </strong>
              </div>
              <p className="text-xs text-body leading-relaxed pl-6.5">
                {rejectionFeedback || rejectionReviews[0]?.feedback}
              </p>
            </div>
          )}

          {/* Series Overview / Setup Card */}
          <div className="border-b border-border bg-surface-alt/30 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                {/* Series Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSeriesSelectorOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs font-bold text-heading hover:border-primary/50 transition-all shadow-2xs cursor-pointer"
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        seriesStatus === "COMPLETED" ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                      )}
                    />
                    <span className="truncate max-w-[160px] sm:max-w-[240px]">
                      {title || "Untitled Series"}
                    </span>
                    <Badge
                      tone={seriesStatus === "COMPLETED" ? "neutral" : "success"}
                      className="text-[0.625rem] px-1.5 py-0 font-bold"
                    >
                      {seriesStatus === "COMPLETED" ? "Completed" : "Ongoing"}
                    </Badge>
                    <ChevronDown className="size-3.5 text-subtle" />
                  </button>

                  {/* Dropdown Menu */}
                  {seriesSelectorOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSeriesSelectorOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-1.5 w-76 rounded-2xl border border-border bg-surface p-2 shadow-xl z-50 space-y-1">
                        <div className="px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-subtle flex items-center justify-between">
                          <span>Your Series Portfolio</span>
                          <span>{allSeriesData?.length || 0} Total</span>
                        </div>

                        {/* List all series */}
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                          {allSeriesData && allSeriesData.length > 0 ? (
                            allSeriesData.map((s: any) => {
                              const isCurrent = activeEditingSlug === s.slug || activeEditingSlug === s.id;
                              const isOngoing = s.series_status === "ONGOING" || s.series_status === "ongoing";
                              return (
                                <button
                                  key={s.id || s.slug}
                                  type="button"
                                  onClick={() => {
                                    setSeriesSelectorOpen(false);
                                    handleEditStory(s);
                                  }}
                                  className={cn(
                                    "w-full text-left rounded-xl p-2 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer",
                                    isCurrent
                                      ? "bg-primary/10 text-primary font-bold"
                                      : "hover:bg-surface-hover text-heading"
                                  )}
                                >
                                  <div className="min-w-0 flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "size-2 rounded-full shrink-0",
                                        isOngoing ? "bg-emerald-500" : "bg-amber-500"
                                      )}
                                    />
                                    <span className="truncate">{s.title || "Untitled Series"}</span>
                                  </div>
                                  <span className="text-[0.625rem] text-subtle shrink-0">
                                    {isOngoing ? "🟢 Ongoing" : "🏁 Done"}
                                  </span>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-2 py-3 text-center text-xs text-subtle">
                              No serialized stories found
                            </div>
                          )}
                        </div>

                        <div className="border-t border-border pt-1.5 mt-1">
                          {activeOngoingSeriesData &&
                          activeOngoingSeriesData.slug !== activeEditingSlug &&
                          activeOngoingSeriesData.id !== activeEditingSlug ? (
                            <div className="px-2 py-1.5 text-[0.6875rem] text-subtle leading-tight bg-surface-alt/70 rounded-lg">
                              💡 Complete <strong>"{activeOngoingSeriesData.title}"</strong> before starting a new series.
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSeriesSelectorOpen(false);
                                if (seriesStatus === "ONGOING" && activeEditingSlug) {
                                  return;
                                }
                                handleClearEditor();
                                setIsMultiChapter(true);
                                setActiveTab("chapters");
                              }}
                              className="w-full text-left rounded-xl p-2 text-xs font-bold text-primary hover:bg-primary/10 flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Plus className="size-3.5" /> Start New Series
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <span className="text-xs text-subtle hidden md:inline">
                  · {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"} · {totalSeriesWords.toLocaleString()} words · ~{totalSeriesMinutes}m read
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSeriesMeta((v) => !v)}
                  className="inline-flex items-center gap-1 font-bold text-xs text-primary hover:underline cursor-pointer"
                >
                  <Edit3 className="size-3" /> {showSeriesMeta ? "Hide Info" : "Edit Info"}
                </button>
              </div>
            </div>

            {/* Series Details & Mandatory Fields */}
            {showSeriesMeta && (
              <div className="pt-2 border-t border-border/60 space-y-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field
                    label="Series Title *"
                    hint={<span className="text-xs text-destructive/80 font-medium">Mandatory · Max 60 characters</span>}
                  >
                    <Input
                      value={title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                      maxLength={60}
                      required
                      placeholder="e.g., The Map Beneath the Floorboards"
                      className="font-display font-bold text-sm h-11 bg-surface border-border focus:border-primary"
                    />
                  </Field>

                  <Field
                    label="Series Synopsis / Premise *"
                    hint={<span className="text-xs text-destructive/80 font-medium">Mandatory · Brief logline or overview</span>}
                  >
                    <Input
                      value={dek}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDek(e.target.value)}
                      required
                      placeholder="Four monsoons, one cloth-bound account book…"
                      className="text-xs h-11 bg-surface border-border focus:border-primary"
                    />
                  </Field>
                </div>

                {/* Action Buttons inside the Series Card, after Series Synopsis */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/50">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={isSubmitting || isChangingSeriesStatus}
                      onClick={handleStartSeries}
                      className="gap-1.5 text-xs font-bold h-9 px-4 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="size-3.5" />
                      {activeEditingSlug ? "Save Series Details" : "Start Series"}
                    </Button>

                    {activeEditingSlug && (
                      <Button
                        type="button"
                        variant={seriesStatus === "COMPLETED" ? "soft" : "ghostOutline"}
                        size="sm"
                        disabled={isChangingSeriesStatus}
                        onClick={() => handleToggleSeriesStatus(seriesStatus === "COMPLETED" ? "ONGOING" : "COMPLETED")}
                        className={cn(
                          "h-9 px-3.5 text-xs font-bold gap-1.5 transition-all cursor-pointer",
                          seriesStatus === "COMPLETED"
                            ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                            : "text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                        )}
                        title={
                          seriesStatus === "COMPLETED"
                            ? "Reopen this series to add more chapters"
                            : "Mark series as completed once the narrative arc is done"
                        }
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

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-subtle">Series Status:</span>
                    <Badge
                      tone={seriesStatus === "COMPLETED" ? "neutral" : "success"}
                      className="font-bold text-[0.6875rem] gap-1 px-2.5 py-0.5"
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          seriesStatus === "COMPLETED" ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                        )}
                      />
                      {seriesStatus === "COMPLETED" ? "Completed (Concluded)" : "Ongoing (Active)"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Integrated Chapter Studio (Outline + Prose Editor) */}
          <div className="grid lg:grid-cols-[280px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border flex-1">
            {/* Left: Chapter Outline */}
            <div className="bg-surface-alt/10 p-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <h4 className="font-sans font-bold text-heading text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" /> Chapters ({chapters.length})
                </h4>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddNewChapter}
                  className="gap-1 text-xs h-7 px-2.5"
                >
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>

              {/* Chapters Scrollable List */}
              <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-1 max-h-[500px]">
                {chapters.length === 0 ? (
                  <div className="py-12 text-center text-subtle border border-dashed border-border rounded-xl p-4">
                    <BookOpen className="size-7 mx-auto mb-2 text-subtle/60" />
                    <p className="text-xs font-semibold text-heading">No chapters yet</p>
                    <p className="text-[0.6875rem] text-subtle mt-1">
                      Click "Add" above to create Chapter 1.
                    </p>
                  </div>
                ) : (
                  chapters.map((ch, idx) => {
                    const isSelected = activeChapterIndex === idx;
                    const chStatus = ch.status || "DRAFT";
                    const wordCount =
                      idx === activeChapterIndex && chapterContentInput
                        ? chapterContentInput.trim().split(/\s+/).filter(Boolean).length
                        : ch.word_count || (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0);
                    const readTime = Math.max(1, Math.ceil(wordCount / 220));

                    return (
                      <div
                        key={ch.id || idx}
                        onClick={() => handleSelectChapter(idx)}
                        className={cn(
                          "group relative rounded-xl border p-2.5 transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                            : "border-border/60 bg-surface hover:border-border hover:bg-surface-hover"
                        )}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                "grid size-5.5 place-items-center rounded-md text-[0.6875rem] font-mono font-bold shrink-0",
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-surface-alt text-subtle group-hover:text-heading"
                              )}
                            >
                              {idx + 1}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-bold truncate",
                                isSelected ? "text-primary" : "text-heading"
                              )}
                            >
                              {idx === activeChapterIndex && chapterTitleInput
                                ? chapterTitleInput
                                : ch.title || `Chapter ${idx + 1}`}
                            </span>
                          </div>

                          {/* Reorder and Delete controls */}
                          <div className="flex items-center opacity-70 group-hover:opacity-100 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorderChapter(idx, "up");
                              }}
                              className="p-0.5 rounded hover:bg-surface-alt text-subtle disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="size-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === chapters.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorderChapter(idx, "down");
                              }}
                              className="p-0.5 rounded hover:bg-surface-alt text-subtle disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChapter(idx);
                              }}
                              className="p-0.5 rounded hover:bg-destructive/10 text-subtle hover:text-destructive cursor-pointer ml-0.5"
                              title="Delete Chapter"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-[0.6875rem] text-subtle pl-7.5">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0",
                                chStatus === "PUBLISHED"
                                  ? "bg-emerald-500"
                                  : chStatus === "PENDING_REVIEW"
                                  ? "bg-amber-500 animate-pulse"
                                  : chStatus === "REJECTED"
                                  ? "bg-rose-500"
                                  : "bg-zinc-400"
                              )}
                            />
                            <span>
                              {chStatus === "PUBLISHED"
                                ? "Published"
                                : chStatus === "PENDING_REVIEW"
                                ? "In Review"
                                : chStatus === "REJECTED"
                                ? "Rejected"
                                : "Draft"}
                            </span>
                          </span>
                          <span>{wordCount.toLocaleString()} words · ~{readTime}m</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Summary footer */}
              <div className="border-t border-border/70 pt-2.5 mt-auto text-[0.6875rem] text-subtle flex items-center justify-between">
                <span>
                  Total Chapters: <strong className="text-heading">{chapters.length}</strong>
                </span>
                <span>
                  Words: <strong className="text-heading">{totalChapterWords.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Right: Active Chapter Canvas */}
            <div className="p-6 lg:p-8 flex flex-col flex-1 bg-surface">
              {chapters.length === 0 ? (
                <div className="my-auto text-center py-16">
                  <Layers className="size-10 text-primary/40 mx-auto mb-3" />
                  <h3 className="font-display font-bold text-lg text-heading">Ready to write Chapter 1?</h3>
                  <p className="text-xs text-subtle mt-1 max-w-sm mx-auto">
                    Start serializing your story with numbered episodes, a Table of Contents, and chapter navigation.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleAddNewChapter}
                    className="mt-4 gap-1.5 text-xs"
                  >
                    <Plus className="size-3.5" /> Create Chapter 1
                  </Button>
                </div>
              ) : (
                (() => {
                  const currentActiveChapter = chapters[activeChapterIndex] || {};
                  const currentStatus = currentActiveChapter.status || "DRAFT";

                  return (
                    <div className="flex flex-col flex-1 space-y-4">
                      {/* Chapter Revision Notice (if rejected) */}
                      {currentStatus === "REJECTED" && currentActiveChapter.rejection_feedback && (
                        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-destructive flex items-start gap-2.5">
                          <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
                          <div className="space-y-1 text-xs">
                            <strong className="font-bold block">Editorial Feedback for this Chapter:</strong>
                            <p className="text-body leading-relaxed">{currentActiveChapter.rejection_feedback}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge tone="info" className="font-bold">
                            Chapter {activeChapterIndex + 1} of {chapters.length}
                          </Badge>
                          <Badge
                            tone={
                              currentStatus === "PUBLISHED"
                                ? "success"
                                : currentStatus === "PENDING_REVIEW"
                                ? "warning"
                                : currentStatus === "REJECTED"
                                ? "error"
                                : "neutral"
                            }
                            className="text-[0.6875rem] px-2 py-0.5 font-bold"
                          >
                            {currentStatus === "PUBLISHED"
                              ? "Published Live"
                              : currentStatus === "PENDING_REVIEW"
                              ? "Pending Review"
                              : currentStatus === "REJECTED"
                              ? "Needs Revisions"
                              : "Draft"}
                          </Badge>
                          <span className="text-xs text-subtle font-medium">
                            {activeChapterWordCount.toLocaleString()} words · ~{activeChapterReadTime}m read
                          </span>
                        </div>

                        {/* Chapter Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghostOutline"
                            size="sm"
                            disabled={isSavingChapter}
                            onClick={() => handleSaveCurrentChapter("DRAFT")}
                            className="gap-1.5 text-xs h-8 font-bold"
                          >
                            <Save className="size-3.5" /> {isSavingChapter ? "Saving..." : "Save Draft"}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isSavingChapter}
                            onClick={() => handleSaveCurrentChapter("PENDING_REVIEW")}
                            className="gap-1.5 text-xs h-8 font-bold shadow-xs"
                          >
                            <Sparkles className="size-3.5" /> {currentStatus === "PUBLISHED" ? "Update Published" : "Submit Chapter"}
                          </Button>
                        </div>
                      </div>

                      {/* Prominent Chapter Title Heading Input */}
                      <div>
                        <input
                          type="text"
                          value={chapterTitleInput}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChapterTitleInput(e.target.value)}
                          placeholder="Chapter Title (e.g. Chapter 1: The Gathering Storm)…"
                          className="w-full bg-transparent font-display text-xl sm:text-2xl font-bold text-heading placeholder:text-subtle/40 border-0 border-b border-border/60 pb-2 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      {/* Distraction-free Chapter Prose */}
                      <div className="flex-1 flex flex-col min-h-[380px]">
                        <textarea
                          value={chapterContentInput}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChapterContentInput(e.target.value)}
                          placeholder="Write the prose content for this chapter. Separate paragraphs with a blank line…"
                          className="w-full flex-1 font-serif text-[1.0625rem] leading-relaxed text-body placeholder:text-subtle/40 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none min-h-[380px]"
                        />
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Right Compact Sidebar Controls */}
      {publishingSidebar}
    </div>
  );
}
