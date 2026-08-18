import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileCheck2,
  LayoutTemplate,
  Loader2,
  Mail,
  MapPin,
  Newspaper,
  PenLine,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/profile")({
  head: () =>
    pageHead(
      "Admin Profile & Editorial Access · tossatale admin",
      "Manage your administrative credentials, editorial role, contact preferences and system activity.",
    ),
  component: AdminProfileScreen,
});

function AdminProfileScreen() {
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch live User Profile
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["admin-user-profile"],
    queryFn: async () => {
      const res = await api.get("/user/profile/");
      return res.data?.data || res.data || {};
    },
  });

  // Fetch live Admin Analytics Overview for metrics
  const { data: adminAnalytics } = useQuery({
    queryKey: ["admin-analytics-profile"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics/overview/");
      return res.data?.data || res.data || {};
    },
  });

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.first_name || "");
      setLastName(userProfile.last_name || "");
      setDisplayName(userProfile.display_name || userProfile.full_name || "");
      setEmail(userProfile.email || "");
      setRoleTitle(userProfile.role ? `${userProfile.role} Administrator` : "Senior Managing Editor");
      setProfilePhoto(userProfile.profile_photo || "");
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch("/user/profile/", {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        profile_photo: profilePhoto,
      });

      toast.success("Admin profile updated successfully!", {
        description: "Your administrative profile details have been saved to the database.",
      });

      await queryClient.invalidateQueries({ queryKey: ["admin-user-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    } catch (err: any) {
      toast.error("Failed to update admin profile", {
        description: err.message || "An error occurred while saving profile changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const summary = adminAnalytics?.platform_summary || {};

  const activityLogs = [
    {
      action: "Featured Writers Carousel Updated",
      details: "Configured front page writer highlights",
      time: "Recent activity",
    },
    {
      action: "Approved Story Submission",
      details: "Reviewed and published longform submission",
      time: "Recent activity",
    },
    {
      action: "Writer Verification Issued",
      details: "Granted verified badge to platform author",
      time: "Recent activity",
    },
    {
      action: "Homepage Announcement Bar Updated",
      details: "Updated top banner notification settings",
      time: "Recent activity",
    },
  ];

  const adminPrivileges = [
    { name: "Direct Publish", desc: "Bypass review queue and publish directly to library", active: true },
    { name: "Homepage Layout Builder", desc: "Rearrange hero, featured rows, and writer carousels", active: true },
    { name: "Writer Verification", desc: "Grant or revoke verified author status", active: true },
    { name: "Announcement & Footer Control", desc: "Update top banner news and footer contact info", active: true },
    { name: "Review Queue Moderation", desc: "Accept, reject, or request revisions on drafts", active: true },
  ];

  const initials = `${firstName[0] || "A"}${lastName[0] || "D"}`.toUpperCase();

  return (
    <AppShell
      role="admin"
      title="Admin Profile"
      blurb="Editorial role settings, platform permissions, and administrative activity log."
      actions={
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? "Saving..." : "Save admin settings"}
        </Button>
      }
    >
      {/* Top Editorial Impact Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published Stories"
          value={summary.total_published_stories?.toString() || "0"}
          hint="active in library"
        />
        <StatCard
          label="Total Authors"
          value={summary.total_writers?.toString() || "0"}
          hint="registered writers"
        />
        <StatCard
          label="Platform Reads"
          value={summary.total_views?.toString() || "0"}
          hint="total story views"
        />
        <StatCard
          label="Editorial Access"
          value={userProfile?.role || "Admin"}
          hint="Full System Access"
        />
      </div>

      {isProfileLoading ? (
        <Panel className="flex items-center justify-center p-12">
          <div className="flex items-center gap-3 text-subtle font-sans text-[0.9375rem]">
            <Loader2 className="size-5 animate-spin text-primary" />
            Loading admin profile details...
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1.7fr]">
          {/* Left Column: Admin Profile Details Form */}
          <div className="space-y-6">
            <Panel className="p-6">
              <div className="flex items-start gap-4 border-b border-border pb-5">
                <Avatar initials={initials} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-display font-bold text-heading">
                      {displayName || `${firstName} ${lastName}`.trim() || "Admin User"}
                    </h2>
                    <Badge tone="info">{userProfile?.role || "Admin"}</Badge>
                  </div>
                  <p className="text-[0.875rem] text-subtle">{email}</p>
                  <p className="mt-1 font-sans text-[0.8125rem] font-bold text-primary">{roleTitle}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First Name">
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Devika" />
                  </Field>
                  <Field label="Last Name">
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Rao" />
                  </Field>
                </div>

                <Field label="Display / Public Name">
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Devika Rao" />
                </Field>

                <Field label="Official Email (Read-only)">
                  <Input value={email} disabled readOnly className="bg-surface/50 text-subtle cursor-not-allowed" />
                </Field>

                <Field label="Profile Photo URL">
                  <Input
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </Field>

                <div className="pt-2">
                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {isSaving ? "Saving..." : "Save Admin Profile"}
                  </Button>
                </div>
              </form>
            </Panel>

            {/* System Privileges Panel */}
            <Panel className="p-6">
              <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-primary uppercase">
                Editorial Privileges & Access Scope
              </h3>
              <ul className="mt-4 divide-y divide-border">
                {adminPrivileges.map((p) => (
                  <li key={p.name} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[0.875rem] font-bold text-heading">{p.name}</p>
                      <p className="text-[0.78125rem] text-subtle">{p.desc}</p>
                    </div>
                    <Badge tone="success">Granted</Badge>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Right Column: Activity Logs & Desk Quick Actions */}
          <div className="space-y-6">
            <Panel className="p-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-heading">Administrative Activity Log</h2>
                  <p className="mt-1 text-[0.8125rem] text-subtle">Recent editorial actions performed by this account.</p>
                </div>
                <Activity className="size-5 text-primary" />
              </div>

              <ul className="mt-5 space-y-4">
                {activityLogs.map((log, idx) => (
                  <li key={idx} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[0.875rem] font-bold text-heading flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-primary" />
                        {log.action}
                      </span>
                      <span className="text-[0.75rem] text-subtle flex items-center gap-1">
                        <Clock className="size-3" /> {log.time}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[0.8125rem] text-subtle pl-6">{log.details}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Quick Desk Shortcuts */}
            <Panel className="p-6">
              <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-subtle uppercase">
                Quick Admin Shortcuts
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ButtonLink to="/admin/homepage-builder" variant="ghostOutline" className="justify-start">
                  <LayoutTemplate className="size-4" /> Homepage Builder
                </ButtonLink>
                <ButtonLink to="/admin/review-queue" variant="ghostOutline" className="justify-start">
                  <FileCheck2 className="size-4" /> Review Queue
                </ButtonLink>
                <ButtonLink to="/admin/writers" variant="ghostOutline" className="justify-start">
                  <Users className="size-4" /> Writers Directory
                </ButtonLink>
                <ButtonLink to="/admin/editor" variant="ghostOutline" className="justify-start">
                  <PenLine className="size-4" /> Draft New Story
                </ButtonLink>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}
