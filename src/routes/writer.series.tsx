import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  PenLine,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/tossa/AppShell";
import { ButtonLink, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/writer/series")({
  head: () => pageHead("My series · tossatale studio", "Plan chapters, track progress and schedule serialized releases."),
  component: MySeries,
});

function MySeries() {
  const upcomingFeatures = [
    {
      icon: BookOpen,
      title: "Structured Chapter Arcs",
      description: "Organize individual stories into sequenced chapters with custom progression and numbering.",
    },
    {
      icon: Calendar,
      title: "Episodic Scheduling",
      description: "Set automated release cadences for upcoming installments to keep readers anticipating the next drop.",
    },
    {
      icon: TrendingUp,
      title: "Retention Analytics",
      description: "Measure completion rates and track reader journey from chapter one all the way to the finale.",
    },
  ];

  return (
    <AppShell
      role="writer"
      title="My series"
      blurb="Longform work, told in parts. Plan the arc, then keep the promise you made in chapter one."
    >
      <div className="mx-auto max-w-4xl py-6">
        <Panel className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/80 p-8 sm:p-12 shadow-sm backdrop-blur-xs">
          {/* Subtle atmospheric brand glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Feature in Development</span>
            </div>

            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-heading sm:text-4xl">
              Serialized Storytelling is Coming Soon
            </h2>

            <p className="mt-3 text-base sm:text-lg leading-relaxed text-body">
              We are crafting a dedicated Series Builder so you can group multi-part narratives, plan story arcs, and deliver episodic reading experiences to your audience.
            </p>

            {/* Feature Highlight Cards */}
            <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
              {upcomingFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col rounded-2xl border border-border/60 bg-surface-alt/40 p-5 transition-colors hover:border-primary/30"
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-3 font-display font-bold text-heading text-base">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-subtle leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Call to action */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-8">
              <ButtonLink to="/writer/stories" variant="ghostOutline" className="gap-2">
                <BookOpen className="size-4" />
                View my stories
              </ButtonLink>
              <ButtonLink to="/writer/editor" className="gap-2">
                <PenLine className="size-4" />
                Write a standalone story
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

