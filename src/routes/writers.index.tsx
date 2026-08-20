import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import {
  Avatar,
  ButtonLink,
  CategoryPill,
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

  const { data: apiWriters, isLoading } = useQuery({
    queryKey: ["public-writers", search],
    queryFn: async () => {
      const res = await api.get(`/public/writers/${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      return res.data?.results || res.data || [];
    },
  });

  const displayWriters = (apiWriters && Array.isArray(apiWriters))
    ? apiWriters.map((w: any) => ({
        slug: w.slug,
        name: w.name || w.user?.full_name || "Writer",
        initials: (w.name || w.user?.full_name || "W").substring(0, 2).toUpperCase(),
        handle: `@${w.slug}`,
        gender: w.gender || "OTHER",
        photo: w.profile_photo || "",
        verified: w.is_verified || false,
        role: w.bio ? w.bio.slice(0, 30) : "Storyteller",
        location: w.location || "tossatale",
        stories: w.total_stories || 0,
        followers: w.total_followers ? `${w.total_followers}` : "0",
        reads: w.total_reads ? `${w.total_reads}` : "0",
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
            Original voices writing about memory, places, speculative futures, love, and what matters.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search writers by name or bio…"
            aria-label="Search writers"
            className="sm:max-w-xs"
          />
          <p className="text-[0.875rem] text-subtle font-medium">
            {displayWriters.length} active writers
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-subtle font-medium">Loading writers...</div>
        ) : displayWriters.length === 0 ? (
          <Panel className="mt-8 p-12 text-center">
            <h3 className="font-display text-xl font-bold text-heading">No writers found</h3>
            <p className="mt-2 text-[0.875rem] text-subtle">
              {search ? `No writers match "${search}".` : "There are currently no registered writers in the community."}
            </p>
          </Panel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayWriters.map((w: any, i: number) => (
              <Reveal key={w.slug} delay={i * 60}>
                <Panel hover className="flex h-[250px] flex-col justify-between p-6">
                  <div>
                    <div className="flex items-start gap-4">
                      <Avatar initials={w.initials} gender={w.gender} src={w.photo} size="lg" />
                      <div className="min-w-0 flex-1">
                        <h2 className="flex items-center gap-2 text-[1.15rem] font-display font-bold text-heading truncate">
                          {w.name}
                          {w.verified && <VerifiedBadge />}
                        </h2>
                        <p className="text-[0.8125rem] text-subtle truncate">{w.handle}</p>
                        <p className="text-[0.75rem] text-subtle/80 truncate">{w.location}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <CategoryPill>{w.role}</CategoryPill>
                    </div>
                  </div>

                  <div>
                    <dl className="grid grid-cols-3 gap-2 border-t border-divider pt-4 text-center">
                      {[
                        ["Stories", String(w.stories)],
                        ["Followers", String(w.followers)],
                        ["Reads", String(w.reads)],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="font-display text-[1.1rem] font-bold text-heading">{value}</dt>
                          <dd className="text-[0.6875rem] tracking-[0.14em] text-subtle uppercase">
                            {label}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4">
                      <ButtonLink
                        to="/writers/$slug"
                        params={{ slug: w.slug }}
                        variant="soft"
                        size="sm"
                        className="w-full"
                      >
                        View profile
                      </ButtonLink>
                    </div>
                  </div>
                </Panel>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
