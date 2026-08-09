import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { CategoryPill, Panel } from "@/components/tossa/kit";
import { blogs } from "@/lib/data";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "The Journal — tossatale" },
      {
        name: "description",
        content:
          "Notes on craft, community and how tossatale works: editorial standards, reader research and paying writers properly.",
      },
      { property: "og:title", content: "The Journal — tossatale" },
      { property: "og:description", content: "Notes on craft, community and how tossatale works." },
    ],
  }),
  component: BlogsPage,
});

function BlogsPage() {
  const [lead, ...rest] = blogs;
  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            The journal
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            How we make this, out loud
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Craft notes, editorial decisions, reader research and the occasional argument about
            semicolons.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        <Reveal>
          <Panel hover className="grid overflow-hidden lg:grid-cols-2">
            <img
              src={lead!.cover}
              alt={lead!.title}
              loading="lazy"
              width={1200}
              height={800}
              className="size-full min-h-72 object-cover"
            />
            <div className="p-8 lg:p-12">
              <CategoryPill>{lead!.tag}</CategoryPill>
              <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">{lead!.title}</h2>
              <p className="mt-4 text-[1.0625rem] text-body">{lead!.dek}</p>
              <p className="mt-6 text-[0.8125rem] text-subtle">
                {lead!.date} · {lead!.readingTime} min read
              </p>
            </div>
          </Panel>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {rest.map((b, i) => (
            <Reveal key={b.slug} delay={i * 70}>
              <Panel hover className="h-full overflow-hidden">
                <img
                  src={b.cover}
                  alt={b.title}
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="p-6">
                  <CategoryPill>{b.tag}</CategoryPill>
                  <h3 className="mt-3 text-[1.2rem] leading-snug">{b.title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-body">{b.dek}</p>
                  <p className="mt-4 text-[0.8125rem] text-subtle">
                    {b.date} · {b.readingTime} min
                  </p>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
