import React, { useEffect } from "react";
import { X, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { api } from "@/lib/api";

interface LikeAuthModalProps {
  isOpen: boolean;
  storyId?: string;
  storyTitle?: string;
  onClose: () => void;
  onLikeSuccess?: (newCount?: number) => void;
}

export function LikeAuthModal({
  isOpen,
  storyId,
  storyTitle = "this story",
  onClose,
  onLikeSuccess,
}: LikeAuthModalProps) {
  const { googleLogin } = useAuth();

  const handleDismiss = () => {
    if (storyId) {
      api.post(`/public/stories/${storyId}/like-dismiss/`, {}).catch(() => {});
    }
    onClose();
  };

  const executePostLoginLike = async () => {
    if (!storyId) return;
    try {
      const likeRes = await api.post(`/public/stories/${storyId}/like/`, {});
      const count = likeRes.data?.likes_count;
      toast.success("Story Liked!", {
        description: `Added "${storyTitle}" to your liked stories collection.`,
      });
      if (onLikeSuccess) {
        onLikeSuccess(count);
      }
    } catch (err: any) {
      toast.error("Could not register like", {
        description: err.message || "Please try liking again.",
      });
    }
  };

  // Initialize Google Sign-In button inside the modal
  useEffect(() => {
    if (!isOpen) return;

    const initGoogle = () => {
      import("@/lib/googleAuth").then(({ setupGoogleAuth, renderGoogleButton }) => {
        const ready = setupGoogleAuth(async (response: { credential?: string }) => {
          if (!response.credential) {
            toast.error("Google authentication failed.");
            return;
          }
          try {
            const res = await googleLogin(response.credential);
            const userObj = res.data?.user;
            toast.success("Welcome!", {
              description: `Signed in as ${userObj?.first_name || userObj?.email || "Reader"}.`,
            });
            await executePostLoginLike();
            onClose();
          } catch (err: any) {
            toast.error("Google Sign-In Failed", {
              description: err.message || "Could not complete authentication.",
            });
          }
        });

        if (ready) {
          const btnDiv = document.getElementById("google-modal-btn-container");
          if (btnDiv) {
            renderGoogleButton(btnDiv, {
              theme: "outline",
              size: "large",
              width: 320,
              text: "continue_with",
              shape: "pill",
            });
          }
        }
      });
    };

    const timer = setTimeout(initGoogle, 150);
    return () => clearTimeout(timer);
  }, [isOpen, storyId]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/80 bg-surface p-7 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-alt hover:text-heading transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Floating Heart Icon */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-paper mb-5">
          <Heart className="size-8 fill-destructive" />
        </div>

        {/* Heading & Subtitle */}
        <h3 className="font-display text-2xl font-bold text-heading tracking-tight">
          Sign in to like this story
        </h3>
        <p className="mt-2 text-xs text-subtle leading-relaxed">
          Sign in to appreciate <span className="font-semibold text-heading">"{storyTitle}"</span> and save it to your personal reading bookmarks.
        </p>

        {/* Google OAuth 1-Click Button */}
        <div className="mt-7 flex flex-col items-center justify-center">
          <div id="google-modal-btn-container" className="min-h-[44px] flex items-center justify-center" />
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-subtle font-medium">
            <Sparkles className="size-3 text-primary" />
            <span>Instant reader access — no password needed</span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-[0.6875rem] text-subtle/70">
          By signing in, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
