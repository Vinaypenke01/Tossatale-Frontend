import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Save, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { categories, type Story } from "@/lib/data";

export function StoryEditor({
  story,
  role = "writer",
}: {
  story?: Story | undefined;
  role?: "writer" | "admin";
}) {
  const isAdmin = role === "admin";
  const [title, setTitle] = useState(story?.title ?? "");
  const [dek, setDek] = useState(story?.dek ?? "");
  const [body, setBody] = useState(story?.body.join("\n\n") ?? "");
  const [preview, setPreview] = useState(false);

  const paragraphs = useMemo(
    () => body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    [body],
  );

  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const minutes = Math.max(1, Math.round(words / 220));

  return (
    <AppShell
      role={role}
      title={story ? "Edit story" : isAdmin ? "Write a story" : "New story"}
      blurb={
        story
          ? "Revise, then resubmit. Editors see a diff of what changed."
          : isAdmin
            ? "Editorial desk drafting — publish straight to the library, no review queue."
            : "Start with a sentence you'd read twice. Everything saves as you type."
      }
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
          <Button variant="soft">
            <Save className="size-4" /> Save draft
          </Button>
          <Button>
            <Send className="size-4" /> {isAdmin ? "Publish now" : "Submit for review"}
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
              <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-heading">
                {title || "Untitled story"}
              </h2>
              {dek && <p className="mt-3 text-[1.0625rem] text-body">{dek}</p>}
              <hr className="my-6 border-border" />
              {paragraphs.length ? (
                <div className="space-y-5">
                  {paragraphs.map((para, i) => (
                    <p
                      key={i}
                      className="font-display text-[1.0625rem] leading-[1.85] text-body first:first-letter:mr-2 first:first-letter:float-left first:first-letter:font-display first:first-letter:text-[3.4rem] first:first-letter:leading-[0.85] first:first-letter:text-primary"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[0.9375rem] text-subtle">
                  Nothing written yet — switch back to editing and start the first line.
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
            placeholder="Your title"
            aria-label="Story title"
            className="w-full border-0 bg-transparent font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-heading placeholder:text-subtle/50 focus:outline-none"
          />
          <input
            value={dek}
            onChange={(e) => setDek(e.target.value)}
            placeholder="A one-line standfirst"
            aria-label="Standfirst"
            className="mt-3 w-full border-0 bg-transparent text-[1.0625rem] text-body placeholder:text-subtle/60 focus:outline-none"
          />
          <hr className="my-6 border-border" />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={22}
            placeholder="Begin here…"
            aria-label="Story body"
            className="border-0 px-0 font-display text-[1.0625rem] leading-[1.85] shadow-none focus:ring-0"
          />
          <div className="mt-4 flex items-center gap-4 text-[0.8125rem] text-subtle">
            <span>{words} words</span>
            <span>·</span>
            <span>{minutes} min read</span>
            <span>·</span>
            <span>Saved just now</span>
          </div>
          </>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-xl">Status</h2>
            <div className="mt-3 flex items-center gap-2">
              <Badge tone={story ? "info" : isAdmin ? "success" : "warning"}>
                {story ? "In review" : isAdmin ? "Ready to publish" : "Draft"}
              </Badge>
              {story && <span className="text-[0.8125rem] text-subtle">Last edited {story.date}</span>}
            </div>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="text-xl">Details</h2>
            <Field label="Category">
              <select
                defaultValue={story?.categorySlug ?? categories[0]!.slug}
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-heading focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags" hint="Comma separated, up to five">
              <Input defaultValue={story?.tags.join(", ") ?? ""} placeholder="memoir, monsoon, family" />
            </Field>
            <Field label="Series" hint="Optional">
              <Input defaultValue={story?.series ?? ""} placeholder="House of Small Rooms" />
            </Field>
          </Panel>

          <p className="text-[0.8125rem] text-subtle">
            Need a refresher?{" "}
            <Link to="/about" className="font-sans font-bold text-primary">
              Read the editorial guidelines
            </Link>
            .
          </p>
        </div>
      </div>
    </AppShell>
  );
}
