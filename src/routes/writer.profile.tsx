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
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Field, Input, Panel, Textarea, VerifiedBadge } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { storiesByWriter, writerBySlug } from "@/lib/data";

export const Route = createFileRoute("/writer/profile")({
  head: () =>
    pageHead(
      "My Profile & Studio Settings · tossatale writer",
      "Manage your public writer profile, bio, personal info, contact numbers, social links, and publishing activity.",
    ),
  component: WriterProfileScreen,
});

function WriterProfileScreen() {
  // Default to Meera Raghavan writer data for demonstration
  const defaultWriter = writerBySlug("meera-raghavan") ?? {
    slug: "meera-raghavan",
    name: "Meera Raghavan",
    initials: "MR",
    handle: "@meera.writes",
    verified: true,
    role: "Longform & memoir",
    location: "Varanasi, IN",
    bio: "I write about the small rooms of ordinary lives — grandmothers, ledgers, monsoon lanes. Nine years in print, three in longform serials.",
    stories: 42,
    followers: "18.4k",
    reads: "1.2M",
    joined: "March 2021",
    socials: [
      { label: "Website", href: "https://meeraraghavan.com" },
      { label: "Instagram", href: "https://instagram.com/meera.writes" },
      { label: "Substack", href: "https://meera.substack.com" },
    ],
    achievements: ["Editor's Pick ×7", "100k Reads Club", "Series of the Year 2025"],
  };

  const [name, setName] = useState(defaultWriter.name);
  const [handle, setHandle] = useState(defaultWriter.handle);
  const [role, setRole] = useState(defaultWriter.role);
  const [location, setLocation] = useState(defaultWriter.location);
  const [email, setEmail] = useState("meera.raghavan@tossatale.com");
  const [phone, setPhone] = useState("+91 (080) 9876-5432");
  const [bio, setBio] = useState(defaultWriter.bio);

  // Social & Portfolio Link States
  const [website, setWebsite] = useState("https://meeraraghavan.com");
  const [substack, setSubstack] = useState("https://meera.substack.com");
  const [instagram, setInstagram] = useState("https://instagram.com/meera.writes");
  const [twitter, setTwitter] = useState("https://x.com/meera_writes");
  const [linkedin, setLinkedin] = useState("https://linkedin.com/in/meeraraghavan");
  const [medium, setMedium] = useState("https://medium.com/@meera.writes");
  const [youtube, setYoutube] = useState("https://youtube.com/@meeraraghavan");

  const linkedStories = storiesByWriter(defaultWriter.slug);

  const activeSocials = [
    { label: "Website", href: website },
    { label: "Substack", href: substack },
    { label: "Instagram", href: instagram },
    { label: "X (Twitter)", href: twitter },
    { label: "LinkedIn", href: linkedin },
    { label: "Medium", href: medium },
    { label: "YouTube", href: youtube },
  ].filter((s) => Boolean(s.href.trim()));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Writer profile, contact info & social links saved!", {
      description: "Your author page and contact details have been updated across tossatale.",
    });
  };

  return (
    <AppShell
      role="writer"
      title="My Writer Profile"
      blurb="Manage your author bio, location, contact numbers, social links, and view your editorial statistics."
      actions={
        <div className="flex items-center gap-3">
          <ButtonLink to="/writers/$slug" params={{ slug: defaultWriter.slug }} variant="ghostOutline">
            <Eye className="size-4" /> View public profile
          </ButtonLink>
          <Button onClick={handleSaveProfile}>
            <Save className="size-4" /> Save changes
          </Button>
        </div>
      }
    >
      {/* Top Writer Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Stories" value={String(defaultWriter.stories)} hint="in tossatale library" />
        <StatCard label="Total Readers / Reads" value={defaultWriter.reads} delta="+18%" hint="this month" />
        <StatCard label="Active Followers" value={defaultWriter.followers} delta="+340" hint="new this week" />
        <StatCard label="Verification Status" value="Verified" hint={`Member since ${defaultWriter.joined}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1.7fr]">
        {/* Left Column: Personal Info & Bio Editor */}
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="flex items-start gap-4 border-b border-border pb-5">
              <Avatar initials={defaultWriter.initials} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-heading">{name}</h2>
                  <VerifiedBadge />
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

              {/* Personal Contact Details */}
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

              {/* Social Media Platform Links */}
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
                <Button type="submit" className="w-full">
                  <Save className="size-4" /> Save Profile Details
                </Button>
              </div>
            </form>
          </Panel>

          {/* Achievements Card */}
          <Panel className="p-6">
            <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-subtle uppercase">
              Editorial Badges & Recognition
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {defaultWriter.achievements.map((ach) => (
                <Badge key={ach} tone="info">
                  <Award className="mr-1 size-3.5 inline text-primary" />
                  {ach}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-[0.8125rem] text-subtle">
              Badges are awarded by tossatale editors based on reader engagement, editorial picks, and serial completions.
            </p>
          </Panel>
        </div>

        {/* Right Column: Writer Stories & Active Social Badges */}
        <div className="space-y-6">
          {/* Active Social Media Badges Card */}
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

          <Panel className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl">Stories by {name}</h2>
                <p className="mt-1 text-[0.8125rem] text-subtle">
                  Catalog of your published pieces and active drafts.
                </p>
              </div>
              <ButtonLink to="/writer/editor" size="sm">
                <PenLine className="size-4" /> New story
              </ButtonLink>
            </div>

            {linkedStories.length === 0 ? (
              <div className="py-12 text-center text-subtle">
                <BookOpen className="mx-auto size-10 text-subtle/50" />
                <p className="mt-3 font-sans text-[0.9375rem] font-bold">No published stories yet</p>
                <p className="mt-1 text-[0.8125rem]">Start your first longform story using the editor!</p>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-border">
                {linkedStories.map((s) => (
                  <li key={s.slug} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge tone="success">Published</Badge>
                          <span className="text-[0.75rem] text-subtle">{s.readingTimeMin} min read · {s.date}</span>
                        </div>
                        <h3 className="mt-1 font-display text-[1.0625rem] font-bold text-heading truncate">
                          {s.title}
                        </h3>
                        <p className="text-[0.8125rem] text-subtle line-clamp-1">{s.dek}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-3 text-[0.8125rem] text-subtle mr-2">
                          <span className="flex items-center gap-1">
                            <Eye className="size-3.5" /> {s.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="size-3.5" /> {s.likes}
                          </span>
                        </div>

                        <ButtonLink
                          to="/stories/$slug"
                          params={{ slug: s.slug }}
                          variant="ghostOutline"
                          size="sm"
                        >
                          Read
                        </ButtonLink>
                        <ButtonLink
                          to="/writer/editor/$storyId"
                          params={{ storyId: s.slug }}
                          variant="soft"
                          size="sm"
                        >
                          Edit
                        </ButtonLink>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Quick Access Info Panel */}
          <Panel className="p-6">
            <h3 className="font-sans text-[0.6875rem] font-black tracking-widest text-primary uppercase">
              Writer Account Contact Details
            </h3>
            <div className="mt-4 grid gap-3 text-[0.875rem] text-body">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-subtle flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" /> Email:
                </span>
                <span className="font-sans font-bold text-heading">{email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-subtle flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary" /> Contact Phone:
                </span>
                <span className="font-sans font-bold text-heading">{phone}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-subtle flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-success" /> Status:
                </span>
                <span className="font-sans font-bold text-success flex items-center gap-1">
                  Verified Author
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-subtle">Public Author Page:</span>
                <Link
                  to="/writers/$slug"
                  params={{ slug: defaultWriter.slug }}
                  className="font-bold text-primary underline hover:text-primary-hover"
                >
                  /writers/{defaultWriter.slug}
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

