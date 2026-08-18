import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Avatar, ButtonLink, Panel, SectionHeading } from "@/components/tossa/kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Get to know us — tossatale" },
      {
        name: "description",
        content:
          "tossatale began in 2020, during the pandemic, with a simple belief that we all have stories to tell, and so do you.",
      },
      { property: "og:title", content: "Get to know us — tossatale" },
      {
        property: "og:description",
        content: "tossatale began in 2020 with a simple belief that we all have stories to tell.",
      },
    ],
  }),
  component: AboutPage,
});

const principles = [
  {
    title: "The story comes first",
    blurb:
      "No endless feeds, no autoplay, no outrage loops. Just stories, one at a time.",
  },
  {
    title: "A platform for every writer",
    blurb: "Share your stories with readers who are looking for something new.",
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

const aboutStats = [
  { value: "30+", label: "Stories published" },
  { value: "10+", label: "Writers published" },
  { value: "10K+", label: "All Digital views" },
  { value: "84%", label: "Finish what they start" },
];

const teamMembers = [
  {
    name: "Vinay Penke",
    role: "Founder & Writer",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Get to know us
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            We built a reading house, not a feed.
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            tossatale began in 2020, during the pandemic, with a simple belief that we all have stories to tell, and so do you.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[820px] px-5 py-20">
        <Reveal>
          <div className="prose-reading space-y-6 text-[1.0625rem] leading-relaxed text-body">
            <p className="drop-cap">
              Back in 2020, when the pandemic hit our lives, everyone stayed at home, except for the medical related staff who worked tirelessly to save us. Life became a choice of happiness, and we learned not to worry too much. The gathering of family members after a long time helped many of us understand the core values of earlier generations.
            </p>
            <p>
              During that time, We began to see what connects us as individuals. It is the story hidden within each of us. For many years, we had forgotten to share our stories with others. That is where the idea of creating a platform like tossatale came from.
            </p>
            <p>
              We all have a little storyteller within us. We have a story to tell, just as you do - to inspire, to evoke emotions, to motivate, and to make us believe in what is yet to come. It started on 4th November 2020 as a website featuring more than 25 original short stories written by enthusiastic writers who shared a passion for storytelling. At the time, we did not have a clear vision of what we wanted to offer to our audience. Over time, we encountered many obstacles on our journey to build it into what it was meant to be. Proper guidance was certainly missing, along with consistency in developing content. But, at the end of the day, it has always been about storytelling—no matter what comes along.
            </p>
          </div>
        </Reveal>
      </div>

      <section className="border-y border-border paper-gradient py-20">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="What Guides Us" title="Four principles" align="center" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <Panel hover className="h-full p-8">
                  <span className="font-display text-[2rem] leading-none text-primary/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[1.3rem] font-bold">{p.title}</h3>
                  <p className="mt-3 text-[1rem] text-body">{p.blurb}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
        <dl className="grid gap-8 sm:grid-cols-4">
          {aboutStats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="font-display text-[2.4rem] font-bold leading-none text-primary">{s.value}</dt>
              <dd className="mt-2 text-[0.75rem] tracking-[0.16em] text-subtle uppercase">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-16 lg:px-8">
        <SectionHeading eyebrow="The people" title="Founder & Contributors" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((m) => (
            <Panel key={m.name} className="flex items-center gap-4 p-6">
              <Avatar useIcon size="lg" />
              <div>
                <h3 className="text-[1.1rem] font-bold text-heading">{m.name}</h3>
                <p className="text-[0.8125rem] text-subtle">{m.role}</p>
              </div>
            </Panel>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink to="/contact" size="md">
            Let's talk
          </ButtonLink>
          <ButtonLink to="/stories" variant="ghostOutline" size="md">
            Explore stories
          </ButtonLink>
        </div>
      </section>
    </SiteLayout>
  );
}
