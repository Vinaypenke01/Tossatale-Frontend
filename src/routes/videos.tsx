import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { CategoryPill, Panel } from "@/components/tossa/kit";
import { videos } from "@/lib/data";

export const Route = createFileRoute("/videos")({
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
  component: VideosPage,
});

function VideosPage() {
  const [feature, ...rest] = videos;
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
            Two strands: <em>Field Notes</em> — short documentaries from the places our stories come
            from — and <em>In the Room</em>, unhurried conversations with writers.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        <Reveal>
          <Panel className="overflow-hidden">
            <div className="relative">
              <img
                src={feature!.cover}
                alt={feature!.title}
                loading="lazy"
                width={1200}
                height={800}
                className="aspect-video w-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-primary-hover/25">
                <span className="grid size-20 place-items-center rounded-full bg-surface text-primary shadow-lift transition-transform hover:scale-105">
                  <Play className="size-7 translate-x-0.5 fill-primary" />
                </span>
              </span>
            </div>
            <div className="p-8">
              <CategoryPill>{feature!.series}</CategoryPill>
              <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.1rem)]">{feature!.title}</h2>
              <p className="mt-3 text-[0.9375rem] text-subtle">
                {feature!.duration} · {feature!.views} views
              </p>
            </div>
          </Panel>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((v, i) => (
            <Reveal key={v.slug} delay={i * 70}>
              <Panel hover className="group h-full overflow-hidden">
                <div className="relative">
                  <img
                    src={v.cover}
                    alt={v.title}
                    loading="lazy"
                    width={1200}
                    height={800}
                    className="aspect-video w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <span className="absolute right-3 bottom-3 rounded-full bg-heading/80 px-2.5 py-0.5 text-[0.75rem] font-bold text-white">
                    {v.duration}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-[0.6875rem] font-black tracking-[0.16em] text-primary uppercase">
                    {v.series}
                  </p>
                  <h3 className="mt-2 text-[1.1rem] leading-snug">{v.title}</h3>
                  <p className="mt-2 text-[0.8125rem] text-subtle">{v.views} views</p>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
