import React, { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
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
              width: 280,
              text: "continue_with",
              shape: "pill",
            });
          }
        }
      });
    };

    const timer = setTimeout(initGoogle, 50);
    return () => clearTimeout(timer);
  }, [isOpen, storyId]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 grid size-7 place-items-center rounded-full text-subtle hover:bg-surface-alt hover:text-heading transition-colors"
        >
          <X className="size-4" />
        </button>

        <h3 className="font-display text-lg font-bold text-heading pt-2 pb-5">
          Please sign in
        </h3>

        {/* Sign In Options */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div id="google-modal-btn-container" className="min-h-[44px] flex items-center justify-center w-full" />
          <Link
            to="/auth"
            onClick={onClose}
            className="w-full rounded-full border border-border bg-surface-alt px-4 py-2.5 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition-colors inline-block"
          >
            Sign in with email
          </Link>
        </div>
      </div>
    </div>
  );
}
