import { createFileRoute } from "@tanstack/react-router";
import { Link2, Play, Send, Youtube } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { videos } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/videos")({
  head: () =>
    pageHead(
      "Post a YouTube video · tossatale admin",
      "Paste a YouTube link, add editorial context, and publish it to the tossatale video library.",
    ),
  component: AdminVideos,
});

const seriesOptions = ["In the Room", "Field Notes", "Reading Aloud", "Unlisted"];

function youtubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function AdminVideos() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const id = useMemo(() => youtubeId(url), [url]);

  return (
    <AppShell
      role="admin"
      title="Post a YouTube video"
      blurb="Paste a link, write the editorial note, and it appears in the video library."
      actions={
        <Button>
          <Send className="size-4" /> Publish video
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel className="space-y-5 p-6 lg:p-8">
          <Field label="YouTube link" hint="Standard, short, or Shorts URLs all work">
            <div className="relative">
              <Link2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="pl-11"
              />
            </div>
          </Field>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface-alt/60">
            {id ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title="Video preview"
                  allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            ) : (
              <div className="grid aspect-video place-items-center text-subtle">
                <span className="flex flex-col items-center gap-2 text-[0.875rem]">
                  <Youtube className="size-6" /> Paste a link to preview
                </span>
              </div>
            )}
          </div>

          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meera Raghavan on writing about family"
            />
          </Field>
          <Field label="Editorial note" hint="Shown under the player on /videos">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Why this film belongs in the library…"
            />
          </Field>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-5 p-6">
            <h2 className="text-xl">Placement</h2>
            <Field label="Series">
              <select
                defaultValue={seriesOptions[0]}
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-heading focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none"
              >
                {seriesOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Duration" hint="Optional — auto-filled on publish">
              <Input placeholder="12:40" />
            </Field>
            <Field label="Linked writer" hint="Optional">
              <Input placeholder="Meera Raghavan" />
            </Field>
          </Panel>

          <Panel className="p-6">
            <h2 className="text-xl">Status</h2>
            <div className="mt-3 flex items-center gap-2">
              <Badge tone={id ? "success" : "warning"}>{id ? "Link verified" : "No link yet"}</Badge>
            </div>
            <p className="mt-3 text-[0.8125rem] text-subtle">
              Videos publish instantly and are indexed under the video library.
            </p>
          </Panel>
        </div>
      </div>

      <section>
        <h2 className="text-2xl">Published videos</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {videos.map((video) => (
            <div
              key={video.slug}
              className="overflow-hidden rounded-2xl border border-border bg-surface shadow-paper"
            >
              <div className="relative">
                <img src={video.cover} alt="" className="h-40 w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-heading/25">
                  <span className="grid size-11 place-items-center rounded-full bg-surface/90">
                    <Play className="size-4 text-primary" />
                  </span>
                </span>
              </div>
              <div className="space-y-1 p-4">
                <p className="font-sans text-[0.9375rem] font-bold text-heading">{video.title}</p>
                <p className="text-[0.8125rem] text-subtle">
                  {video.series} · {video.duration} · {video.views} views
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
