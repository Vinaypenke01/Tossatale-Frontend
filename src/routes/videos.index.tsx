import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Pagination } from "@/components/tossa/Pagination";
import { CategoryPill, Panel } from "@/components/tossa/kit";
import { api } from "@/lib/api";
import { videos as mockVideos } from "@/lib/data";

export const Route = createFileRoute("/videos/")({
  head: () => ({
    meta: [
      { title: "Video library — tossatale" },
      {
        name: "description",
        content:
          "Short documentaries and writer conversations from tossatale — Field Notes and In the Room, shot the way we write.",
      },
      { property: "og:title", content: "Video library — tossatale" },
      { property: "og:description", content: "Short films and writer conversations from tossatale." },
    ],
  }),
  component: VideosIndexPage,
});

function youtubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function VideosIndexPage() {
  const [page, setPage] = useState(1);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["public-videos", page],
    queryFn: async () => {
      try {
        const res = await api.get(`/public/videos/?page=${page}&page_size=12`);
        return res.data?.data || res.data || {};
      } catch {
        return mockVideos;
      }
    },
  });

  const rawVideos = apiResponse?.results || (Array.isArray(apiResponse) ? apiResponse : mockVideos);
  const totalVideosCount = apiResponse?.count || rawVideos.length || 0;
  const totalPages = Math.ceil(totalVideosCount / 12);

  const displayVideos = (rawVideos && Array.isArray(rawVideos) && rawVideos.length > 0)
    ? rawVideos.map((v: any) => {
        const ytId = v.youtube_id || youtubeId(v.youtube_url || "") || "default";
        return {
          slug: v.slug,
          title: v.title,
          series: v.category?.name || v.series_name || "Documentary",
          duration: v.duration || "12:40",
          views: v.views_count ? `${v.views_count}` : "0",
          cover: v.cover || v.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          editorialNote: v.editorial_note || v.description || "",
        };
      })
    : [];

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Watch
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            The video library
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Short documentaries from the places our stories come from and unhurried conversations with writers.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        {isLoading ? (
          <div className="py-16 text-center text-subtle font-medium">Loading video library...</div>
        ) : displayVideos.length === 0 ? (
          <Panel className="p-12 text-center">
            <h3 className="font-display text-xl font-bold text-heading">No videos in library</h3>
            <p className="mt-2 text-[0.875rem] text-subtle">
              There are currently no videos or documentaries published in the library.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayVideos.map((v: any, i: number) => (
              <Reveal key={v.slug} delay={i * 60} className="h-full">
                <Link to="/videos/$slug" params={{ slug: v.slug }} className="block h-full">
                  <Panel hover className="group h-full overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={v.cover}
                          alt={v.title}
                          loading="lazy"
                          width={1200}
                          height={800}
                          className="size-full object-cover opacity-90 transition-transform duration-[1200ms] group-hover:scale-105"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/25">
                          <span className="grid size-14 place-items-center rounded-full bg-white/90 shadow-md transition-transform group-hover:scale-110">
                            <Play className="size-6 text-primary fill-current translate-x-0.5" />
                          </span>
                        </span>
                      </div>

                      <div className="p-5">
                        <CategoryPill>{v.series}</CategoryPill>
                        <h3 className="mt-2.5 text-[1.125rem] leading-snug font-display font-bold text-heading line-clamp-2">
                          {v.title}
                        </h3>
                        {v.editorialNote && (
                          <p className="mt-1.5 text-[0.875rem] text-body line-clamp-2">
                            {v.editorialNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-border/40 text-[0.8125rem] text-subtle flex items-center justify-between">
                      <span>Watch film</span>
                      <span className="font-bold text-primary">Play &rarr;</span>
                    </div>
                  </Panel>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalVideosCount}
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
