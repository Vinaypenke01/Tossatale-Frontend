import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  Flag,
  Loader2,
  Power,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Panel } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () =>
    pageHead(
      "Admin overview · tossatale",
      "Editorial control room for the tossatale storytelling platform.",
    ),
  component: AdminOverview,
});

function AdminOverview() {
  const queryClient = useQueryClient();

  // Submissions queue
  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin-overview-queue"],
    queryFn: async () => {
      const res = await api.get("/admin/reviews/queue/");
      return res.data?.results || res.data || [];
    },
  });

  // Fetch live Platform Analytics Overview
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

  // Fetch site settings (Maintenance / Under Construction mode)
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

  const storiesList = queueData && Array.isArray(queueData) ? queueData : [];

  return (
    <AppShell
      role="admin"
      title="Editorial control room"
      blurb="Everything waiting on an editor this week — submissions, features, and the health of the library."
      actions={
        <>
          <ButtonLink to="/admin/review-queue" variant="primary">
            Open review queue
          </ButtonLink>
          <ButtonLink to="/admin/homepage-builder" variant="soft">
            Curate homepage
          </ButtonLink>
        </>
      }
    >
      {/* ── Under Construction / Platform Status Banner ── */}
      <Panel
        className={cn(
          "p-6 transition-all border-2",
          isMaintenanceMode
            ? "border-amber-500/40 bg-amber-500/5 shadow-lg shadow-amber-500/5"
            : "border-emerald-500/20 bg-surface",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-2xl",
                isMaintenanceMode
                  ? "bg-amber-500/20 text-amber-500"
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
                  tone={isMaintenanceMode ? "warning" : "success"}
                  className="font-sans text-[0.6875rem]"
                >
                  {isMaintenanceMode ? "Maintenance Enabled" : "Public Live"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-subtle leading-relaxed">
                {isMaintenanceMode
                  ? "Public visitors and readers are currently redirected to the Under Construction splash screen. Only administrators can access pages."
                  : "The website is live. All public stories, videos, series, and blogs are active and accessible."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant={isMaintenanceMode ? "primary" : "ghostOutline"}
              disabled={toggleMaintenanceMutation.isPending || isSettingsLoading}
              onClick={() => toggleMaintenanceMutation.mutate(!isMaintenanceMode)}
              className={cn(
                "gap-2 font-bold cursor-pointer transition-all h-10 px-4",
                isMaintenanceMode
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
              )}
            >
              {toggleMaintenanceMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Power className="size-4" />
              )}
              {isMaintenanceMode ? "Disable Under Construction (Go Live)" : "Enable Under Construction"}
            </Button>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={String(storiesList.length)} hint="pending review" />
        <StatCard label="Published Stories" value={String(platformSummary.total_published_stories ?? 0)} hint="live in library" />
        <StatCard label="Total Platform Views" value={platformSummary.total_views ? Number(platformSummary.total_views).toLocaleString() : "0"} hint="all-time reads" />
        <StatCard label="Active Writers" value={String(platformSummary.total_writers ?? 0)} hint="registered authors" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-heading">Newest submissions</h2>
            <Link
              to="/admin/review-queue"
              className="inline-flex items-center gap-1 font-sans text-[0.875rem] font-bold text-primary"
            >
              All {storiesList.length} <ArrowUpRight className="size-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-subtle font-medium">Loading submissions...</div>
          ) : storiesList.length === 0 ? (
            <EmptySectionFallback
              icon="book"
              title="No Pending Submissions"
              description="There are currently no new story submissions waiting for editorial review."
            />
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {storiesList.slice(0, 5).map((s: any) => (
                <li key={s.id || s.slug} className="flex items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">{s.title}</p>
                    <p className="mt-1 text-[0.8125rem] text-subtle">
                      {s.writer?.name || s.writer?.user?.full_name || "Author"} · {s.category?.name || "General"} · {s.estimated_reading_time || 5} min
                    </p>
                  </div>
                  <Badge tone="warning">{s.status || "Pending"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-xl font-display font-bold text-heading">Editorial Snapshot</h2>
            <ul className="mt-4 space-y-3 text-[0.9375rem] text-body">
              <li className="flex items-center gap-3">
                <FileCheck2 className="size-4 text-primary" /> {storiesList.length} submissions in review queue
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="size-4 text-primary" /> {platformSummary.total_published_stories ?? 0} published stories in library
              </li>
              <li className="flex items-center gap-3">
                <Flag className="size-4 text-warning" /> {platformSummary.total_writers ?? 0} registered authors on platform
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
