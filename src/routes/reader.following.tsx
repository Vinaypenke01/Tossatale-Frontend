import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, Button, ButtonLink, EmptyState, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { ReaderLayout } from "@/components/tossa/SiteLayout";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

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
  const { data: apiFollowing, isLoading } = useQuery({
    queryKey: ["reader-following"],
    queryFn: async () => {
      const res = await api.get("/user/following/");
      return res.data?.results || res.data || [];
    },
  });

  const followingWriters = (apiFollowing && Array.isArray(apiFollowing))
    ? apiFollowing.map((item: any) => ({
        slug: item.writer?.slug || item.writer_id,
        name: item.writer?.name || item.writer?.user?.full_name || "Writer",
        initials: (item.writer?.name || "W").substring(0, 2).toUpperCase(),
        handle: `@${item.writer?.slug || "writer"}`,
        verified: item.writer?.is_verified || false,
        role: "Storyteller",
        bio: item.writer?.bio || "Author on tossatale",
        stories: item.writer?.total_stories || 0,
        followers: item.writer?.total_followers ? `${item.writer?.total_followers}` : "0",
      }))
    : [];

  return (
    <ReaderLayout
      title="Following"
      blurb="Writers whose new work arrives in your feed."
    >
      {isLoading ? (
        <div className="py-12 text-center text-subtle font-medium">Loading followed writers...</div>
      ) : followingWriters.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" />}
          title="Not following any writers yet"
          blurb="Follow your favorite authors to get their latest stories and series updates."
          action={<ButtonLink to="/writers">Discover writers</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {followingWriters.map((w: any) => (
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
                <FollowButton initial={true} />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </ReaderLayout>
  );
}
