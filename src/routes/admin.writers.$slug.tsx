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
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Input, Panel, Tag, VerifiedBadge } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { storiesByWriter, writerBySlug } from "@/lib/data";

export const Route = createFileRoute("/admin/writers/$slug")({
  loader: ({ params }) => {
    const writer = writerBySlug(params.slug);
    if (!writer) throw notFound();
    const stories = storiesByWriter(params.slug);
    return { writer, stories };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return pageHead("Writer not found · tossatale admin", "The requested writer profile does not exist.");
    }
    return pageHead(
      `${loaderData.writer.name} — Writer Profile · tossatale admin`,
      `Managing writer profile for ${loaderData.writer.name}. View personal info, stats and linked stories.`,
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
            <ArrowLeft className="size-4" /> Back to Writers Directory
          </ButtonLink>
        </div>
      </Panel>
    </AppShell>
  );
}

const presetBadges = [
  "Editor's Pick ×7",
  "100k Reads Club",
  "Million Reads Club",
  "Series of the Year 2026",
  "Rising Voice 2026",
  "Debut of the Month",
  "Top Travel Writer",
  "Community Favourite",
  "50k Reads Club",
];

function AdminWriterDetail() {
  const { writer, stories } = Route.useLoaderData();
  const [isVerified, setIsVerified] = useState(writer.verified);
  const [achievements, setAchievements] = useState<string[]>(writer.achievements || []);
  const [newBadgeInput, setNewBadgeInput] = useState("");

  const toggleVerification = () => {
    const nextState = !isVerified;
    setIsVerified(nextState);
    toast.success(
      nextState
        ? `Verified Badge assigned to ${writer.name}!`
        : `Verification badge removed for ${writer.name}`,
    );
  };

  const addBadge = (badgeName: string) => {
    const trimmed = badgeName.trim();
    if (!trimmed) return;
    if (achievements.includes(trimmed)) {
      toast.info(`Badge "${trimmed}" is already assigned to ${writer.name}`);
      return;
    }
    setAchievements([...achievements, trimmed]);
    setNewBadgeInput("");
    toast.success(`Assigned badge "${trimmed}" to ${writer.name}!`);
  };

  const removeBadge = (badgeName: string) => {
    setAchievements(achievements.filter((a) => a !== badgeName));
    toast.info(`Removed badge "${badgeName}" from ${writer.name}`);
  };

  const handleSendEmail = () => {
    toast.info(`Opening email draft for ${writer.name}...`, {
      description: `Targeting ${writer.handle}@tossatale.com`,
    });
  };

  return (
    <AppShell
      role="admin"
      title={writer.name}
      blurb={`${writer.role} · ${writer.location}`}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink to="/admin/writers" variant="ghostOutline">
            <ArrowLeft className="size-4" /> Back to writers
          </ButtonLink>
          <Button variant="ghostOutline" onClick={handleSendEmail}>
            <Mail className="size-4" /> Contact writer
          </Button>
          <Button
            variant={isVerified ? "ghostOutline" : "primary"}
            onClick={toggleVerification}
          >
            {isVerified ? (
              <>
                <UserX className="size-4" /> Revoke Verification
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Verify Writer
              </>
            )}
          </Button>
        </div>
      }
    >
      {/* Top Writer Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Published Stories" value={String(writer.stories)} hint="in tossatale library" />
        <StatCard label="Total Readers / Reads" value={writer.reads} delta="+14%" hint="this month" />
        <StatCard label="Active Followers" value={writer.followers} />
        <StatCard label="Verification Status" value={isVerified ? "Verified" : "Pending"} hint={writer.joined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
        {/* Personal Info Card */}
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="flex items-start gap-4">
              <Avatar initials={writer.initials} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-heading">{writer.name}</h2>
                  {isVerified && <VerifiedBadge />}
                </div>
                <p className="text-[0.875rem] text-subtle">{writer.handle}</p>
                <p className="mt-1 font-sans text-[0.8125rem] font-bold text-primary">{writer.role}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-border pt-5">
              <div>
                <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-subtle uppercase">
                  Biography
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">{writer.bio}</p>
              </div>

              <div className="grid gap-3 pt-2 text-[0.875rem] text-body">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>Location: <strong>{writer.location}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <span>Joined tossatale: <strong>{writer.joined}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary shrink-0" />
                  <span>Public Profile: </span>
                  <Link
                    to="/writers/$slug"
                    params={{ slug: writer.slug }}
                    className="font-bold text-primary underline hover:text-primary-hover"
                  >
                    /writers/{writer.slug}
                  </Link>
                </div>
              </div>

              {/* Achievements & Admin Badge Management */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-primary uppercase flex items-center gap-1.5">
                    <Award className="size-3.5" /> Editorial Badges & Recognition
                  </h3>
                  <Badge tone="info">{achievements.length} Active</Badge>
                </div>

                {/* Assigned Badges List with Remove X */}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {achievements.map((ach) => (
                    <span
                      key={ach}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[0.8125rem] font-bold text-primary"
                    >
                      <Award className="size-3.5" />
                      {ach}
                      <button
                        type="button"
                        onClick={() => removeBadge(ach)}
                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors text-primary hover:text-primary-hover"
                        aria-label={`Remove badge ${ach}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  {achievements.length === 0 && (
                    <p className="text-[0.8125rem] text-subtle italic">No editorial badges assigned yet.</p>
                  )}
                </div>

                {/* Admin Badge Creator & Quick Add */}
                <div className="mt-3.5 rounded-xl border border-border bg-surface-alt/60 p-3 space-y-3">
                  <p className="text-[0.75rem] font-sans font-bold text-heading">
                    Assign Custom Badge to {writer.name}:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={newBadgeInput}
                      onChange={(e) => setNewBadgeInput(e.target.value)}
                      placeholder="e.g. Editor's Pick ×8"
                      className="h-9 text-[0.8125rem]"
                    />
                    <Button
                      size="sm"
                      onClick={() => addBadge(newBadgeInput)}
                      disabled={!newBadgeInput.trim()}
                    >
                      <Plus className="size-3.5" /> Assign
                    </Button>
                  </div>

                  <div>
                    <p className="text-[0.6875rem] text-subtle font-sans uppercase font-bold mb-1.5">
                      Preset Badges Quick-Add:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {presetBadges
                        .filter((b) => !achievements.includes(b))
                        .map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => addBadge(preset)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[0.75rem] font-sans font-medium text-body transition-colors hover:border-primary hover:text-primary hover:bg-primary-light"
                          >
                            <Plus className="size-3 text-primary" /> {preset}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Badge Admin Controls */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3.5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`size-5 ${isVerified ? "text-success" : "text-subtle"}`} />
                    <div>
                      <p className="font-sans text-[0.875rem] font-bold text-heading flex items-center gap-1.5">
                        Verification Badge
                        {isVerified && <VerifiedBadge />}
                      </p>
                      <p className="text-[0.75rem] text-subtle">
                        {isVerified ? "Writer profile displays official blue verified badge" : "Writer has not been granted verified status"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isVerified ? "ghostOutline" : "primary"}
                    onClick={toggleVerification}
                  >
                    {isVerified ? "Revoke Verification" : "Grant Verified Badge"}
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              {writer.socials && writer.socials.length > 0 && (
                <div className="pt-3">
                  <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-subtle uppercase">
                    Social & Portfolio Channels
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {writer.socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 font-sans text-[0.8125rem] font-bold text-body transition-colors hover:border-primary hover:text-primary"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Linked Stories Section */}
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl">Stories by {writer.name}</h2>
                <p className="mt-1 text-[0.8125rem] text-subtle">
                  Showing {stories.length} linked longform piece{stories.length === 1 ? "" : "s"} in the tossatale index.
                </p>
              </div>
              <ButtonLink to="/admin/editor" size="sm">
                <PenLine className="size-4" /> Draft new story
              </ButtonLink>
            </div>

            {stories.length === 0 ? (
              <div className="py-12 text-center text-subtle">
                <BookOpen className="mx-auto size-10 text-subtle/50" />
                <p className="mt-3 font-sans text-[0.9375rem] font-bold">No linked stories cataloged yet</p>
                <p className="mt-1 text-[0.8125rem]">
                  Stories assigned to writer handle <code>@{writer.slug}</code> will show up here automatically.
                </p>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-border">
                {stories.map((story) => (
                  <li key={story.slug} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/stories/$slug"
                            params={{ slug: story.slug }}
                            className="font-sans text-[1rem] font-bold text-heading hover:text-primary line-clamp-1"
                          >
                            {story.title}
                          </Link>
                          <p className="mt-1 text-[0.8125rem] text-body line-clamp-1">{story.dek}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.75rem] text-subtle">
                            <Badge tone="neutral">{story.category}</Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" /> {story.readingTime} min read
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" /> {story.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="size-3" /> {story.likes} likes
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <ButtonLink
                          to="/stories/$slug"
                          params={{ slug: story.slug }}
                          size="sm"
                          variant="ghostOutline"
                        >
                          View piece
                        </ButtonLink>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
