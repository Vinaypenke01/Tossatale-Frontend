import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Layers,
  Mail,
  Play,
  Quote,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  defaultFeaturedWritersSettings,
  featuredStory,
  latestStories,
  platformStats,
  series,
  stories,
  trendingStories,
  videos,
  writerBySlug,
  writers,
} from "@/lib/data";

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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={heroArt}
          alt="Illustrated river ghats at dusk with temples, boats and figures on the steps"
          width={1920}
          height={1080}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-hover/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-hover/50 via-primary-hover/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-20 veil-gradient opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 pt-20 pb-32 lg:px-8 lg:pt-28">
        <div className="animate-fade-up max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-1.5 font-sans text-[0.75rem] font-bold tracking-wide text-white backdrop-blur">
            <Sparkles className="size-3.5" /> New series every Friday
          </span>
          <h1 className="mt-7 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] text-white font-display">
            Stories worth <em className="italic">slowing down</em> for.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.125rem] leading-relaxed text-white/85">
            tossatale is a reading house — longform memoir, quiet fiction, serialised journeys and
            short films, published by writers who refuse to hurry.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink to="/stories" size="lg">
              Start reading
            </ButtonLink>
            <ButtonLink to="/auth" variant="inkOnDark" size="lg">
              Become a Writer
            </ButtonLink>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6  pt-8 sm:grid-cols-4">
            {/* {platformStats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-[1.75rem] leading-none text-white">{s.value}</dt>
                <dd className="mt-1.5 text-[0.75rem] tracking-wide text-white/70 uppercase">
                  {s.label}
                </dd>
              </div>
            ))} */}
          </dl>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <span className="flex flex-col items-center gap-2 text-[0.6875rem] font-bold tracking-[0.24em] text-subtle uppercase">

          <ArrowDown className="size-4 animate-bounce text-primary" />
        </span>
      </div>
    </section>
  );
}

function FeaturedStory() {
  const featuredList = [featuredStory, latestStories[1]];

  return (
    <Reveal as="section" className="mx-auto max-w-[1240px] px-5 pt-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {featuredList.map((story, idx) => {
          if (!story) return null;
          const writer = writerBySlug(story.writer);
          return (
            <Panel key={story.slug} className="grain overflow-hidden p-7 lg:p-9 border-primary/20 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-sans text-[0.6875rem] font-black tracking-[0.16em] text-primary uppercase border border-primary/20">
                    <Sparkles className="size-3" /> {idx === 0 ? "Editor's Pick" : "Featured Spotlight"}
                  </span>
                  <CategoryPill>{story.category}</CategoryPill>
                  {story.series && (
                    <span className="inline-flex items-center gap-1 text-[0.75rem] text-subtle">
                      <Layers className="size-3" /> {story.series}
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-[clamp(1.5rem,2.5vw,2.1rem)] leading-[1.12] text-heading font-display font-bold">
                  {story.title}
                </h2>
                <p className="mt-3.5 line-clamp-3 text-[0.9375rem] leading-relaxed text-body">{story.dek}</p>
              </div>

              <div>
                <div className="mt-6 flex items-center gap-3 border-t border-divider pt-4">
                  <Avatar initials={writer?.initials || "TS"} />
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
    <section className="mx-auto max-w-[1240px] px-5 pt-28 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Fresh ink"
          title="Latest stories"
          blurb="Published this fortnight, still warm."
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
  return (
    <section className="mt-28 border-y border-border bg-surface-alt/70 py-20">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Read most this week"
            title="Trending on Tossatale"
            action={{ label: "See the chart", to: "/stories" }}
          />
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <StoryCard story={trendingStories[0]!} layout="horizontal" />
          </Reveal>
          <Reveal delay={120}>
            <Panel className="divide-y divide-divider p-3">
              {trendingStories.slice(1, 5).map((story, i) => (
                <div key={story.slug} className="flex items-center gap-1 py-1">
                  <span className="w-8 shrink-0 pl-2 font-display text-[1.35rem] text-primary/40">
                    {i + 2}
                  </span>
                  <StoryCard story={story} layout="compact" />
                </div>
              ))}
              <p className="flex items-center gap-2 px-4 py-4 text-[0.8125rem] text-subtle">
                <Flame className="size-3.5 text-warning" /> Updated hourly from reader finishes
              </p>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SeriesRail() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-28 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Chapter by chapter"
          title="Story series"
          blurb="Longform told in parts, with a new chapter on a schedule you can trust."
          action={{ label: "Browse series", to: "/series" }}
        />
      </Reveal>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {series.map((s, i) => {
          const writer = writerBySlug(s.writer);
          return (
            <Reveal key={s.slug} delay={i * 70}>
              <Link to="/series" className="block h-full">
                <Panel hover className="flex h-full flex-col p-6">
                  <div className="flex items-center justify-between gap-2 border-b border-divider pb-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-sans text-[0.6875rem] font-black tracking-wider text-primary uppercase border border-primary/20">
                      {s.parts} parts
                    </span>
                    <span className="text-[0.75rem] font-bold text-subtle">
                      {s.progress === 0 ? "Not started" : `${s.progress}%`}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col pt-4">
                    <h3 className="text-[1.25rem] leading-snug font-display font-bold text-heading">{s.title}</h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-body">{s.blurb}</p>
                    <p className="mt-4 text-[0.8125rem] font-medium text-subtle">{writer?.name}</p>
                    <div className="mt-5 mt-auto pt-4 border-t border-divider">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-700"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[0.75rem] text-subtle">
                        {s.progress === 0 ? "Not started" : `${s.progress}% through`}
                      </p>
                    </div>
                  </div>
                </Panel>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Collections() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-28 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Curated shelves"
          title="Featured collections"
          blurb="Assembled by our editors, the way you'd arrange a bookshelf."
        />
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={i * 90}>
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
                <h3 className="mt-2 text-[1.5rem] text-white">{c.title}</h3>
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
    { n: "02", title: "Read without noise", blurb: "No pop-ups, no autoplay. Just type on paper-white." },
    { n: "03", title: "Keep what moved you", blurb: "Bookmarks, highlights and collections you actually revisit." },
    { n: "04", title: "Finish the series", blurb: "We remember where you stopped, down to the paragraph." },
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
                <h3 className="mt-3 text-[1.2rem]">{s.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-body">{s.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedWriters() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const featuredWriters = defaultFeaturedWritersSettings.featuredSlugs
    .map((slug) => writerBySlug(slug))
    .filter(Boolean);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const cardWidth = 380;

    if (direction === "right") {
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    } else {
      if (scrollLeft <= 15) {
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (isPaused || featuredWriters.length === 0) return;
    const timer = setInterval(() => {
      handleScroll("right");
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, featuredWriters.length]);

  return (
    <section
      className="mx-auto max-w-[1240px] px-5 pt-28 lg:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
          <div>
            <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
              {defaultFeaturedWritersSettings.eyebrow}
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.5rem)] leading-tight text-heading font-display font-bold">
              {defaultFeaturedWritersSettings.title}
            </h2>
            <p className="mt-1 text-[0.9375rem] text-subtle max-w-xl">
              {defaultFeaturedWritersSettings.blurb}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[0.75rem] font-sans text-subtle font-medium bg-surface-alt px-2.5 py-1 rounded-full border border-border">
              <span className="size-2 rounded-full bg-primary animate-pulse" /> Auto-scrolling
            </span>
            <ButtonLink to="/writers" variant="ghostOutline" size="sm">
              All writers
            </ButtonLink>
            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous writer"
                className="grid size-9 place-items-center rounded-full border border-border bg-surface text-subtle transition-colors hover:border-primary hover:text-primary hover:bg-primary-light"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next writer"
                className="grid size-9 place-items-center rounded-full border border-border bg-surface text-subtle transition-colors hover:border-primary hover:text-primary hover:bg-primary-light"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <div
        ref={scrollRef}
        className="mt-8 flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
      >
        {featuredWriters.map((w, i) => (
          <div key={w!.slug} className="w-[300px] sm:w-[340px] shrink-0 snap-start">
            <Reveal delay={i * 60}>
              <Panel hover className="h-[240px] p-6 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <Avatar initials={w!.initials} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-[1.15rem] font-display font-bold text-heading truncate">
                      {w!.name}
                      {w!.verified && <VerifiedBadge />}
                    </h3>
                    <p className="mt-1 text-[0.8125rem] text-subtle truncate">
                      {w!.role}
                    </p>
                    <p className="text-[0.75rem] text-subtle/80 truncate">
                      {w!.location}
                    </p>
                  </div>
                </div>

                <div>
                  <dl className="grid grid-cols-3 gap-2 border-t border-divider pt-4 text-center">
                    {[
                      ["Stories", w!.stories],
                      ["Followers", w!.followers],
                      ["Reads", w!.reads],
                    ].map(([label, value]) => (
                      <div key={label as string}>
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
                      params={{ slug: w!.slug }}
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
          </div>
        ))}
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
          <SectionHeading eyebrow="Wander a little" title="Browse by category" align="center" />
        </Reveal>
      </div>
      <div className="mt-10 flex w-max animate-marquee gap-4 px-5 hover:[animation-play-state:paused]">
        {row.map((c, i) => (
          <Link
            key={`${c.slug}-${i}`}
            to="/categories"
            className="group flex w-64 shrink-0 flex-col rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift"
          >
            <span className="font-display text-[1.25rem] text-heading group-hover:text-primary-hover">
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
          eyebrow="From the journal"
          title="Notes on craft & community"
          action={{ label: "Read the journal", to: "/blogs" }}
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
                  <h3 className="mt-3 text-[1.15rem] leading-snug">{b.title}</h3>
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
          title="The video library"
          blurb="Short films and writer conversations, shot the way we write."
          action={{ label: "All videos", to: "/videos" }}
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
              <h3 className="mt-1.5 text-[1.0625rem] leading-snug group-hover:text-primary-hover">
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
    <section className="mx-auto max-w-3xl px-5 pt-16 lg:px-8">
      <Reveal>
        <Panel className="grain relative overflow-hidden ink-gradient p-7 sm:p-9 text-center">
          <span className="pointer-events-none absolute -top-16 -left-10 size-48 animate-drift rounded-full bg-white/10 blur-2xl" />
          <span className="pointer-events-none absolute -right-10 -bottom-20 size-48 animate-drift rounded-full bg-white/10 blur-2xl" />
          <Quote className="mx-auto size-6 text-white/50" />
          <h2 className="mx-auto mt-4 max-w-xl text-[clamp(1.35rem,2.2vw,1.85rem)] leading-snug font-display font-bold text-white">
            One story, every Friday. Nothing else.
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-white/80">
            Our editors pick a single story worth your evening. 34,000 readers, zero noise.
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
      <SeriesRail />
      <Collections />
      <ReadingJourney />
      <FeaturedWriters />
      <CategoryCarousel />
      <LatestBlogs />
      <VideoLibrary />
      <Newsletter />

    </SiteLayout>
  );
}
