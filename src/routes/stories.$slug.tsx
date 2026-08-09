import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Clock,
  Heart,
  Layers,
  Link2,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";
import { useState } from "react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal, useScrollProgress } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import {
  Avatar,
  Button,
  ButtonLink,
  CategoryPill,
  Panel,
  Tag,
  VerifiedBadge,
} from "@/components/tossa/kit";
import { stories, storyBySlug, writerBySlug } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stories/$slug")({
  loader: ({ params }) => {
    const story = storyBySlug(params.slug);
    if (!story) throw notFound();
    return { story };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Story not found — tossatale" }, { name: "robots", content: "noindex" }],
      };
    }
    const { story } = loaderData;
    return {
      meta: [
        { title: `${story.title} — tossatale` },
        { name: "description", content: story.dek },
        { property: "og:title", content: `${story.title} — tossatale` },
        { property: "og:description", content: story.dek },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: StoryNotFound,
  component: StoryDetail,
});

function StoryNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-4xl">This story has moved</h1>
        <p className="mt-4 text-body">
          The piece you're looking for isn't here. It may have been unpublished by its writer.
        </p>
        <div className="mt-8">
          <ButtonLink to="/stories">Browse the library</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  );
}

function FloatingShare() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="sticky top-32 hidden flex-col items-center gap-2 lg:flex">
      <span className="mb-1 text-[0.625rem] font-black tracking-[0.18em] text-subtle uppercase">
        Share
      </span>
      {[
        { icon: Twitter, label: "Share on X" },
        { icon: Share2, label: "Share" },
        {
          icon: Link2,
          label: "Copy link",
          onClick: () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          },
        },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          onClick={item.onClick}
          className="grid size-11 place-items-center rounded-full border border-border bg-surface text-subtle shadow-paper transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
        >
          <item.icon className="size-4" />
        </button>
      ))}
      {copied && <span className="text-[0.6875rem] text-primary">Copied</span>}
    </div>
  );
}

function StoryDetail() {
  const { story } = Route.useLoaderData();
  const writer = writerBySlug(story.writer)!;
  const progress = useScrollProgress();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(Boolean(story.bookmarked));
  const related = stories.filter((s) => s.slug !== story.slug).slice(0, 3);
  const next = stories.find((s) => s.slug !== story.slug && s.series === story.series) ?? related[0]!;

  return (
    <SiteLayout>
      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article>
        <header className="border-b border-border paper-gradient">
          <div className="mx-auto max-w-[820px] px-5 pt-16 pb-12">
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-subtle">
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
              <span className="px-2">/</span>
              <Link to="/stories" className="hover:text-primary">
                Stories
              </Link>
              <span className="px-2">/</span>
              <span className="text-body">{story.category}</span>
            </nav>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <CategoryPill>{story.category}</CategoryPill>
              {story.series && (
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-primary">
                  <Layers className="size-3.5" /> {story.series} · {story.part}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.05]">{story.title}</h1>
            <p className="mt-5 font-display text-[1.25rem] leading-relaxed text-body italic">
              {story.dek}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4 border-t border-divider pt-6">
              <Avatar initials={writer.initials} size="lg" />
              <div className="mr-auto">
                <p className="flex items-center gap-1.5 font-sans text-[1rem] font-bold text-heading">
                  {writer.name}
                  {writer.verified && <VerifiedBadge />}
                </p>
                <p className="text-[0.8125rem] text-subtle">
                  {story.date} · {story.readingTime} min read · finish by{" "}
                  {story.readingTime > 12 ? "two cups of tea" : "one cup of tea"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghostOutline"
                  size="sm"
                  aria-pressed={liked}
                  onClick={() => setLiked((v) => !v)}
                >
                  <Heart className={cn("size-4", liked && "animate-pop fill-destructive text-destructive")} />
                  {story.likes}
                </Button>
                <Button
                  variant="ghostOutline"
                  size="sm"
                  aria-pressed={saved}
                  onClick={() => setSaved((v) => !v)}
                >
                  <Bookmark className={cn("size-4", saved && "animate-pop fill-primary text-primary")} />
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1100px] gap-10 px-5 pt-12 lg:grid-cols-[72px_1fr]">
          <FloatingShare />
          <div className="max-w-[680px]">
            <div className="prose-reading">
              {story.body.map((block: string, i: number) => {
                if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
                if (block.startsWith("> ")) return <blockquote key={i}>{block.slice(2)}</blockquote>;
                return (
                  <p key={i} className={i === 0 ? "drop-cap" : undefined}>
                    {block}
                  </p>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {story.tags.map((t: string) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>

            <Panel className="mt-14 p-7">
              <div className="flex flex-wrap items-start gap-5">
                <Avatar initials={writer.initials} size="xl" />
                <div className="min-w-56 flex-1">
                  <p className="text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
                    About the writer
                  </p>
                  <h3 className="mt-2 flex items-center gap-2 text-[1.35rem]">
                    {writer.name}
                    {writer.verified && <VerifiedBadge label />}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">{writer.bio}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <ButtonLink to="/writers/$slug" params={{ slug: writer.slug }} size="sm">
                      View profile
                    </ButtonLink>
                    <Button variant="ghostOutline" size="sm">
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>

            {story.series && (
              <Panel className="mt-8 p-7">
                <p className="text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
                  In this series
                </p>
                <h3 className="mt-2 text-[1.25rem]">{story.series}</h3>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button variant="ghostOutline" size="md" className="flex-1">
                    Previous chapter
                  </Button>
                  <ButtonLink
                    to="/stories/$slug"
                    params={{ slug: next.slug }}
                    size="md"
                    className="flex-1"
                  >
                    Next chapter <ArrowRight className="size-4" />
                  </ButtonLink>
                </div>
              </Panel>
            )}

            <Panel className="mt-8 p-7">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 text-primary" />
                <h3 className="text-[1.15rem]">Responses (48)</h3>
              </div>
              <p className="mt-3 text-[0.9375rem] text-body">
                Readers are talking about this story. Sign in to join the conversation.
              </p>
              <div className="mt-5 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl bg-surface-alt p-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={i === 1 ? "SR" : "PD"} size="sm" />
                      <p className="font-sans text-[0.875rem] font-bold text-heading">
                        {i === 1 ? "Sana Rao" : "Pritam Das"}
                      </p>
                      <span className="text-[0.75rem] text-subtle">2d ago</span>
                    </div>
                    <p className="mt-3 text-[0.9375rem] text-body">
                      {i === 1
                        ? "The ledger detail undid me. I called my mother halfway through."
                        : "Read this twice. The second time slower, on the terrace."}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <ButtonLink to="/auth" variant="soft" size="sm">
                  Sign in to respond
                </ButtonLink>
              </div>
            </Panel>
          </div>
        </div>

        <section className="mx-auto max-w-[1240px] px-5 pt-24 lg:px-8">
          <Reveal>
            <Panel className="ink-gradient grain overflow-hidden p-8 lg:p-12">
              <p className="text-[0.6875rem] font-black tracking-[0.2em] text-white/70 uppercase">
                Read next
              </p>
              <h2 className="mt-3 max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-white">
                {next.title}
              </h2>
              <p className="mt-3 max-w-xl text-[1.0625rem] text-white/80">{next.dek}</p>
              <p className="mt-4 flex items-center gap-2 text-[0.8125rem] text-white/70">
                <Clock className="size-3.5" /> {next.readingTime} min
              </p>
              <div className="mt-7">
                <ButtonLink to="/stories/$slug" params={{ slug: next.slug }} variant="inkOnDark">
                  Continue reading <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </Panel>
          </Reveal>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 pt-24 lg:px-8">
          <h2 className="text-[clamp(1.6rem,2.8vw,2.2rem)]">Related stories</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((s, i) => (
              <Reveal key={s.slug} delay={i * 70}>
                <StoryCard story={s} />
              </Reveal>
            ))}
          </div>
        </section>
      </article>
    </SiteLayout>
  );
}
