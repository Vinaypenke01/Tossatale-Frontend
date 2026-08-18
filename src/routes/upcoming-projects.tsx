import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clapperboard, Sparkles, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Button, CategoryPill, Input, Panel } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { api } from "@/lib/api";
import { covers } from "@/lib/data";

export const Route = createFileRoute("/upcoming-projects")({
  head: () => ({
    meta: [
      { title: "Upcoming Projects — Short Films & Original Storytelling" },
      {
        name: "description",
        content:
          "Explore upcoming short films, docuseries, and original visual productions coming soon to tossatale.",
      },
      { property: "og:title", content: "Upcoming Projects — tossatale" },
      {
        property: "og:description",
        content: "Discover short films and original productions coming soon.",
      },
    ],
  }),
  component: UpcomingProjectsPage,
});

function UpcomingProjectsPage() {
  const [email, setEmail] = useState("");

  const { data: projectsList, isLoading } = useQuery({
    queryKey: ["public-upcoming-projects"],
    queryFn: async () => {
      try {
        const res = await api.get("/public/videos/?upcoming=true");
        return res.data?.results || res.data || [];
      } catch {
        return [];
      }
    },
  });

  const projects = (projectsList && Array.isArray(projectsList)) ? projectsList : [];

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed for production updates!", {
      description: "We'll notify you as soon as new short films are released.",
    });
    setEmail("");
  };

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Coming Soon to Screen
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05] font-display font-bold text-heading">
            Upcoming Projects
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Get an exclusive look at original short films, docuseries, and visual storytelling adaptations currently in production.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        {isLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading upcoming productions...</div>
        ) : projects.length === 0 ? (
          <EmptySectionFallback
            icon="video"
            title="No Upcoming Projects Announced"
            description="Our creative studio is preparing new short films and documentaries for release. Check back soon!"
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map((project: any, i: number) => (
              <Reveal key={project.id || project.slug} delay={i * 80}>
                <Panel hover className="flex flex-col h-full overflow-hidden">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={project.cover_image || project.thumbnail_url || covers.boat}
                      alt={project.title}
                      loading="lazy"
                      width={1200}
                      height={800}
                      className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <CategoryPill tone="onImage">{project.category?.name || "Film"}</CategoryPill>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 font-sans text-[0.6875rem] font-black tracking-wider text-white uppercase backdrop-blur">
                        <Sparkles className="size-3" /> {project.status || "In Production"}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="font-sans text-[0.75rem] font-medium text-white/80 flex items-center gap-1.5">
                        <Calendar className="size-3.5" /> Expected: {project.expected_release || "Coming Soon"}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-[1.4rem] font-display font-bold text-heading">
                        {project.title}
                      </h2>
                      <p className="mt-1.5 text-[0.8125rem] text-subtle font-medium flex items-center gap-1.5">
                        <Clapperboard className="size-3.5 text-primary" /> Director: {project.director || "Tossatale Studio"}
                      </p>
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-body">
                        {project.description || project.logline || "Short film adaptation coming soon."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-divider flex items-center justify-between">
                      <span className="text-[0.75rem] font-bold text-subtle uppercase tracking-wider">
                        Status: {project.status || "Production"}
                      </span>
                      <Button variant="ghostOutline" size="sm">
                        Notify Me
                      </Button>
                    </div>
                  </div>
                </Panel>
              </Reveal>
            ))}
          </div>
        )}

        <section className="mt-20">
          <Panel className="grain p-8 lg:p-12 text-center ink-gradient text-white overflow-hidden relative">
            <span className="pointer-events-none absolute -top-16 -left-10 size-48 animate-drift rounded-full bg-white/10 blur-2xl" />
            <div className="max-w-2xl mx-auto relative z-10">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15 mx-auto text-white">
                <Video className="size-6" />
              </span>
              <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.4rem)] font-display font-bold">
                Have a script or short film pitch?
              </h2>
              <p className="mt-3 text-[1rem] text-white/85">
                We collaborate with independent filmmakers and writers to bring moving stories to screen.
              </p>
              <form
                className="mx-auto mt-6 flex max-w-sm flex-col gap-2 sm:flex-row"
                onSubmit={handleNotifySubmit}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to get updates"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/60 focus:ring-white/25 text-[0.875rem]"
                />
                <Button variant="inkOnDark" size="sm" className="h-10 shrink-0">
                  Stay Updated
                </Button>
              </form>
            </div>
          </Panel>
        </section>
      </div>
    </SiteLayout>
  );
}
