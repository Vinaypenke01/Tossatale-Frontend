import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Eye, Heart, Sparkles } from "lucide-react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { WritersGridSkeleton } from "@/components/tossa/Skeletons";
import { Pagination } from "@/components/tossa/Pagination";
import {
  Avatar,
  Input,
  Panel,
  VerifiedBadge,
} from "@/components/tossa/kit";
import { api } from "@/lib/api";

export const Route = createFileRoute("/writers/")({
  head: () => ({
    meta: [
      { title: "Writers — tossatale" },
      {
        name: "description",
        content:
          "Meet the writers publishing on tossatale: memoirists, reporters, poets and speculative novelists, with verified profiles and reading stats.",
      },
      { property: "og:title", content: "Writers — tossatale" },
      { property: "og:description", content: "Meet the writers publishing on tossatale." },
    ],
  }),
  component: WritersIndex,
});

function WritersIndex() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["public-writers", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("page_size", "12");
      const res = await api.get(`/public/writers/?${params.toString()}`);
      return res.data;
    },
  });

  const rawResults = apiResponse?.data?.results || apiResponse?.results || (Array.isArray(apiResponse?.data) ? apiResponse.data : (Array.isArray(apiResponse) ? apiResponse : []));
  const totalWritersCount = apiResponse?.data?.count ?? apiResponse?.count ?? (Array.isArray(apiResponse) ? apiResponse.length : 0);
  const totalPages = Math.ceil(totalWritersCount / 12) || 1;

  const displayWriters = (rawResults && Array.isArray(rawResults))
    ? rawResults.map((w: any) => ({
        slug: w.slug,
        name: w.name || w.user?.full_name || "Writer",
        initials: (w.name || w.user?.full_name || "W").substring(0, 2).toUpperCase(),
        handle: `@${w.slug}`,
        gender: w.gender || "OTHER",
        photo: w.profile_photo || "",
        verified: Boolean(w.is_verified),
        bio: w.bio || "Storyteller & writer on tossatale.",
        role: w.is_verified ? "Verified Storyteller" : "Storyteller",
        stories: w.total_stories || 0,
        followers: w.total_supports ?? w.total_likes ?? 0,
        reads: w.total_reads || 0,
      }))
    : [];

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            The community
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Meet our writers
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            The stories you read, the writers who create them. Get to know them beyond the page.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search writers by name or bio…"
            aria-label="Search writers"
            className="sm:max-w-xs"
          />
          <p className="text-[0.875rem] text-subtle font-medium">
            {totalWritersCount} active writer{totalWritersCount === 1 ? "" : "s"}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8">
            <WritersGridSkeleton count={6} />
          </div>
        ) : displayWriters.length === 0 ? (
          <Panel className="mt-8 p-12 text-center">
            <h3 className="font-display text-xl font-bold text-heading">No writers found</h3>
            <p className="mt-2 text-[0.875rem] text-subtle">
              {search ? `No writers match "${search}".` : "There are currently no registered writers in the community."}
            </p>
          </Panel>
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayWriters.map((w: any, i: number) => (
              <Reveal key={w.slug} delay={i * 50} className="h-full">
                <div className="group relative flex flex-col justify-between h-full rounded-3xl bg-surface border border-border/70 dark:border-zinc-800/80 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
                  {/* Decorative background hover glow */}
                  <div className="absolute -top-20 -right-20 size-44 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl pointer-events-none group-hover:bg-primary/15 transition-all duration-500" />

                  <div>
                    {/* Top Profile Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <Link to="/writers/$slug" params={{ slug: w.slug }} className="shrink-0 relative group/avatar">
                          <Avatar
                            initials={w.initials}
                            gender={w.gender}
                            src={w.photo}
                            size="lg"
                            className="ring-2 ring-border/80 dark:ring-zinc-700 group-hover/avatar:ring-primary/50 transition-all shadow-xs"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/writers/$slug"
                            params={{ slug: w.slug }}
                            className="group/name flex items-center gap-1.5 font-display text-[1.125rem] sm:text-[1.1875rem] font-bold text-heading truncate hover:text-primary transition-colors"
                          >
                            <span className="truncate">{w.name}</span>
                            {w.verified && <VerifiedBadge />}
                          </Link>
                          <p className="text-[0.8125rem] text-subtle font-medium truncate mt-0.5">{w.handle}</p>
                        </div>
                      </div>

                      {/* Status / Role Tag */}
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-sans text-[0.6875rem] font-bold tracking-wide">
                        {w.verified ? "Verified" : "Author"}
                      </span>
                    </div>

                    {/* Bio excerpt */}
                    <p className="mt-4 text-[0.875rem] text-body line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {w.bio}
                    </p>
                  </div>

                  {/* Bottom Section: Stats & Action */}
                  <div className="mt-6">
                    {/* Stats row with 3 clean pods */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-2 rounded-2xl bg-surface-alt/60 dark:bg-zinc-900/60 border border-border/40 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-display text-[1.0625rem] sm:text-[1.125rem] font-bold text-heading">
                          {w.stories}
                        </span>
                        <span className="text-[0.6875rem] font-semibold text-subtle flex items-center gap-1 mt-0.5">
                          <BookOpen className="size-3 text-emerald-500" /> Stories
                        </span>
                      </div>
                      <div className="flex flex-col items-center border-x border-border/40">
                        <span className="font-display text-[1.0625rem] sm:text-[1.125rem] font-bold text-heading">
                          {w.followers}
                        </span>
                        <span className="text-[0.6875rem] font-semibold text-subtle flex items-center gap-1 mt-0.5">
                          <Heart className="size-3 text-rose-500" /> Likes
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-display text-[1.0625rem] sm:text-[1.125rem] font-bold text-heading">
                          {w.reads}
                        </span>
                        <span className="text-[0.6875rem] font-semibold text-subtle flex items-center gap-1 mt-0.5">
                          <Eye className="size-3 text-blue-500" /> Reads
                        </span>
                      </div>
                    </div>

                    {/* View Profile Action Link */}
                    <div className="mt-3.5">
                      <Link
                        to="/writers/$slug"
                        params={{ slug: w.slug }}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-sans text-[0.875rem] font-bold transition-all duration-200 bg-surface border border-border hover:bg-primary hover:text-white hover:border-primary dark:bg-zinc-800/80 dark:border-zinc-700 dark:hover:bg-primary dark:hover:border-primary text-heading shadow-xs group/btn"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalWritersCount}
          pageSize={12}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 300, behavior: "smooth" });
          }}
        />
      </div>
    </SiteLayout>
  );
}
