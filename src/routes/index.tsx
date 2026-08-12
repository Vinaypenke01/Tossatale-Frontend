import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  Mail,
  Play,
  Quote,
} from "lucide-react";
import { useState } from "react";

import heroArt from "@/assets/Hero_section_pic.jpeg";
import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import {
  Avatar,
  Button,
  ButtonLink,
  CategoryPill,
  Input,
  Panel,
  SectionHeading,
  VerifiedBadge,
} from "@/components/tossa/kit";
import {
  blogs,
  categories,
  collections,
  featuredStory,
  latestStories,
  trendingStories,
  videos,
  writerBySlug,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "tossatale — Stories worth slowing down for" },
      {
        name: "description",
        content:
          "A premium storytelling ecosystem: longform stories, serials, essays and short films from 3,120 writers. Read slowly, follow writers, build a library.",
      },
      { property: "og:title", content: "tossatale — Stories worth slowing down for" },
      {
        property: "og:description",
        content:
          "Longform stories, serials, essays and short films from a community of curious writers.",
      },
    ],
  }),
  component: Home,
});

function Hero() {
  return (
    <section className="relative overflow-hidden bg-heading">
      <div className="relative w-full min-h-[350px] lg:min-h-0">
        <img
          src={heroArt}
          alt="Illustrated river ghats at dusk with temples, boats and figures on the steps"
          width={1920}
          height={1080}
          className="w-full h-auto block min-h-[350px] object-cover lg:object-fill"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

        <div className="absolute inset-0 z-10 flex items-center">
          <div className="mx-auto w-full max-w-[1240px] px-5 py-6 sm:py-12 lg:px-8 lg:py-20">
            <div className="animate-fade-up max-w-3xl">
              <span className="font-sans text-[0.6875rem] sm:text-[0.75rem] font-extrabold tracking-[0.2em] text-white/90 uppercase">
                NEW STORIES. MORE OFTEN.
              </span>
              <h1 className="mt-2 sm:mt-4 text-[clamp(1.35rem,4.2vw,4.4rem)] leading-[1.08] text-white font-display font-bold">
                We are Storytellers,<br />Always.
              </h1>
              <p className="mt-2.5 sm:mt-4 max-w-xl text-[0.8125rem] sm:text-[1.05rem] leading-relaxed text-white/90 font-sans">
                We write. We share stories. We welcome yours. Let’s celebrate the stories that connect us all.
              </p>
              <div className="mt-4 sm:mt-8 flex items-center gap-3">
                <ButtonLink to="/stories" size="md" className="sm:h-12 sm:px-6 sm:text-base">
                  Read Stories
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedStory() {
  const featuredList = [featuredStory, latestStories[1]];

  return (
    <Reveal as="section" className="mx-auto max-w-[1240px] px-5 pt-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {featuredList.map((story) => {
          if (!story) return null;
          const writer = writerBySlug(story.writer);
          return (
            <Panel key={story.slug} className="grain overflow-hidden p-7 lg:p-9 border-primary/20 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
                    FEATURED STORY
                  </span>
                  <CategoryPill>{story.category}</CategoryPill>
                </div>

                <h2 className="mt-5 text-[clamp(1.5rem,2.5vw,2.1rem)] leading-[1.12] text-heading font-display font-bold">
                  {story.title}
                </h2>
                <p className="mt-3.5 line-clamp-3 text-[0.9375rem] leading-relaxed text-body">
                  {story.dek} Four monsoons, one cloth-bound account book, and everything a family refuses to say out loud across generations.
                </p>
              </div>

              <div>
                <div className="mt-6 flex items-center gap-3 border-t border-divider pt-4">
                  <Avatar initials={writer?.initials || "MR"} />
                  <div>
                    <p className="flex items-center gap-1.5 font-sans text-[0.875rem] font-bold text-heading">
                      {writer?.name} <VerifiedBadge />
                    </p>
                    <p className="text-[0.75rem] text-subtle">
                      {story.date} · {story.readingTime} min read
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <ButtonLink to="/stories/$slug" params={{ slug: story.slug }} size="md">
                    Read story <ArrowRight className="size-4" />
                  </ButtonLink>
                  <Button variant="ghostOutline" size="md">
                    <BookMarked className="size-4" /> Save for later
                  </Button>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </Reveal>
  );
}

function LatestStories() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-24 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Newly added"
          title="Latest stories"
          blurb="From quick reads to stories in chapters."
          action={{ label: "All stories", to: "/stories" }}
        />
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {latestStories.slice(1).map((story, i) => (
          <Reveal key={story.slug} delay={i * 70}>
            <StoryCard story={story} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Trending() {
  const displayTrending = trendingStories.slice(0, 6);

  return (
    <section className="mt-28 border-y border-border bg-surface-alt/70 py-20">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Reader Favorites"
            title="Trending Stories"
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayTrending.map((story, i) => (
            <Reveal key={story.slug} delay={i * 60}>
              <StoryCard story={story} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Collections() {
  const shelfTitles = [
    { title: "Quick Reads", blurb: "Short enough to finish. Good enough to remember.", cover: collections[0]?.cover, count: collections[0]?.count },
    { title: "Read at your pace", blurb: "No rush. No rules. Just stories waiting for you.", cover: collections[1]?.cover, count: collections[1]?.count },
    { title: "Late-Night Reads", blurb: "For nights when sleep can wait.", cover: collections[2]?.cover, count: collections[2]?.count },
  ];

  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-28 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Your kind of read"
          title="Featured collections"
          blurb="Stories that fit the moment."
        />
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {shelfTitles.map((c, i) => (
          <Reveal key={c.title} delay={i * 90}>
            <Panel hover className="group relative h-72 overflow-hidden">
              <img
                src={c.cover}
                alt={c.title}
                loading="lazy"
                width={1200}
                height={800}
                className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-primary-hover/45" />
              <div className="relative flex h-full flex-col justify-end p-7">
                <p className="text-[0.6875rem] font-black tracking-[0.2em] text-white/75 uppercase">
                  {c.count} stories
                </p>
                <h3 className="mt-2 text-[1.5rem] text-white font-display font-bold">{c.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-white/80">{c.blurb}</p>
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ReadingJourney() {
  const steps = [
    { n: "01", title: "Find a voice", blurb: "Follow writers, not algorithms. Your shelf stays yours." },
    { n: "02", title: "Read at your pace", blurb: "No rush. No rules. Just stories waiting for you." },
    { n: "03", title: "Keep what moved you", blurb: "Bookmarks, highlights and collections you actually revisit." },
    { n: "04", title: "Short enough to finish", blurb: "Good enough to remember." },
  ];
  return (
    <section className="mt-28 border-y border-border paper-gradient py-20">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Your reading journey"
            title="Built for people who finish things"
            align="center"
          />
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="relative">
                <span className="font-display text-[2.6rem] leading-none text-primary/25">{s.n}</span>
                <h3 className="mt-3 text-[1.2rem] font-display font-bold">{s.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-body">{s.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCarousel() {
  const row = [...categories, ...categories];
  return (
    <section className="mt-28 overflow-hidden border-y border-border bg-surface py-16">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Explore your way" title="Browse by category" align="center" />
        </Reveal>
      </div>
      <div className="mt-10 flex w-max animate-marquee gap-4 px-5 hover:[animation-play-state:paused]">
        {row.map((c, i) => (
          <Link
            key={`${c.slug}-${i}`}
            to="/categories"
            className="group flex w-64 shrink-0 flex-col rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift"
          >
            <span className="font-display text-[1.25rem] text-heading group-hover:text-primary-hover font-bold">
              {c.name}
            </span>
            <span className="mt-1 text-[0.875rem] text-body">{c.blurb}</span>
            <span className="mt-4 text-[0.75rem] tracking-[0.14em] text-subtle uppercase">
              {c.count} stories
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LatestBlogs() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-28 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="More to discover"
          title="FROM THE BLOG"
          action={{ label: "View all", to: "/blogs" }}
        />
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {blogs.slice(0, 4).map((b, i) => (
          <Reveal key={b.slug} delay={i * 70}>
            <Link to="/blogs" className="block h-full">
              <Panel hover className="flex h-full items-center gap-5 p-5">
                <img
                  src={b.cover}
                  alt=""
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="hidden h-28 w-36 shrink-0 rounded-xl object-cover sm:block"
                />
                <div>
                  <CategoryPill>{b.tag}</CategoryPill>
                  <h3 className="mt-3 text-[1.15rem] leading-snug font-display font-bold">{b.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[0.9375rem] text-body">{b.dek}</p>
                  <p className="mt-3 text-[0.8125rem] text-subtle">
                    {b.date} · {b.readingTime} min
                  </p>
                </div>
              </Panel>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function VideoLibrary() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-28 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Watch"
          title="Latest Short Films"
          blurb="From stories to screen."
          action={{ label: "View all", to: "/videos" }}
        />
      </Reveal>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((v, i) => (
          <Reveal key={v.slug} delay={i * 70}>
            <Link to="/videos" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-border shadow-paper">
                <img
                  src={v.cover}
                  alt={v.title}
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="aspect-video w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-primary-hover/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid size-14 place-items-center rounded-full bg-surface text-primary shadow-lift">
                    <Play className="size-5 translate-x-px fill-primary" />
                  </span>
                </span>
                <span className="absolute right-3 bottom-3 rounded-full bg-heading/80 px-2.5 py-0.5 text-[0.75rem] font-bold text-white backdrop-blur">
                  {v.duration}
                </span>
              </div>
              <p className="mt-4 text-[0.6875rem] font-black tracking-[0.16em] text-primary uppercase">
                {v.series}
              </p>
              <h3 className="mt-1.5 text-[1.0625rem] leading-snug font-display font-bold group-hover:text-primary-hover">
                {v.title}
              </h3>
              <p className="mt-1.5 text-[0.8125rem] text-subtle">{v.views} views</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section id="newsletter" className="mx-auto max-w-3xl px-5 pt-16 lg:px-8">
      <Reveal>
        <Panel className="grain relative overflow-hidden ink-gradient p-7 sm:p-9 text-center">
          <span className="pointer-events-none absolute -top-16 -left-10 size-48 animate-drift rounded-full bg-white/10 blur-2xl" />
          <span className="pointer-events-none absolute -right-10 -bottom-20 size-48 animate-drift rounded-full bg-white/10 blur-2xl" />
          <Quote className="mx-auto size-6 text-white/50" />
          <h2 className="mx-auto mt-4 max-w-xl text-[clamp(1.35rem,2.2vw,1.85rem)] leading-snug font-display font-bold text-white">
            Keep reading. Keep watching.
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-white/80">
            Get updates on new stories, short films, and upcoming releases.
          </p>
          <form
            className="mx-auto mt-6 flex max-w-sm flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="you@example.com"
              className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/60 focus:ring-white/25 text-[0.875rem]"
            />
            <Button variant="inkOnDark" size="sm" className="h-10 shrink-0">
              <Mail className="size-3.5" /> Subscribe
            </Button>
          </form>
          <p className="mt-3 text-[0.75rem] text-white/60">
            No spam, no partner offers. Unsubscribe in one click.
          </p>
        </Panel>
      </Reveal>
    </section>
  );
}

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <FeaturedStory />
      <LatestStories />
      <Trending />
      <Collections />
      <ReadingJourney />
      <CategoryCarousel />
      <LatestBlogs />
      <VideoLibrary />
      <Newsletter />
    </SiteLayout>
  );
}
