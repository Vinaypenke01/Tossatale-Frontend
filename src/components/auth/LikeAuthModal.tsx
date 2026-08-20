import React, { useState, useEffect } from "react";
import { X, Heart, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { api } from "@/lib/api";
import { Button, Input } from "@/components/tossa/kit";
import { cn } from "@/lib/utils";

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
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    const googleClientId =
      (import.meta.env as Record<string, string>)["VITE_GOOGLE_CLIENT_ID"] ||
      "994213208335-fpqa9rm8h4pav9mcsaer73j2omr3quek.apps.googleusercontent.com";

    const initGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: { credential?: string }) => {
              if (!response.credential) {
                toast.error("Google authentication failed.");
                return;
              }
              setIsSubmitting(true);
              try {
                const res = await googleLogin(response.credential);
                const userObj = res.data?.user;
                toast.success("Welcome!", {
                  description: `Signed in as ${userObj?.email || "Reader"}.`,
                });
                await executePostLoginLike();
                onClose();
              } catch (err: any) {
                toast.error("Google Sign-In Failed", {
                  description: err.message || "Could not complete authentication.",
                });
              } finally {
                setIsSubmitting(false);
              }
            },
          });

          const btnDiv = document.getElementById("google-modal-btn-container");
          if (btnDiv) {
            btnDiv.innerHTML = "";
            (window as any).google.accounts.id.renderButton(btnDiv, {
              theme: "outline",
              size: "large",
              width: 300,
              text: "signin_with",
              shape: "pill",
            });
          }
        } catch (e) {
          console.warn("Google modal initialization deferred:", e);
        }
      }
    };

    const timer = setTimeout(initGoogle, 150);
    return () => clearTimeout(timer);
  }, [isOpen, storyId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please provide both email and password.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await login({ email, password });
      await executePostLoginLike();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
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

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-paper mb-4 animate-bounce duration-[2000ms]">
            <Heart className="size-7 fill-destructive" />
          </div>
          <h3 className="font-display text-xl font-bold text-heading">
            Sign in to like this story
          </h3>
          <p className="mt-1.5 text-xs text-subtle leading-relaxed max-w-xs">
            Join tossatale to appreciate <span className="font-semibold text-heading">"{storyTitle}"</span> and save it to your reading collection.
          </p>
        </div>

        {/* Google OAuth Quick Button */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <div id="google-modal-btn-container" className="min-h-[40px] flex items-center justify-center" />
          <p className="mt-1 text-[0.6875rem] text-subtle">
            Quick 1-click Reader sign-in
          </p>
        </div>

        <div className="my-4 flex items-center gap-3 text-subtle text-xs">
          <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
        </div>

        {/* Inline Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMsg && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-subtle" />
              <Input
                type="email"
                placeholder="reader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-subtle" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-9 text-xs font-bold gap-2 mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Signing In & Liking...
              </>
            ) : (
              "Sign In & Like Story"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-subtle hover:text-heading underline"
          >
            Not now, continue reading
          </button>
        </div>
      </div>
    </div>
  );
}
