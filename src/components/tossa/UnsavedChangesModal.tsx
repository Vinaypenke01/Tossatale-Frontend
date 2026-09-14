import { AlertTriangle, CheckCircle2, Loader2, Save, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/tossa/kit";

export interface UnsavedChangesModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  title?: string;
  badgeText?: string;
  description?: string;
  tipText?: string;
  saveButtonText?: string;
  onSaveAndLeave?: () => void;
  onStay: () => void;
  onDiscardAndLeave: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  isSaving = false,
  title = "Unsaved Changes Detected!",
  badgeText = "Changes Were Not Applied",
  description = "You have modified content on this page without saving or publishing your adjustments.",
  tipText = "Click \"Save & Continue\" below to save all your work before leaving!",
  saveButtonText = "Save & Continue",
  onSaveAndLeave,
  onStay,
  onDiscardAndLeave,
}: UnsavedChangesModalProps) {
  // Prevent background scroll and allow ESC key to stay
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onStay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onStay]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-dialog-title"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 transition-all duration-300"
      onClick={onStay}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/40 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-center transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Close Button */}
        <button
          type="button"
          onClick={onStay}
          aria-label="Stay on page"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Animated Warning Icon with Glowing Pulse Ring */}
        <div className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 text-amber-500 shadow-inner">
          <AlertTriangle className="size-8 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex size-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex size-3.5 rounded-full bg-amber-500"></span>
          </span>
        </div>

        {/* Modal Title */}
        <h3 id="unsaved-changes-dialog-title" className="font-display text-2xl font-bold text-heading">
          {title}
        </h3>

        {/* Badge Indicator */}
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 font-sans text-xs font-bold text-amber-700 dark:text-amber-400 shadow-xs">
          <Sparkles className="size-3" /> {badgeText}
        </div>

        {/* Description Box */}
        <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 p-4 sm:p-5 text-left border border-slate-200/80 dark:border-zinc-700/80">
          <p className="text-[0.875rem] leading-relaxed text-slate-800 dark:text-zinc-200">
            {description}
          </p>
          <p className="mt-2 text-[0.8125rem] text-slate-500 dark:text-zinc-400 leading-relaxed">
            If you navigate to another screen now, your recent input and edits will be discarded and won't be saved.
          </p>

          {onSaveAndLeave && (
            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 p-3 text-xs font-semibold text-[#FF6B35]">
              <Save className="size-4 shrink-0 mt-0.5" />
              <span>{tipText}</span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onDiscardAndLeave}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline py-2 px-1 text-center cursor-pointer transition-colors"
          >
            Discard changes & leave
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Button
              variant="quiet"
              onClick={onStay}
              className="w-full sm:w-auto cursor-pointer"
            >
              Stay on Page
            </Button>

            {onSaveAndLeave && (
              <Button
                variant="primary"
                onClick={onSaveAndLeave}
                disabled={isSaving}
                className="w-full sm:w-auto gap-2 bg-[#FF6B35] hover:bg-[#e85b27] text-white border-none shadow-sm cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> {saveButtonText}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
