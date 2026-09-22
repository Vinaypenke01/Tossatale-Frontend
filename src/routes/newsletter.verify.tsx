import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, BookOpen, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { ButtonLink, Panel } from "@/components/tossa/kit";
import { api } from "@/lib/api";

interface NewsletterVerifySearch {
  token?: string;
}

export const Route = createFileRoute("/newsletter/verify")({
  validateSearch: (search: Record<string, unknown>): NewsletterVerifySearch => {
    return {
      token: typeof search["token"] === "string" ? search["token"] : "",
    };
  },
  head: () => ({
    meta: [
      { title: "Confirming Newsletter Subscription — tossatale" },
      {
        name: "description",
        content: "Confirm your email subscription to receive stories, essays, and short films from tossatale.",
      },
      { property: "og:title", content: "Newsletter Verification — tossatale" },
    ],
  }),
  component: NewsletterVerifyPage,
});

function NewsletterVerifyPage() {
  const { token } = useSearch({ from: "/newsletter/verify" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["newsletter-verify", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("No verification token found in the URL. Please check your verification link.");
      }
      const res = await api.get(`/public/newsletter/verify/?token=${encodeURIComponent(token)}`);
      return res.data;
    },
    retry: false,
    staleTime: Infinity,
    enabled: Boolean(token),
  });

  return (
    <SiteLayout>
      <div className="relative min-h-[75vh] flex items-center justify-center px-5 py-16 lg:px-8">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 w-full max-w-lg">
          <Reveal>
            <Panel className="p-8 sm:p-10 text-center shadow-lift border border-border">
              {!token ? (
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive mb-5">
                    <AlertCircle className="size-8" />
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-heading">
                    Invalid Verification Link
                  </h1>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-body">
                    We couldn't find a verification token in this link. Please ensure you clicked the complete link sent to your email.
                  </p>
                  <div className="mt-8">
                    <ButtonLink to="/" variant="primary">
                      Return to Home
                    </ButtonLink>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="py-6">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary mb-5">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-heading">
                    Verifying Your Subscription...
                  </h1>
                  <p className="mt-3 text-sm text-body">
                    Connecting to Tossatale to activate your email updates. Just a moment!
                  </p>
                </div>
              ) : isError ? (
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive mb-5">
                    <AlertCircle className="size-8" />
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-heading">
                    Verification Issue
                  </h1>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-body">
                    {(error as any)?.message ||
                      (error as any)?.response?.data?.message ||
                      "This verification link may have expired or was already used."}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <ButtonLink to="/" variant="ghostOutline">
                      Back to Home
                    </ButtonLink>
                    <ButtonLink to="/contact" variant="primary">
                      Contact Support
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 mb-5">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                    <Sparkles className="size-3.5" />
                    <span>Subscription Activated</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-heading">
                    You're on the list!
                  </h1>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-body">
                    {data?.message ||
                      "Thank you for confirming. You’ll now receive handpicked short stories, essays, and short film updates directly in your inbox."}
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <Link
                      to="/stories"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-sans text-[0.875rem] font-bold text-white shadow-paper hover:bg-primary-hover transition-colors"
                    >
                      <BookOpen className="size-4" />
                      <span>Read Stories</span>
                    </Link>
                    <Link
                      to="/videos"
                      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 font-sans text-[0.875rem] font-bold text-heading hover:border-primary hover:text-primary transition-colors"
                    >
                      <Film className="size-4" />
                      <span>Watch Films</span>
                    </Link>
                  </div>
                </div>
              )}
            </Panel>
          </Reveal>
        </div>
      </div>
    </SiteLayout>
  );
}
