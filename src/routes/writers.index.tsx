import { createFileRoute } from "@tanstack/react-router";

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
import { writers } from "@/lib/data";

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
  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            The community
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Writers you'll want to follow
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            3,120 writers publish here. These are the voices readers return to most.
          </p>
          <div className="mt-8 max-w-sm">
            <Input placeholder="Search writers by name or beat…" aria-label="Search writers" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-16 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {writers.map((w, i) => (
          <Reveal key={w.slug} delay={i * 60}>
            <Panel hover className="flex h-[250px] flex-col justify-between p-6">
              <div>
                <div className="flex items-start gap-4">
                  <Avatar initials={w.initials} size="lg" />
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
                    ["Followers", w.followers],
                    ["Reads", w.reads],
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
    </SiteLayout>
  );
}
