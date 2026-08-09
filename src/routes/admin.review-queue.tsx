import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, MessageSquare, X } from "lucide-react";
import { useState } from "react";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Badge, Button, Input, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { stories, writerBySlug } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/review-queue")({
  head: () =>
    pageHead("Review queue · tossatale admin", "Read, annotate and approve submitted stories before they publish."),
  component: ReviewQueue,
});

const filters = ["All", "New", "In review", "Needs revision", "Scheduled"] as const;

const statusFor = (i: number) =>
  (["New", "In review", "Needs revision", "Scheduled"] as const)[i % 4]!;

const toneFor = (s: string) =>
  s === "New" ? "warning" : s === "In review" ? "info" : s === "Needs revision" ? "error" : "success";

function ReviewQueue() {
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  const rows = stories
    .map((s, i) => ({ story: s, status: statusFor(i) }))
    .filter((r) => (filter === "All" ? true : r.status === filter))
    .filter((r) => r.story.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppShell
      role="admin"
      title="Review queue"
      blurb="Every submission, in the order it arrived. Read it, leave notes, then approve or send it back."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="In queue" value="24" hint="6 older than 3 days" />
        <StatCard label="Median wait" value="1.8 days" delta="-0.4d" hint="faster" />
        <StatCard label="Approved this week" value="38" />
        <StatCard label="Sent back" value="7" hint="with notes" />
      </div>

      <Panel className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 font-sans text-[0.8125rem] font-bold transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-body hover:border-primary hover:text-primary",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search submissions"
            className="md:w-72"
          />
        </div>

        <ul className="mt-6 divide-y divide-border">
          {rows.map(({ story, status }) => (
            <li key={story.slug} className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <Badge tone={toneFor(status) as "info"}>{status}</Badge>
                  <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-subtle">
                    <Clock className="size-3.5" /> {story.date}
                  </span>
                </div>
                <h2 className="mt-2 text-[1.125rem] leading-snug">{story.title}</h2>
                <p className="mt-1 line-clamp-1 text-[0.875rem] text-subtle">{story.dek}</p>
                <p className="mt-1.5 text-[0.8125rem] text-subtle">
                  {writerBySlug(story.writer)?.name} · {story.category} · {story.readingTime} min read
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="soft">
                  <MessageSquare className="size-4" /> Notes
                </Button>
                <Button size="sm" variant="ghostOutline">
                  <X className="size-4" /> Return
                </Button>
                <Button size="sm">
                  <Check className="size-4" /> Approve
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}
