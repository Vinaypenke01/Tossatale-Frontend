import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileCheck2,
  LayoutTemplate,
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
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Field, Input, Panel, Textarea, VerifiedBadge } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/profile")({
  head: () =>
    pageHead(
      "Admin Profile & Editorial Access · tossatale admin",
      "Manage your administrative credentials, editorial role, contact preferences and system activity.",
    ),
  component: AdminProfileScreen,
});

function AdminProfileScreen() {
  const [name, setName] = useState("Devika Rao");
  const [role, setRole] = useState("Senior Managing Editor");
  const [email, setEmail] = useState("devika.rao@tossatale.com");
  const [phone, setPhone] = useState("+91 (080) 4123-8901");
  const [location, setLocation] = useState("Varanasi, IN");
  const [bio, setBio] = useState(
    "Overseeing longform curation, series approvals, and writer verification at tossatale. 12 years in literary journalism.",
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Admin profile & editorial settings saved!", {
      description: "Your administrator details and privileges have been updated.",
    });
  };

  const activityLogs = [
    {
      action: "Featured Writers Carousel Updated",
      details: "Added Meera Raghavan and Arjun Sethi to front page spotlight",
      time: "2 hours ago",
    },
    {
      action: "Approved Story Submission",
      details: "Published 'The Last Ghat Reader' to the longform library",
      time: "5 hours ago",
    },
    {
      action: "Writer Verification Issued",
      details: "Granted verified badge to Ila Bhattacharya",
      time: "Yesterday",
    },
    {
      action: "Homepage Announcement Bar Updated",
      details: "Configured audio launch early access banner",
      time: "3 days ago",
    },
  ];

  const adminPrivileges = [
    { name: "Direct Publish", desc: "Bypass review queue and publish directly to library", active: true },
    { name: "Homepage Layout Builder", desc: "Rearrange hero, featured rows, and writer carousels", active: true },
    { name: "Writer Verification", desc: "Grant or revoke verified author status", active: true },
    { name: "Announcement & Footer Control", desc: "Update top banner news and footer contact info", active: true },
    { name: "Review Queue Moderation", desc: "Accept, reject, or request revisions on drafts", active: true },
  ];

  return (
    <AppShell
      role="admin"
      title="Admin Profile"
      blurb="Editorial role settings, platform permissions, and administrative activity log."
      actions={
        <Button onClick={handleSave}>
          <Save className="size-4" /> Save admin settings
        </Button>
      }
    >
      {/* Top Editorial Impact Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stories Reviewed" value="142" delta="+18" hint="this month" />
        <StatCard label="Writers Managed" value="614" hint="active verified authors" />
        <StatCard label="Homepage Features" value="89" hint="published slots" />
        <StatCard label="Editorial Rank" value="Super Admin" hint="Full Access" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1.7fr]">
        {/* Left Column: Admin Profile Details Form */}
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="flex items-start gap-4 border-b border-border pb-5">
              <Avatar initials="DR" size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-heading">{name}</h2>
                  <Badge tone="info">Admin</Badge>
                </div>
                <p className="text-[0.875rem] text-subtle">{email}</p>
                <p className="mt-1 font-sans text-[0.8125rem] font-bold text-primary">{role}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Admin Name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Devika Rao" />
                </Field>
                <Field label="Editorial Title">
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Managing Editor" />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Official Email">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="devika.rao@tossatale.com" />
                </Field>
                <Field label="Phone Extension">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 (080) 4123-8901" />
                </Field>
              </div>

              <Field label="Location / Desk">
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Varanasi, IN" />
              </Field>

              <Field label="Managing Bio" hint="Brief editorial credentials summary">
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Write editorial credentials..." />
              </Field>

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  <Save className="size-4" /> Save Admin Profile
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
                <h2 className="text-xl">Administrative Activity Log</h2>
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
    </AppShell>
  );
}
