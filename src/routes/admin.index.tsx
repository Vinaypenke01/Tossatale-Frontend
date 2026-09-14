import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  Loader2,
  Power,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () =>
    pageHead(
      "Admin overview · tossatale",
      "Your editorial overview: submissions, stories, and website health.",
    ),
  component: AdminOverview,
});

function AdminOverview() {
  const queryClient = useQueryClient();

  // 1. Submissions queue
  const { data: queueData, isLoading: isQueueLoading } = useQuery({
    queryKey: ["admin-overview-queue"],
    queryFn: async () => {
      const res = await api.get("/admin/reviews/queue/");
      return res.data?.results || res.data || [];
    },
  });

  // 2. Fetch live Platform Analytics Overview
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-overview-analytics"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/analytics/overview/");
        return res.data?.data || res.data || {};
      } catch {
        return {};
      }
    },
  });

  const platformSummary = analyticsData?.platform_summary || {};

  // 3. Fetch Writers for accurate active count & recent writers box
  const { data: writersData, isLoading: isWritersLoading } = useQuery({
    queryKey: ["admin-overview-writers"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/writers/");
        return res.data;
      } catch {
        return { results: [], stats: {} };
      }
    },
  });

  const recentWritersList = Array.isArray(writersData?.results)
    ? writersData.results.slice(0, 5)
    : Array.isArray(writersData)
      ? writersData.slice(0, 5)
      : [];

  const activeWritersCount =
    writersData?.stats?.total_writers ??
    platformSummary.total_writers ??
    (Array.isArray(writersData?.results) ? writersData.results.length : 0);

  // 4. Fetch site settings (Maintenance / Under Construction mode)
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/settings/");
        return res.data?.data || res.data || {};
      } catch {
        return {};
      }
    },
  });

  const isMaintenanceMode = Boolean(settingsData?.maintenance_mode);

  // 10-Second Countdown Toggle Safeguard
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownTimerRef = useRef<any>(null);

  // Toggle Maintenance Mode Mutation
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enable: boolean) => {
      return await api.patch("/admin/settings/", {
        maintenance_mode: enable,
      });
    },
    onSuccess: (_, enable) => {
      toast.success(
        enable
          ? "🚧 Under Construction Mode Activated"
          : "🟢 Platform Live! Under Construction Disabled",
        {
          description: enable
            ? "Public visitors will now see the Under Construction splash screen. Only admins have access."
            : "The full platform is now live and accessible to all readers and writers.",
        },
      );
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-site-settings"] });
    },
    onError: (err: any) => {
      toast.error("Failed to update platform status", {
        description: err.response?.data?.message || err.message,
      });
    },
  });

  const handleToggleClick = () => {
    if (pendingToggle !== null) {
      // User clicked again during countdown -> Abort / Cancel
      clearTimeout(countdownTimerRef.current);
      setPendingToggle(null);
      setCountdown(0);
      toast.info("Platform status change aborted.");
      return;
    }

    const nextState = !isMaintenanceMode;
    setPendingToggle(nextState);
    setCountdown(10);
    toast.warning(
      nextState
        ? "Activating Under Construction in 10s. Click button again to Cancel."
        : "Setting Website Live in 10s. Click button again to Cancel.",
      { duration: 9000 }
    );
  };

  useEffect(() => {
    if (countdown > 0 && pendingToggle !== null) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(countdownTimerRef.current);
    } else if (countdown === 0 && pendingToggle !== null) {
      toggleMaintenanceMutation.mutate(pendingToggle);
      setPendingToggle(null);
    }
  }, [countdown, pendingToggle]);

  const storiesList = queueData && Array.isArray(queueData) ? queueData : [];

  return (
    <AppShell
      role="admin"
      title="Editorial control room"
      blurb="Your editorial overview: submissions, stories, and website health."
      actions={
        <div className="flex items-center gap-2">
          {/* Platform Status Button positioned left to notification icon */}
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={toggleMaintenanceMutation.isPending || isSettingsLoading}
            title={
              pendingToggle !== null
                ? `Click to abort countdown (${countdown}s)`
                : isMaintenanceMode
                  ? "Website is Under Construction. Click to make Live (10s confirmation)"
                  : "Website is Public Live. Click to enable Under Construction (10s confirmation)"
            }
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs",
              pendingToggle !== null
                ? "border border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/50 animate-pulse"
                : isMaintenanceMode
                  ? "border-2 border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/30 hover:ring-rose-500/70 hover:bg-rose-500/20"
                  : "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 hover:ring-emerald-500/70 hover:bg-emerald-500/20"
            )}
          >
            {toggleMaintenanceMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Power className="size-3.5" />
            )}
            <span>
              {pendingToggle !== null
                ? `Switching in ${countdown}s (Cancel)`
                : isMaintenanceMode
                  ? "Platform: Under Construction"
                  : "Platform: Live"}
            </span>
          </button>
        </div>
      }
    >
      {/* ── Platform Status Description Banner ── */}
      <Panel
        className={cn(
          "p-6 transition-all border-2",
          isMaintenanceMode
            ? "border-rose-500/40 bg-rose-500/5 shadow-lg shadow-rose-500/5"
            : "border-emerald-500/30 bg-surface",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-2xl",
                isMaintenanceMode
                  ? "bg-rose-500/20 text-rose-500"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {isMaintenanceMode ? (
                <ShieldAlert className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-heading">
                  Platform Status:{" "}
                  {isMaintenanceMode ? "Under Construction" : "Live for All Visitors"}
                </h3>
                <Badge
                  tone={isMaintenanceMode ? "error" : "success"}
                  className="font-sans text-[0.6875rem]"
                >
                  {isMaintenanceMode ? "Maintenance Active" : "Public Live"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-subtle leading-relaxed">
                {isMaintenanceMode
                  ? "Public visitors and readers are currently redirected to the Under Construction splash screen. Only administrators can access pages."
                  : "The website is live. All public stories, videos, series, and blogs are active and accessible."}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── StatCards with Updated Hints ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Awaiting review"
          value={String(storiesList.length)}
          hint="Needs your attention"
        />
        <StatCard
          label="Published Stories"
          value={String(platformSummary.total_published_stories ?? 0)}
          hint="Live in website"
        />
        <StatCard
          label="Total Platform Views"
          value={platformSummary.total_views ? Number(platformSummary.total_views).toLocaleString() : "0"}
          hint="Look at them go"
        />
        <StatCard
          label="Active Writers"
          value={String(activeWritersCount)}
          hint="Storytellers are here"
        />
      </div>

      {/* ── Newest Submissions (Full Rectangle Box) ── */}
      <Panel className="p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-heading">Newest submissions</h2>
          </div>
          <Link
            to="/admin/review-queue"
            className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary hover:underline"
          >
            Review all ({storiesList.length}) <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {isQueueLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading submissions...</div>
        ) : storiesList.length === 0 ? (
          <div className="py-10 text-center">
            <EmptySectionFallback
              icon="book"
              title="No Pending Submissions"
              description="There are currently no new story submissions waiting for editorial review."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {storiesList.slice(0, 6).map((s: any) => (
              <li key={s.id || s.slug} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[0.9375rem] font-bold text-heading hover:text-primary transition-colors">
                    <Link to="/admin/review-queue">{s.title}</Link>
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-subtle">
                    {s.writer?.name || s.writer?.user?.full_name || "Author"} · {s.category?.name || "General"} · {s.estimated_reading_time || 5} min read
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone="warning">{s.status || "Pending"}</Badge>
                  <ButtonLink
                    to="/admin/review-queue"
                    size="sm"
                    variant="ghostOutline"
                    className="hidden sm:inline-flex text-xs"
                  >
                    Review
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* ── New Writers & Recent Signups Box ── */}
      <Panel className="p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-heading">New writers &amp; storytellers</h2>
          </div>
          <Link
            to="/admin/writers"
            className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary hover:underline"
          >
            All writers ({activeWritersCount}) <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {isWritersLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading writers...</div>
        ) : recentWritersList.length === 0 ? (
          <div className="py-10 text-center text-subtle">No writers found.</div>
        ) : (
          <ul className="divide-y divide-border">
            {recentWritersList.map((w: any) => {
              const name = w.name || w.user?.full_name || "Writer";
              const initials = name.substring(0, 2).toUpperCase();
              const joined = w.created_at
                ? new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Recently";

              return (
                <li key={w.slug} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Link to="/admin/writers/$slug" params={{ slug: w.slug }} className="shrink-0">
                      <Avatar initials={initials} src={w.profile_photo} size="sm" />
                    </Link>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-sans text-[0.9375rem] font-bold text-heading">
                        <Link
                          to="/admin/writers/$slug"
                          params={{ slug: w.slug }}
                          className="hover:text-primary transition-colors truncate"
                        >
                          {name}
                        </Link>
                        {w.is_verified && <VerifiedBadge />}
                      </p>
                      <p className="text-[0.8125rem] text-subtle truncate">
                        @{w.slug} · Joined {joined} · {w.total_stories ?? 0} stories
                      </p>
                    </div>
                  </div>
                  <ButtonLink
                    to="/admin/writers/$slug"
                    params={{ slug: w.slug }}
                    size="sm"
                    variant="ghostOutline"
                    className="shrink-0 text-xs gap-1"
                  >
                    <User className="size-3.5" /> Check Profile
                  </ButtonLink>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
