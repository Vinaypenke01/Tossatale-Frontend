import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Heart,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  PenLine,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Field, Input, Panel, Textarea, VerifiedBadge } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/writer/profile")({
  head: () =>
    pageHead(
      "My Profile & Studio Settings · tossatale writer",
      "Manage your public writer profile, bio, personal info, contact numbers, social links, and publishing activity.",
    ),
  component: WriterProfileScreen,
});

function WriterProfileScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["writer-profile-me"],
    queryFn: async () => {
      const res = await api.get("/writer/profile/");
      return res.data?.data || res.data;
    },
  });

  const [name, setName] = useState(user?.full_name || "Writer");
  const [handle, setHandle] = useState("@writer");
  const [role, setRole] = useState("Longform Storyteller");
  const [location, setLocation] = useState("India");
  const [email, setEmail] = useState(user?.email || "");
  const [gender, setGender] = useState("OTHER");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");

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

  useEffect(() => {
    if (profileData) {
      setName(profileData.name || profileData.user?.full_name || user?.full_name || "Writer");
      setBio(profileData.bio || "");
      setGender(profileData.gender || "OTHER");
      setProfilePhoto(profileData.profile_photo || "");
      setWebsite(profileData.website_url || "");
      setInstagram(profileData.instagram_url || "");
      setTwitter(profileData.x_url || "");
      setLinkedin(profileData.linkedin_url || "");
      setYoutube(profileData.youtube_url || "");
      if (profileData.slug) {
        setHandle(`@${profileData.slug}`);
      }
      if (user?.email) {
        setEmail(user.email);
      }
    }
  }, [profileData, user]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.patch("/writer/profile/", payload);
    },
    onSuccess: () => {
      toast.success("Writer profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["writer-profile-me"] });
      queryClient.invalidateQueries({ queryKey: ["writer-dashboard-profile"] });
    },
    onError: (err: any) => {
      toast.error("Failed to update profile", { description: err.message || "Please check your inputs." });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const targetEmail = user?.email || email;
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
        description: `Please check your email inbox at ${user?.email || email}.`,
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

      const targetEmail = user?.email || email;
      return await api.post("/auth/password/reset-with-otp/", {
        email: targetEmail,
        otp: otpCode.trim(),
        new_password: newPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password updated successfully!", {
        description: "Your credentials have been securely updated.",
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name,
      gender,
      bio,
      profile_photo: profilePhoto,
      website_url: website,
      instagram_url: instagram,
      x_url: twitter,
      linkedin_url: linkedin,
      youtube_url: youtube,
    });
  };

  const activeSocials = [
    { label: "Website", href: website, icon: Globe },
    { label: "Instagram", href: instagram, icon: Globe },
    { label: "X (Twitter)", href: twitter, icon: Globe },
    { label: "LinkedIn", href: linkedin, icon: Globe },
    { label: "YouTube", href: youtube, icon: Globe },
  ].filter((s) => Boolean(s.href?.trim()));

  return (
    <AppShell
      role="writer"
      title="My Writer Profile"
      blurb="Manage your author bio, location, contact numbers, social links, and security settings."
      actions={
        <div className="flex items-center gap-2.5">
          <ButtonLink to="/writers/$slug" params={{ slug: profileData?.slug || "writer" }} variant="ghostOutline" size="sm">
            <Eye className="size-4" /> View public profile
          </ButtonLink>
          <Button onClick={handleSaveProfile} disabled={updateMutation.isPending} size="sm" className="gap-2">
            <Save className="size-4" /> {updateMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      }
    >
      {/* Quick Stats Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Stories" value={String(profileData?.total_published_stories || profileData?.total_stories || 0)} hint="in tossatale library" />
        <StatCard label="Total Readers / Reads" value={String(profileData?.total_reads || "0")} hint="story views" />
        <StatCard label="Writer Supporters" value={String(profileData?.total_supports || profileData?.total_likes || "0")} hint="readers supporting your work" />
        <StatCard label="Verification Status" value={profileData?.is_verified ? "Verified Author" : "Standard"} hint="Editorial status" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-start">
        {/* Left Column: Author Identity Card & Live Preview */}
        <div className="space-y-4">
          <Panel className="p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar
                initials={(name || "W").substring(0, 2).toUpperCase()}
                gender={gender}
                src={profilePhoto}
                size="xl"
                className="shadow-md"
              />
              <h2 className="mt-3.5 flex items-center gap-1.5 text-xl font-display font-bold text-heading">
                {name}
                {profileData?.is_verified && <VerifiedBadge />}
              </h2>
              <p className="text-[0.8125rem] text-subtle">{handle} · {location}</p>
              <p className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-[0.75rem] font-bold text-primary">
                {role}
              </p>

              {bio && (
                <p className="mt-3 text-[0.875rem] text-body line-clamp-3 italic">
                  "{bio}"
                </p>
              )}
            </div>

            {/* Quick Public Socials */}
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-[0.6875rem] font-black uppercase tracking-wider text-subtle mb-2">
                Public Socials ({activeSocials.length})
              </p>
              {activeSocials.length === 0 ? (
                <p className="text-[0.8125rem] text-subtle italic">No social links added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {activeSocials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-alt px-2.5 py-1 text-[0.75rem] font-bold text-body hover:border-primary hover:text-primary transition-colors"
                    >
                      {s.label}
                      <ExternalLink className="size-2.5 text-subtle" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          {/* Quick Help Card */}
          <Panel className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[0.875rem] font-bold text-heading">Author Verification</h4>
                <p className="mt-1 text-[0.8125rem] text-subtle leading-relaxed">
                  Verified badges are granted by Tossatale editors upon reviewing published story quality.
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Settings Form & Password Reset with OTP */}
        <div className="space-y-6">
          <Panel className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Section 1: Basic Information */}
              <div>
                <h3 className="font-sans text-[0.75rem] font-black tracking-wider text-primary uppercase mb-3">
                  1. Storyteller Identity
                </h3>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Full Author Name">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Meera Raghavan" />
                  </Field>
                  <Field label="Handle / Profile Slug">
                    <Input value={handle} onChange={(e) => setHandle(e.target.value)} disabled placeholder="@writer" />
                  </Field>
                </div>

                <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
                  <Field label="Registered Email (Permanent Account Identifier)">
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
                  <Field label="Primary Beat / Role">
                    <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Longform Storyteller" />
                  </Field>
                </div>

                {/* Gender Selector */}
                <div className="mt-3.5">
                  <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                    Gender Selection <span className="text-subtle font-normal">(Used for default storyteller avatar)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "MALE", label: "Male", icon: "👨" },
                      { id: "FEMALE", label: "Female", icon: "👩" },
                      { id: "OTHER", label: "Other", icon: "🧑" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl border py-2 text-[0.8125rem] font-bold transition-all",
                          gender === g.id
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                            : "border-border bg-surface text-body hover:bg-surface-hover hover:text-heading"
                        )}
                      >
                        <span>{g.icon}</span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Biography & Photo URL */}
              <div className="border-t border-border pt-4">
                <h3 className="font-sans text-[0.75rem] font-black tracking-wider text-primary uppercase mb-3">
                  2. Biography & Avatar
                </h3>
                <Field label="Author Biography" hint="Displayed on your public profile and story bylines">
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Write a short author bio..."
                  />
                </Field>

                <div className="mt-3.5">
                  <Field label="Profile Photo URL" hint="Leave empty to use automatic gender avatar">
                    <Input
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    />
                  </Field>
                </div>
              </div>

              {/* Section 3: Social & Portfolio Channels */}
              <div className="border-t border-border pt-4">
                <h3 className="font-sans text-[0.75rem] font-black tracking-wider text-primary uppercase mb-3 flex items-center gap-1.5">
                  <Globe className="size-3.5" /> 3. Social Media & Portfolio Links
                </h3>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Personal Website / Portfolio">
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </Field>
                  <Field label="Instagram Profile">
                    <Input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </Field>
                </div>

                <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
                  <Field label="X (Twitter)">
                    <Input
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://x.com/username"
                    />
                  </Field>
                  <Field label="LinkedIn Profile">
                    <Input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </Field>
                </div>

                <div className="mt-3.5">
                  <Field label="YouTube / Video Channel">
                    <Input
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="https://youtube.com/@username"
                    />
                  </Field>
                </div>
              </div>

              {/* Submit Bar */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                  <Save className="size-4" /> {updateMutation.isPending ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </Panel>

          {/* Section 4: Security & Password Reset with OTP */}
          <Panel className="p-6">
            <div className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="text-lg font-display font-bold text-heading">Security & Password Reset</h3>
              </div>
              <p className="mt-1 text-xs text-subtle">
                To update your account password, request a secure 6-digit OTP verification code to your registered email.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface-alt/40 p-4">
                <div>
                  <p className="font-sans text-sm font-bold text-heading">Registered Email Address</p>
                  <p className="text-xs text-subtle mt-0.5">{user?.email || email || "Not configured"}</p>
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
                    className="underline font-sans font-bold hover:text-heading ml-2"
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading"
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
        </div>
      </div>
    </AppShell>
  );
}
