import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Heart,
  Mail,
  MapPin,
  PenLine,
  Plus,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Input, Panel, Tag, VerifiedBadge } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/writers/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.get(`/admin/writers/${params.slug}/`);
      if (res.data) {
        return { writer: res.data };
      }
    } catch {
      // Fallback
    }
    return { writer: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.writer) {
      return pageHead("Writer not found · tossatale admin", "The requested writer profile does not exist.");
    }
    const name = loaderData.writer.name || loaderData.writer.user?.full_name || "Writer";
    return pageHead(
      `${name} — Writer Profile · tossatale admin`,
      `Managing writer profile for ${name}. View personal info, stats and linked stories.`,
    );
  },
  notFoundComponent: WriterNotFound,
  component: AdminWriterDetail,
});

function WriterNotFound() {
  return (
    <AppShell role="admin" title="Writer Not Found">
      <Panel className="p-12 text-center">
        <h2 className="text-2xl font-display text-heading">Writer profile not found</h2>
        <p className="mt-2 text-subtle">
          The requested writer does not exist or may have been removed.
        </p>
        <div className="mt-6">
          <ButtonLink to="/admin/writers">
            <ArrowLeft className="size-4" /> Back to writers directory
          </ButtonLink>
        </div>
      </Panel>
    </AppShell>
  );
}

function AdminWriterDetail() {
  const loaderData = Route.useLoaderData();
  const writer = loaderData?.writer;

  const { data: writerStories, isLoading } = useQuery({
    queryKey: ["admin-writer-stories", writer?.slug],
    queryFn: async () => {
      if (!writer?.slug) return [];
      const res = await api.get(`/admin/stories/?writer=${writer.slug}`);
      return res.data?.results || res.data || [];
    },
    enabled: Boolean(writer?.slug),
  });

  if (!writer) {
    return <WriterNotFound />;
  }

  const name = writer.name || writer.user?.full_name || "Writer";
  const initials = name.substring(0, 2).toUpperCase();
  const storiesList = (writerStories && Array.isArray(writerStories)) ? writerStories : [];

  return (
    <AppShell
      role="admin"
      title={name}
      blurb={`Writer profile management · @${writer.slug}`}
      actions={
        <div className="flex gap-2">
          <ButtonLink to="/admin/writers" variant="ghostOutline">
            <ArrowLeft className="size-4" /> Directory
          </ButtonLink>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Stories" value={String(writer.total_stories || storiesList.length)} />
        <StatCard label="Followers" value={String(writer.total_followers || 0)} />
        <StatCard label="Total Reads" value={String(writer.total_reads || 0)} />
        <StatCard label="Status" value={writer.is_verified ? "Verified" : "Pending"} />
      </div>

      <Panel className="p-6">
        <div className="flex items-start gap-6">
          <Avatar initials={initials} gender={writer.gender} src={writer.profile_photo} size="xl" />
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-display font-bold text-heading">
              {name}
              {writer.is_verified && <VerifiedBadge />}
            </h2>
            <p className="mt-1 text-[0.875rem] text-subtle">@{writer.slug} · Author Profile</p>
            <p className="mt-3 text-[0.9375rem] text-body">{writer.bio || "Registered author profile."}</p>
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <h2 className="text-xl font-display font-bold text-heading">Stories by {name}</h2>
        {isLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading stories...</div>
        ) : storiesList.length === 0 ? (
          <EmptySectionFallback
            icon="write"
            title="No Stories Found"
            description="This writer has not created any stories in the system yet."
          />
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {storiesList.map((s: any) => (
              <li key={s.id || s.slug} className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-display font-bold text-heading text-lg">{s.title}</h3>
                  <p className="text-[0.8125rem] text-subtle">
                    {s.status} · {s.category?.name || "General"} · {s.estimated_reading_time || 5} min read
                  </p>
                </div>
                <Badge tone={s.status === "PUBLISHED" ? "success" : "warning"}>{s.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
