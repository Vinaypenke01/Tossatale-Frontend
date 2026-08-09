import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, ImagePlus, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { blogs } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/blogs")({
  head: () =>
    pageHead(
      "Post a blog · tossatale admin",
      "Compose and publish journal posts from the tossatale editorial desk.",
    ),
  component: AdminBlogs,
});

const tags = ["Inside tossatale", "Craft", "Research", "Announcements"];

function AdminBlogs() {
  const [title, setTitle] = useState("");
  const [dek, setDek] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);

  const paragraphs = useMemo(
    () => body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    [body],
  );

  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const minutes = Math.max(1, Math.round(words / 220));

  return (
    <AppShell
      role="admin"
      title="Post a blog"
      blurb="Journal posts publish instantly under /blogs — no review queue, no waiting."
      actions={
        <>
          <Button variant="ghostOutline" onClick={() => setPreview((v) => !v)}>
            {preview ? (
              <>
                <EyeOff className="size-4" /> Back to editing
              </>
            ) : (
              <>
                <Eye className="size-4" /> Preview
              </>
            )}
          </Button>
          <Button>
            <Send className="size-4" /> Publish post
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel className="p-6 lg:p-8">
          {preview ? (
            <article>
              <p className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-primary uppercase">
                Preview
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight text-heading">
                {title || "Untitled post"}
              </h2>
              {dek && <p className="mt-3 text-[1.0625rem] text-body">{dek}</p>}
              <hr className="my-6 border-border" />
              {paragraphs.length ? (
                <div className="space-y-5">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="font-display text-[1.0625rem] leading-[1.85] text-body">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[0.9375rem] text-subtle">
                  Nothing written yet — switch back to editing to draft the post.
                </p>
              )}
              <div className="mt-8 flex items-center gap-4 text-[0.8125rem] text-subtle">
                <span>{words} words</span>
                <span>·</span>
                <span>{minutes} min read</span>
              </div>
            </article>
          ) : (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                aria-label="Post title"
                className="w-full border-0 bg-transparent font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight text-heading placeholder:text-subtle/50 focus:outline-none"
              />
              <input
                value={dek}
                onChange={(e) => setDek(e.target.value)}
                placeholder="A one-line summary"
                aria-label="Post summary"
                className="mt-3 w-full border-0 bg-transparent text-[1.0625rem] text-body placeholder:text-subtle/60 focus:outline-none"
              />
              <hr className="my-6 border-border" />
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={18}
                placeholder="Write the post…"
                aria-label="Post body"
                className="border-0 px-0 font-display text-[1.0625rem] leading-[1.85] shadow-none focus:ring-0"
              />
              <div className="mt-4 flex items-center gap-4 text-[0.8125rem] text-subtle">
                <span>{words} words</span>
                <span>·</span>
                <span>{minutes} min read</span>
                <span>·</span>
                <span>Autosaved</span>
              </div>
            </>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-5 p-6">
            <h2 className="text-xl">Post details</h2>
            <Field label="Section">
              <select
                defaultValue={tags[0]}
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-heading focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none"
              >
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Slug" hint="">
              <Input placeholder="how-we-choose-editors-picks" />
            </Field>
            <Field label="Author byline">
              <Input defaultValue="tossatale Editorial" />
            </Field>
          </Panel>

          <Panel className="p-6">
            <h2 className="text-xl">Cover image</h2>
            <div className="mt-4 grid h-36 place-items-center rounded-xl border border-dashed border-border bg-surface-alt/60 text-subtle">
              <span className="flex flex-col items-center gap-2 text-[0.875rem]">
                <ImagePlus className="size-5" /> Drop an image
              </span>
            </div>
            <Button variant="ghostOutline" size="sm" className="mt-4 w-full">
              Upload cover
            </Button>
          </Panel>
        </div>
      </div>

      <section>
        <h2 className="text-2xl">Published posts</h2>
        <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-paper">
          {blogs.map((post) => (
            <div key={post.slug} className="flex items-center gap-4 p-4">
              <img src={post.cover} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">
                  {post.title}
                </p>
                <p className="truncate text-[0.8125rem] text-subtle">
                  {post.tag} · {post.date} · {post.readingTime} min
                </p>
              </div>
              <Badge tone="success">Live</Badge>
              <Button variant="ghostOutline" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
