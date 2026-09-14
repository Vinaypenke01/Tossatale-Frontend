import { X, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/tossa/kit";

interface WriterGoogleBlockModalProps {
  isOpen: boolean;
  email?: string;
  onClose: () => void;
  onSwitchToWriter: (email?: string) => void;
}

export function WriterGoogleBlockModal({
  isOpen,
  email,
  onClose,
  onSwitchToWriter,
}: WriterGoogleBlockModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-alt hover:text-heading transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20">
          <ShieldAlert className="size-7" />
        </div>

        <h3 className="font-display text-xl font-bold text-heading">
          Writer Account Detected
        </h3>

        {email && (
          <p className="mt-1 text-xs font-semibold text-primary font-mono">
            {email}
          </p>
        )}

        <div className="mt-4 rounded-2xl bg-surface-alt/70 p-4 text-left border border-border/60">
          <p className="text-[0.875rem] leading-relaxed text-body">
            For account safety and editorial verification, <strong>tossatale Writer accounts cannot sign in using Google</strong>.
          </p>
          <p className="mt-2 text-[0.8125rem] text-subtle">
            Please sign in directly using your registered email and Writer account password.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button
            variant="quiet"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onSwitchToWriter(email)}
            className="w-full sm:w-auto gap-2"
          >
            <KeyRound className="size-4" /> Sign In with Password
          </Button>
        </div>
      </div>
    </div>
  );
}
