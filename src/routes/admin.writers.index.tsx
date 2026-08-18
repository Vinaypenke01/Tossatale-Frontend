import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Mail, Search, User } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Input, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/writers/")({
  head: () =>
    pageHead(
      "Writer management · tossatale admin",
      "Review writer profiles, verification status, personal info and publishing activity.",
    ),
  component: AdminWriters,
});

function AdminWriters() {
  const [query, setQuery] = useState("");

  const { data: apiWriters, isLoading } = useQuery({
    queryKey: ["admin-writers", query],
    queryFn: async () => {
      const res = await api.get(`/admin/writers/${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      return res.data?.results || res.data || [];
    },
  });

  const rows = (apiWriters && Array.isArray(apiWriters))
    ? apiWriters.map((w: any) => ({
        slug: w.slug,
        name: w.name || w.user?.full_name || "Writer",
        initials: (w.name || w.user?.full_name || "W").substring(0, 2).toUpperCase(),
        handle: `@${w.slug}`,
        verified: w.is_verified || false,
        role: "Storyteller",
        location: "India",
        stories: w.total_stories || 0,
        followers: w.total_followers ? `${w.total_followers}` : "0",
        reads: w.total_reads ? `${w.total_reads}` : "0",
      }))
    : [];

  const handleEmailClick = (e: React.MouseEvent, writerName: string) => {
    e.stopPropagation();
    toast.info(`Opening email composer for ${writerName}...`);
  };

  return (
    <AppShell
      role="admin"
      title="Writers"
      blurb="Who is publishing, how often, and who is waiting on verification."
      actions={<Button variant="soft">Invite a writer</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total writers" value={String(rows.length)} hint="registered" />
        <StatCard label="Verified" value={String(rows.filter((r: any) => r.verified).length)} />
        <StatCard label="Pending verification" value={String(rows.filter((r: any) => !r.verified).length)} hint="needs review" />
        <StatCard label="Published this week" value="0" />
      </div>

      <Panel className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-display font-bold text-heading">Directory</h2>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search writers by name..."
              className="pl-11"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading writers directory...</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="font-display text-lg font-bold text-heading">No writers found</h3>
            <p className="mt-1 text-[0.875rem] text-subtle">
              {query ? `No writers match "${query}".` : "There are currently no registered writers in the system."}
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {rows.map((w: any) => (
              <li
                key={w.slug}
                className="group flex flex-col gap-4 py-5 sm:flex-row sm:items-center transition-colors hover:bg-surface-alt/30 px-3 rounded-2xl"
              >
                <Link to="/admin/writers/$slug" params={{ slug: w.slug }} className="shrink-0">
                  <Avatar initials={w.initials} />
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-sans text-[0.9375rem] font-bold text-heading">
                    <Link
                      to="/admin/writers/$slug"
                      params={{ slug: w.slug }}
                      className="hover:text-primary transition-colors"
                    >
                      {w.name}
                    </Link>
                    {w.verified && <VerifiedBadge />}
                  </p>
                  <p className="text-[0.8125rem] text-subtle">
                    {w.handle} · {w.role} · {w.location}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-[0.8125rem] text-subtle">
                  <span>
                    <strong className="font-sans text-heading">{w.stories}</strong> stories
                  </span>
                  <span>
                    <strong className="font-sans text-heading">{w.followers}</strong> followers
                  </span>
                  <span className="hidden sm:inline">
                    <strong className="font-sans text-heading">{w.reads}</strong> reads
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={w.verified ? "success" : "warning"}>
                    {w.verified ? "Verified" : "Pending"}
                  </Badge>

                  <ButtonLink
                    to="/admin/writers/$slug"
                    params={{ slug: w.slug }}
                    size="sm"
                    variant="ghostOutline"
                    className="hidden md:inline-flex"
                  >
                    <User className="size-3.5 mr-1" /> View details
                  </ButtonLink>

                  <Button
                    size="icon"
                    variant="ghostOutline"
                    aria-label={`Email ${w.name}`}
                    onClick={(e) => handleEmailClick(e, w.name)}
                  >
                    <Mail className="size-4" />
                  </Button>

                  <Link
                    to="/admin/writers/$slug"
                    params={{ slug: w.slug }}
                    className="grid size-9 place-items-center rounded-xl border border-border text-subtle transition-colors hover:border-primary hover:text-primary md:hidden"
                    aria-label={`View detail screen for ${w.name}`}
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
