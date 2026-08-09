import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Avatar, Button, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { pageHead } from "@/lib/head";
import { writers } from "@/lib/data";

export const Route = createFileRoute("/reader/following")({
  head: () => pageHead("Writers you follow · tossatale", "Manage the writers whose new work arrives in your feed."),
  component: Following,
});

function FollowButton({ initial }: { initial: boolean }) {
  const [following, setFollowing] = useState(initial);
  return (
    <Button
      size="sm"
      variant={following ? "ghostOutline" : "primary"}
      onClick={() => setFollowing((v) => !v)}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}

function Following() {
  return (
    <ReaderLayout
      title="Following"
      blurb="Nineteen writers. Their new work shows up first in your feed and in Sunday's digest."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {writers.map((w, i) => (
          <Panel key={w.slug} hover className="p-6">
            <div className="flex items-start gap-4">
              <Avatar initials={w.initials} size="lg" />
              <div className="min-w-0 flex-1">
                <Link
                  to="/writers/$slug"
                  params={{ slug: w.slug }}
                  className="flex items-center gap-1.5 font-sans text-[1.0625rem] font-bold text-heading hover:text-primary"
                >
                  {w.name} {w.verified && <VerifiedBadge />}
                </Link>
                <p className="text-[0.8125rem] text-subtle">
                  {w.handle} · {w.role}
                </p>
                <p className="mt-3 line-clamp-2 text-[0.9375rem] text-body">{w.bio}</p>
                <div className="mt-4 flex items-center gap-5 text-[0.8125rem] text-subtle">
                  <span>
                    <strong className="font-sans text-heading">{w.stories}</strong> stories
                  </span>
                  <span>
                    <strong className="font-sans text-heading">{w.followers}</strong> followers
                  </span>
                </div>
              </div>
              <FollowButton initial={i !== writers.length - 1} />
            </div>
          </Panel>
        ))}
      </div>
    </ReaderLayout>
  );
}
