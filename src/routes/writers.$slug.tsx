import { createFileRoute, notFound } from "@tanstack/react-router";
import { Award, Heart, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import { StoryCardSkeleton } from "@/components/tossa/Skeletons";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { Avatar, Button, ButtonLink, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import coverLane from "@/assets/cover-lane.jpg";

export const Route = createFileRoute("/writers/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/public/writers/${params.slug}/`);
      if (res.data) {
        return { writer: res.data };
      }
    } catch {
      // Fallback if detail view throws
    }
    return { writer: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.writer) {
      return { meta: [{ title: "Writer not found — tossatale" }, { name: "robots", content: "noindex" }] };
    }
    const { writer } = loaderData;
    const name = writer.name || writer.user?.full_name || "Writer";
    const bio = writer.bio || "Storyteller profile on tossatale";
    return {
      meta: [
        { title: `${name} — tossatale` },
        { name: "description", content: bio },
        { property: "og:title", content: `${name} on tossatale` },
        { property: "og:description", content: bio },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-5 py-32 text-center">
        <h1 className="text-4xl font-display font-bold text-heading">No such writer</h1>
        <p className="mt-4 text-body">This profile is not available or has been removed.</p>
        <div className="mt-8">
          <ButtonLink to="/writers">All writers</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  ),
  component: WriterProfile,
});

function WriterProfile() {
  const loaderData = Route.useLoaderData();
  const writer = loaderData?.writer;

  const todayKey = new Date().toISOString().slice(0, 10);
  const localSupportKey = writer?.slug ? `tossatale_writer_support_${writer.slug}_${todayKey}` : null;

  const [supportCount, setSupportCount] = useState(
    Number(writer?.total_supports || writer?.total_likes || 0)
  );
  const [isSupporting, setIsSupporting] = useState(false);
  const [hasSupported, setHasSupported] = useState<boolean>(() => {
    if (writer?.has_supported_today) return true;
    if (typeof window !== "undefined" && localSupportKey) {
      return localStorage.getItem(localSupportKey) === "true";
    }
    return false;
  });

  // Query fresh support status from backend
  useQuery({
    queryKey: ["public-writer-support-status", writer?.slug],
    queryFn: async () => {
      if (!writer?.slug) return null;
      const res = await api.get(`/public/writers/${writer.slug}/support/`);
      const data = res.data?.data || res.data;
      if (typeof data?.supports_count === "number") {
        setSupportCount(data.supports_count);
      }
      if (data?.has_supported_today) {
        setHasSupported(true);
        if (localSupportKey) localStorage.setItem(localSupportKey, "true");
      }
      return data;
    },
    enabled: Boolean(writer?.slug),
  });

  const { data: publicStories, isLoading: isStoriesLoading } = useQuery({
    queryKey: ["public-writer-stories", writer?.slug],
    queryFn: async () => {
      if (!writer?.slug) return [];
      const res = await api.get(`/public/stories/?writer=${writer.slug}`);
      return res.data?.results || res.data || [];
    },
    enabled: Boolean(writer?.slug),
  });

  const handleSupportWriter = async () => {
    if (!writer?.slug || isSupporting) return;

    if (hasSupported) {
      toast.info(`You have already supported ${writer.name || "this writer"} today! ❤️`, {
        description: "You can show your appreciation again tomorrow.",
      });
      return;
    }

    setIsSupporting(true);

    try {
      const res = await api.post(`/public/writers/${writer.slug}/support/`);
      const respData = res.data?.data || res.data;
      const newCount = respData?.supports_count ?? respData?.total_supports;

      if (typeof newCount === "number") {
        setSupportCount(newCount);
      }

      setHasSupported(true);
      if (localSupportKey) {
        localStorage.setItem(localSupportKey, "true");
      }

      if (respData?.already_supported) {
        toast.info(res.data?.message || "You have already supported this writer today! ❤️", {
          description: "Thank you! You can support them again tomorrow.",
        });
      } else {
        toast.success(res.data?.message || `You supported ${writer.name || "this writer"}! ❤️`, {
          description: "Your appreciation has been sent directly to this storyteller.",
        });
      }
    } catch (err: any) {
      toast.error("Could not send support", {
        description: err.message || "Please try again shortly.",
      });
    } finally {
      setIsSupporting(false);
    }
  };

  if (!writer) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-5 py-32 text-center">
          <h1 className="text-4xl font-display font-bold text-heading">No such writer</h1>
          <p className="mt-4 text-body">This profile is not available or has been removed.</p>
          <div className="mt-8">
            <ButtonLink to="/writers">All writers</ButtonLink>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const name = writer.name || writer.user?.full_name || "Writer";
  const initials = name.substring(0, 2).toUpperCase();
  const publishedStories = (publicStories && Array.isArray(publicStories)) ? publicStories : [];

  return (
    <SiteLayout>
      <header className="relative overflow-hidden border-b border-border ink-gradient grain">
        <span className="pointer-events-none absolute -top-20 left-1/4 size-72 animate-drift rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1240px] px-5 py-10 lg:py-12 lg:px-8">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar initials={initials} size="lg" className="ring-2 ring-white/25 shadow-lg" />
            <div className="mr-auto">
              <h1 className="flex flex-wrap items-center gap-2.5 text-[clamp(1.6rem,3vw,2.2rem)] font-display font-bold text-white">
                {name}
                {writer.is_verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 font-sans text-[0.75rem] font-bold text-white backdrop-blur">
                    <VerifiedBadge /> Verified writer
                  </span>
                )}
              </h1>
              <p className="mt-1 text-[0.875rem] text-white/75">
                @{writer.slug} · {writer.tagline || "Storyteller"}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-white/65">
                <MapPin className="size-3.5" /> {writer.location || "India"} · {writer.author_title || "tossatale author"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="inkOnDark"
                onClick={handleSupportWriter}
                disabled={isSupporting}
                title={hasSupported ? "You've supported this writer today (resets tomorrow)" : "Support this storyteller"}
                className={cn(
                  "gap-2 px-4 py-2 text-xs transition-all duration-300 font-bold",
                  hasSupported && "bg-rose-500 text-white border-rose-400 hover:bg-rose-600 scale-105"
                )}
              >
                <Heart className={cn("size-3.5 transition-transform", hasSupported ? "fill-white text-white scale-125" : "fill-current text-white")} />
                <span>{hasSupported ? "Supported!" : "Support Writer"}</span>
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[0.7rem]">
                  {supportCount}
                </span>
              </Button>
            </div>
          </div>

          {writer.bio && (
            <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-white/85">
              {writer.bio}
            </p>
          )}

          <dl className="mt-6 flex flex-wrap items-center gap-8 border-t border-white/15 pt-4 text-left">
            {[
              ["Stories", String(writer.total_stories || publishedStories.length)],
              ["Supporters", String(supportCount)],
              ["Total reads", String(writer.total_reads || 0)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-display text-[1.25rem] leading-none font-bold text-white">{value}</dt>
                <dd className="mt-1 text-[0.6875rem] tracking-[0.14em] text-white/65 uppercase">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
        <div>
          <h2 className="text-[1.5rem] font-display font-bold text-heading">Published stories</h2>
          {isStoriesLoading ? (
            <div className="mt-6 space-y-4">
              {[1, 2].map((idx) => (
                <StoryCardSkeleton key={idx} />
              ))}
            </div>
          ) : publishedStories.length === 0 ? (
            <div className="mt-6">
              <EmptySectionFallback
                icon="write"
                title="No Stories Published Yet"
                description="This writer has not published any public stories yet."
              />
            </div>
          ) : (
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface shadow-xs">
              {publishedStories.map((s: any) => (
                <div key={s.slug} className="p-5 sm:p-6 transition-colors hover:bg-surface-hover/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-subtle mb-1.5">
                      <span className="font-bold text-primary">{s.category?.name || "Story"}</span>
                      <span>·</span>
                      <span>{s.estimated_reading_time || 5} min read</span>
                      <span>·</span>
                      <span>{s.published_at ? new Date(s.published_at).toLocaleDateString() : "Recent"}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-heading leading-snug">
                      {s.title}
                    </h3>
                    {(s.subtitle || s.dek) && (
                      <p className="mt-1 text-sm text-body line-clamp-2">
                        {s.subtitle || s.dek}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 pt-2 sm:pt-0">
                    <ButtonLink
                      to="/stories/$slug"
                      params={{ slug: s.slug }}
                      variant="ghostOutline"
                      size="sm"
                      className="text-xs font-bold text-primary hover:bg-primary hover:text-white"
                    >
                      Read here →
                    </ButtonLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
