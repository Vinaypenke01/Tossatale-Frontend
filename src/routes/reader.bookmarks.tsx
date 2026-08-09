import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useState } from "react";

import { ButtonLink, EmptyState, Input } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { StoryCard } from "@/components/tossa/StoryCard";
import { pageHead } from "@/lib/head";
import { collections, stories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reader/bookmarks")({
  head: () => pageHead("Saved stories · tossatale", "Your reading list, organised into shelves you made yourself."),
  component: Bookmarks,
});

function Bookmarks() {
  const [shelf, setShelf] = useState("All saved");
  const [query, setQuery] = useState("");
  const shelves = ["All saved", ...collections.map((c) => c.title)];

  const saved = stories.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <ReaderLayout
      title="Bookmarks"
      blurb="Twenty-seven stories waiting for a quieter evening."
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {shelves.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShelf(s)}
              className={cn(
                "rounded-full border px-4 py-2 font-sans text-[0.875rem] font-bold transition-colors",
                shelf === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-body hover:border-primary hover:text-primary",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved stories"
          className="md:w-72"
        />
      </div>

      {saved.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="size-5" />}
          title="Nothing saved yet"
          blurb="Tap the bookmark on any story and it will wait for you here."
          action={<ButtonLink to="/stories">Browse the library</ButtonLink>}
        />
      )}
    </ReaderLayout>
  );
}
