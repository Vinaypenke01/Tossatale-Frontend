import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  Eye,
  Globe,
  Heart,
  Mail,
  MapPin,
  PenLine,
  Phone,
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
import { storiesByWriter, writerBySlug } from "@/lib/data";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

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

  const { data: profileData } = useQuery({
    queryKey: ["writer-profile-me"],
    queryFn: async () => {
      const res = await api.get("/writer/profile/");
      return res.data;
    },
  });

  const [name, setName] = useState(user?.full_name || "Writer");
  const [handle, setHandle] = useState("@writer");
  const [role, setRole] = useState("Longform Storyteller");
  const [location, setLocation] = useState("India");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [bio, setBio] = useState("");

  const [website, setWebsite] = useState("");
  const [substack, setSubstack] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [medium, setMedium] = useState("");
  const [youtube, setYoutube] = useState("");

  useEffect(() => {
    if (profileData) {
      setName(profileData.user?.full_name || profileData.name || user?.full_name || "Writer");
      setBio(profileData.bio || "");
      setWebsite(profileData.website_url || "");
      setInstagram(profileData.instagram_url || "");
      setTwitter(profileData.x_url || "");
      setLinkedin(profileData.linkedin_url || "");
      setYoutube(profileData.youtube_url || "");
    }
  }, [profileData, user]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.patch("/writer/profile/", payload);
    },
    onSuccess: () => {
      toast.success("Writer profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["writer-profile-me"] });
    },
    onError: (err: any) => {
      toast.error("Failed to update profile", { description: err.message });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      bio,
      website_url: website,
      instagram_url: instagram,
      x_url: twitter,
      linkedin_url: linkedin,
      youtube_url: youtube,
    });
  };

  const activeSocials = [
    { label: "Website", href: website },
    { label: "Substack", href: substack },
    { label: "Instagram", href: instagram },
    { label: "X (Twitter)", href: twitter },
    { label: "LinkedIn", href: linkedin },
    { label: "Medium", href: medium },
    { label: "YouTube", href: youtube },
  ].filter((s) => Boolean(s.href.trim()));

  return (
    <AppShell
      role="writer"
      title="My Writer Profile"
      blurb="Manage your author bio, location, contact numbers, social links, and view your editorial statistics."
      actions={
        <div className="flex items-center gap-3">
          <ButtonLink to="/writers/$slug" params={{ slug: profileData?.slug || "writer" }} variant="ghostOutline">
            <Eye className="size-4" /> View public profile
          </ButtonLink>
          <Button onClick={handleSaveProfile} disabled={updateMutation.isPending}>
            <Save className="size-4" /> {updateMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Stories" value={String(profileData?.total_published_stories || 42)} hint="in tossatale library" />
        <StatCard label="Total Readers / Reads" value={String(profileData?.total_reads || "1.2M")} delta="+18%" hint="this month" />
        <StatCard label="Total Likes" value={String(profileData?.total_likes || "18.4k")} delta="+340" hint="new this week" />
        <StatCard label="Verification Status" value={profileData?.is_verified ? "Verified Author" : "Pending"} hint="Member" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1.7fr]">
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="flex items-start gap-4 border-b border-border pb-5">
              <Avatar initials={(name || "W").substring(0, 2).toUpperCase()} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-heading">{name}</h2>
                  {profileData?.is_verified && <VerifiedBadge />}
                </div>
                <p className="text-[0.875rem] text-subtle">{handle}</p>
                <p className="mt-1 font-sans text-[0.8125rem] font-bold text-primary">{role}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Meera Raghavan" />
                </Field>
                <Field label="Handle">
                  <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@meera.writes" />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Primary Beat / Role">
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Longform & memoir" />
                </Field>
                <Field label="Location">
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Varanasi, IN" />
                </Field>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-subtle uppercase mb-3">
                  Personal Contact Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email Address">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="writer@tossatale.com"
                    />
                  </Field>
                  <Field label="Contact Phone Number">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 (080) 9876-5432"
                    />
                  </Field>
                </div>
              </div>

              <Field label="Author Biography" hint="Displayed on your public profile and story bylines">
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Write a short author bio..." />
              </Field>

              <div className="border-t border-border pt-4">
                <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-primary uppercase mb-3 flex items-center gap-1.5">
                  <Globe className="size-3.5" /> Social Media & Portfolio Links ({activeSocials.length} Active)
                </h3>
                <div className="space-y-3">
                  <Field label="Personal Website / Portfolio">
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </Field>
                  <Field label="Substack Newsletter">
                    <Input
                      value={substack}
                      onChange={(e) => setSubstack(e.target.value)}
                      placeholder="https://yourname.substack.com"
                    />
                  </Field>
                  <Field label="Instagram Profile">
                    <Input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </Field>
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
                  <Field label="Medium / Publication">
                    <Input
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      placeholder="https://medium.com/@username"
                    />
                  </Field>
                  <Field label="YouTube / Vimeo Channel">
                    <Input
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="https://youtube.com/@username"
                    />
                  </Field>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={updateMutation.isPending} className="w-full">
                  <Save className="size-4" /> {updateMutation.isPending ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-6">
            <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-primary uppercase flex items-center gap-1.5">
              <Globe className="size-3.5" /> Public Social Links & Contact Channels
            </h3>
            <p className="mt-1 text-[0.8125rem] text-subtle">
              These social links appear on your public author page for readers and editors.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeSocials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 font-sans text-[0.8125rem] font-bold text-body transition-colors hover:border-primary hover:text-primary hover:bg-primary-light"
                >
                  {s.label}
                  <ExternalLink className="size-3 text-subtle" />
                </a>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
