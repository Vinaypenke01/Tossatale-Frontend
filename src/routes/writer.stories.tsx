import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Heart, PenLine } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, ButtonLink, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { stories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/writer/stories")({
  head: () => pageHead("My stories · tossatale studio", "Every draft, submission and published story you've written."),
  component: MyStories,
});

const tabs = ["All", "Drafts", "In review", "Published"] as const;
const statuses = ["Draft", "In review", "Published", "Published"] as const;

function MyStories() {
  const [tab, setTab] = useState<string>("All");
  const rows = stories
    .map((s, i) => ({ story: s, status: statuses[i % 4]! }))
    .filter((r) => (tab === "All" ? true : r.status === (tab === "Drafts" ? "Draft" : tab)));

  return (
    <AppShell
      role="writer"
      title="My stories"
      blurb="Forty-two pieces, six years, one long argument with the first paragraph."
      actions={
        <ButtonLink to="/writer/editor" variant="primary">
          <PenLine className="size-4" /> New story
        </ButtonLink>
      }
    >
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-2 font-sans text-[0.875rem] font-bold transition-colors",
              tab === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-body hover:border-primary hover:text-primary",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Panel className="p-6">
        <ul className="divide-y divide-border">
          {rows.map(({ story, status }) => (
            <li key={story.slug} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Badge tone={status === "Draft" ? "warning" : status === "In review" ? "info" : "success"}>
                  {status}
                </Badge>
                <h2 className="mt-2 text-[1.125rem] leading-snug">{story.title}</h2>
                <p className="mt-1 text-[0.8125rem] text-subtle">
                  {story.category} · {story.date} · {story.readingTime} min
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5 text-[0.8125rem] text-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" /> {story.views}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="size-3.5" /> {story.likes}
                </span>
                <Link
                  to="/writer/editor/$storyId"
                  params={{ storyId: story.slug }}
                  className="font-sans font-bold text-primary"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}
