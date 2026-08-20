import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/tossa/kit";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("tossatale_cookie_consent");
    if (consent) return;

    // Delay showing slightly for smooth entrance animation
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    localStorage.setItem("tossatale_cookie_consent", JSON.stringify({ type, timestamp: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500 px-4 sm:px-0">
      <div className="relative rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-lift backdrop-blur-md dark:bg-surface-alt/95">
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-subtle transition-colors hover:bg-surface-hover hover:text-heading"
          aria-label="Dismiss cookie notice"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Cookie className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-display text-[1rem] font-bold text-heading">We value your privacy 🍪</h4>
            <p className="text-[0.8125rem] leading-relaxed text-body">
              We use cookies and similar technologies to enhance your browsing experience, analyze reading traffic, and personalize content. Learn more in our{" "}
              <Link to="/privacy" className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/50">
          <Button
            size="sm"
            variant="ghostOutline"
            onClick={() => handleAccept("essential")}
            className="text-[0.78125rem]"
          >
            Essential Only
          </Button>
          <Button
            size="sm"
            onClick={() => handleAccept("all")}
            className="text-[0.78125rem]"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
