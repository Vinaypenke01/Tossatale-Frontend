import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/tossa/kit";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("tossatale_cookie_consent");
      if (consent) return;
    } catch {
      // localStorage may fail in restricted privacy mode
    }

    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChoice = (type: "all" | "rejected") => {
    try {
      localStorage.setItem(
        "tossatale_cookie_consent",
        JSON.stringify({ type, timestamp: new Date().toISOString() })
      );
    } catch {
      // ignore storage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500 px-4 sm:px-0">
      <div className="relative rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-lift backdrop-blur-md dark:bg-surface-alt/95 text-center">
        <button
          type="button"
          onClick={() => handleChoice("rejected")}
          className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-subtle transition-colors hover:bg-surface-hover hover:text-heading"
          aria-label="Dismiss cookie notice"
        >
          <X className="size-4" />
        </button>

        <div className="space-y-1.5 px-2">
          <h4 className="font-display text-[1rem] font-bold text-heading">
            We value your privacy
          </h4>
          <p className="text-[0.8125rem] leading-relaxed text-body text-center">
            We use cookies and similar technologies to enhance your browsing experience, analyze reading traffic, and personalize content. Learn more in our{" "}
            <Link to="/privacy" className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover">
              Privacy Policy
            </Link>.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-border/50">
          <Button
            size="sm"
            variant="ghostOutline"
            onClick={() => handleChoice("rejected")}
            className="text-[0.78125rem]"
          >
            No, thanks.
          </Button>
          <Button
            size="sm"
            onClick={() => handleChoice("all")}
            className="text-[0.78125rem]"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}

