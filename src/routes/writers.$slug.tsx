import { createFileRoute, notFound } from "@tanstack/react-router";
import { Award, MapPin } from "lucide-react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { StoryCard } from "@/components/tossa/StoryCard";
import { Avatar, Button, ButtonLink, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { series, stories, writerBySlug } from "@/lib/data";

export const Route = createFileRoute("/writers/$slug")({
  loader: ({ params }) => {
    const writer = writerBySlug(params.slug);
    if (!writer) throw notFound();
    return { writer };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Writer not found — tossatale" }, { name: "robots", content: "noindex" }] };
    }
    const { writer } = loaderData;
    return {
      meta: [
        { title: `${writer.name} — tossatale` },
        { name: "description", content: writer.bio },
        { property: "og:title", content: `${writer.name} on tossatale` },
        { property: "og:description", content: writer.bio },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-5 py-32 text-center">
        <h1 className="text-4xl">No such writer</h1>
        <p className="mt-4 text-body">This profile isn't available.</p>
        <div className="mt-8">
          <ButtonLink to="/writers">All writers</ButtonLink>
        </div>
      </div>
    </SiteLayout>
  ),
  component: WriterProfile,
});

function WriterProfile() {
  const { writer } = Route.useLoaderData();
  const published = stories.filter((s) => s.writer === writer.slug);
  const theirSeries = series.filter((s) => s.writer === writer.slug);

  return (
    <SiteLayout>
      <header className="relative overflow-hidden border-b border-border ink-gradient grain">
        <span className="pointer-events-none absolute -top-20 left-1/4 size-72 animate-drift rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
          <div className="flex flex-wrap items-end gap-7">
            <Avatar initials={writer.initials} size="xl" className="ring-4 ring-white/25" />
            <div className="mr-auto">
              <h1 className="flex flex-wrap items-center gap-3 text-[clamp(2rem,4vw,3rem)] text-white">
                {writer.name}
                {writer.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-sans text-[0.75rem] font-bold text-white backdrop-blur">
                    <VerifiedBadge /> Verified writer
                  </span>
                )}
              </h1>
              <p className="mt-2 text-[1rem] text-white/75">
                {writer.handle} · {writer.role}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.875rem] text-white/65">
                <MapPin className="size-3.5" /> {writer.location} · joined {writer.joined}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="inkOnDark">Follow</Button>
              <Button variant="inkOnDark">Message</Button>
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85">
            {writer.bio}
          </p>

          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/20 pt-7 sm:grid-cols-4">
            {[
              ["Stories", String(writer.stories)],
              ["Followers", writer.followers],
              ["Total reads", writer.reads],
              ["Series", String(theirSeries.length)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-display text-[1.7rem] leading-none text-white">{value}</dt>
                <dd className="mt-1.5 text-[0.6875rem] tracking-[0.16em] text-white/65 uppercase">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[1fr_320px] lg:px-8">
        <div>
          <h2 className="text-[1.7rem]">Published stories</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {published.map((s, i) => (
              <Reveal key={s.slug} delay={i * 60}>
                <StoryCard story={s} />
              </Reveal>
            ))}
          </div>

          {theirSeries.length > 0 && (
            <>
              <h2 className="mt-16 text-[1.7rem]">Series</h2>
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                {theirSeries.map((s) => (
                  <Panel key={s.slug} hover className="overflow-hidden">
                    <img
                      src={s.cover}
                      alt={s.title}
                      loading="lazy"
                      width={1200}
                      height={800}
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <div className="p-6">
                      <p className="text-[0.6875rem] font-black tracking-[0.16em] text-primary uppercase">
                        {s.parts} parts
                      </p>
                      <h3 className="mt-2 text-[1.15rem]">{s.title}</h3>
                      <p className="mt-2 text-[0.9375rem] text-body">{s.blurb}</p>
                    </div>
                  </Panel>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-6">
          <Panel className="p-6">
            <h3 className="text-[1.05rem]">Achievements</h3>
            <ul className="mt-4 space-y-3">
              {writer.achievements.map((a: string) => (
                <li key={a} className="flex items-center gap-2.5 text-[0.9375rem] text-body">
                  <Award className="size-4 shrink-0 text-warning" /> {a}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="p-6">
            <h3 className="text-[1.05rem]">Elsewhere</h3>
            <ul className="mt-4 space-y-2">
              {writer.socials.map((s: { label: string; href: string }) => (
                <li key={s.label}>
                  <a href={s.href} className="text-[0.9375rem] text-primary hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="paper-gradient p-6">
            <h3 className="text-[1.05rem]">Support this writer</h3>
            <p className="mt-2 text-[0.9375rem] text-body">
              Members fund the writers they read most. 70% of every membership goes straight to them.
            </p>
            <div className="mt-5">
              <ButtonLink to="/auth" size="sm" className="w-full">
                Become a member
              </ButtonLink>
            </div>
          </Panel>
        </aside>
      </div>
    </SiteLayout>
  );
}
