import { createFileRoute } from "@tanstack/react-router";

import heroArt from "@/assets/Hero_section_pic.jpeg";
import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Avatar, ButtonLink, Panel, SectionHeading } from "@/components/tossa/kit";
import { platformStats, writers } from "@/lib/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About tossatale — a reading house for slow stories" },
      {
        name: "description",
        content:
          "tossatale is an independent storytelling house: no autoplay, no outrage, 70% of every membership to writers. Read why we built it this way.",
      },
      { property: "og:title", content: "About tossatale" },
      {
        property: "og:description",
        content: "An independent storytelling house built for readers who finish what they start.",
      },
    ],
  }),
  component: AboutPage,
});

const principles = [
  {
    title: "The story is the product",
    blurb:
      "No infinite feed, no autoplay, no outrage engine. One story at a time, given room to breathe.",
  },
  {
    title: "Writers get paid properly",
    blurb: "70% of every membership goes to the writers you actually read. The maths is published.",
  },
  {
    title: "Editors, not algorithms",
    blurb: "Every featured story was chosen by a person who read it twice and argued for it.",
  },
  {
    title: "Slow is a feature",
    blurb: "We publish less than we could. Fewer, better, finished — that's the whole strategy.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <header className="relative overflow-hidden border-b border-border">
        <img
          src={heroArt}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 size-full object-cover"
        />
        <span className="absolute inset-0 bg-primary-hover/45" />
        <div className="relative mx-auto max-w-[1240px] px-5 py-24 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-white/70 uppercase">
            About us
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.3rem,5vw,3.8rem)] leading-[1.04] text-white">
            We built a reading house, not a feed.
          </h1>
          <p className="mt-6 max-w-xl text-[1.125rem] leading-relaxed text-white/85">
            tossatale started in 2021 with nine writers, one shared document and a stubborn belief
            that people still want to read something long.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[820px] px-5 py-20">
        <Reveal>
          <div className="prose-reading">
            <p className="drop-cap">
              The internet got very good at giving people something to look at and very bad at giving
              them something to remember. We wanted the opposite problem: fewer things, held longer.
            </p>
            <p>
              So we made a place where the shortest piece is six minutes, where a writer can publish a
              chapter every fortnight for a year, and where the homepage is arranged by people rather
              than engagement scores.
            </p>
            <blockquote>
              Every life is a library. Most of it goes unwritten. We're here for the part that doesn't.
            </blockquote>
            <h2>Where we are now</h2>
            <p>
              Three thousand writers, a hundred thousand members, four editors and one very loud
              office kettle. We're independent, funded entirely by memberships, and profitable enough
              to stay that way.
            </p>
          </div>
        </Reveal>
      </div>

      <section className="border-y border-border paper-gradient py-20">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="What we hold to" title="Four principles" align="center" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <Panel hover className="h-full p-8">
                  <span className="font-display text-[2rem] leading-none text-primary/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[1.3rem]">{p.title}</h3>
                  <p className="mt-3 text-[1rem] text-body">{p.blurb}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
        <dl className="grid gap-8 sm:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="font-display text-[2.4rem] leading-none text-primary">{s.value}</dt>
              <dd className="mt-2 text-[0.75rem] tracking-[0.16em] text-subtle uppercase">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-8 lg:px-8">
        <SectionHeading eyebrow="The people" title="Editors & founding writers" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {writers.slice(0, 3).map((w) => (
            <Panel key={w.slug} className="flex items-center gap-4 p-6">
              <Avatar initials={w.initials} size="lg" />
              <div>
                <h3 className="text-[1.1rem]">{w.name}</h3>
                <p className="text-[0.8125rem] text-subtle">{w.role}</p>
              </div>
            </Panel>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink to="/contact" size="lg">
            Say hello
          </ButtonLink>
          <ButtonLink to="/stories" variant="ghostOutline" size="lg">
            Read something
          </ButtonLink>
        </div>
      </section>
    </SiteLayout>
  );
}
