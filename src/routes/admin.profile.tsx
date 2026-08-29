import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileCheck2,
  KeyRound,
  LayoutTemplate,
  Loader2,
  Lock,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  // Password Reset with OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

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

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const targetEmail = email;
      const res = await api.post("/auth/password/send-otp/", { email: targetEmail });
      return res.data;
    },
    onSuccess: (data: any) => {
      setOtpSent(true);
      setOtpCountdown(60);
      const dbg = data?.data?.debug_otp || data?.debug_otp;
      if (dbg) {
        setDebugOtp(dbg);
      }
      toast.success("Verification OTP sent!", {
        description: `Please check your administrative email inbox at ${email}.`,
      });
    },
    onError: (err: any) => {
      toast.error("Could not send OTP", { description: err.message || "Please try again shortly." });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!otpCode.trim()) {
        throw new Error("Please enter the 6-digit OTP code sent to your email.");
      }
      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirm password do not match.");
      }

      return await api.post("/auth/password/reset-with-otp/", {
        email,
        otp: otpCode.trim(),
        new_password: newPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password updated successfully!", {
        description: "Your administrative credentials have been securely updated.",
      });
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
      setDebugOtp(null);
    },
    onError: (err: any) => {
      toast.error("Password update failed", { description: err.message || "Invalid OTP code." });
    },
  });

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

  const firstInitial = firstName[0] || displayName?.[0] || "A";
  const secondInitial = lastName[0] || displayName?.split(" ")[1]?.[0] || "D";
  const initials = `${firstInitial}${secondInitial}`.toUpperCase();

  return (
    <AppShell
      role="admin"
      title="Admin Profile"
      blurb="Editorial role settings, platform permissions, security credentials, and administrative activity log."
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

                <Field label="Official Email (Permanent Account Identifier)">
                  <div className="relative">
                    <Input
                      value={email}
                      disabled
                      readOnly
                      className="bg-surface-alt/60 text-subtle cursor-not-allowed pl-9 font-medium"
                    />
                    <Lock className="size-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
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

          {/* Right Column: Password Reset with OTP & Activity Logs */}
          <div className="space-y-6">
            {/* Security & Password Reset with OTP */}
            <Panel className="p-6">
              <div className="border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <h3 className="text-lg font-display font-bold text-heading">Security & Credentials</h3>
                </div>
                <p className="mt-1 text-xs text-subtle">
                  Update administrative password with a secure 6-digit OTP sent to your permanent email.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface-alt/40 p-4">
                  <div>
                    <p className="font-sans text-sm font-bold text-heading">Admin Email</p>
                    <p className="text-xs text-subtle mt-0.5">{email || "Configuring..."}</p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => sendOtpMutation.mutate()}
                    disabled={sendOtpMutation.isPending || otpCountdown > 0}
                    variant={otpSent ? "ghostOutline" : "primary"}
                    size="sm"
                    className="shrink-0 gap-1.5"
                  >
                    <KeyRound className="size-3.5" />
                    {sendOtpMutation.isPending
                      ? "Sending OTP..."
                      : otpCountdown > 0
                      ? `Resend OTP (${otpCountdown}s)`
                      : otpSent
                      ? "Resend Code"
                      : "Send OTP to Email"}
                  </Button>
                </div>

                {debugOtp && (
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary font-mono flex items-center justify-between">
                    <span>Development Test OTP: <strong>{debugOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(debugOtp)}
                      className="underline font-sans font-bold hover:text-heading ml-2 cursor-pointer"
                    >
                      Fill Code
                    </button>
                  </div>
                )}

                {otpSent && (
                  <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-success">
                      <CheckCircle2 className="size-4" /> OTP verification code has been dispatched.
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="6-Digit OTP Code" hint="Check email inbox">
                        <Input
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.trim())}
                          maxLength={6}
                          placeholder="123456"
                          className="font-mono text-center tracking-widest text-lg font-bold"
                        />
                      </Field>

                      <Field label="New Password" hint="Min 8 characters">
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </Field>

                      <Field label="Confirm Password">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </Field>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="ghostOutline"
                        size="sm"
                        onClick={() => setOtpSent(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => resetPasswordMutation.mutate()}
                        disabled={resetPasswordMutation.isPending || !otpCode || !newPassword || !confirmPassword}
                        size="sm"
                        className="gap-1.5"
                      >
                        <Lock className="size-3.5" />
                        {resetPasswordMutation.isPending ? "Updating Password..." : "Verify OTP & Update Password"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Panel>

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
