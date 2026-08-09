import { createFileRoute } from '@tanstack/react-router'
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  GripVertical,
  LayoutTemplate,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Sliders,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, Field, Input, Panel, Textarea, VerifiedBadge } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import {
  collections,
  defaultAnnouncementSettings,
  defaultContactSettings,
  defaultFeaturedWritersSettings,
  defaultFooterSettings,
  series,
  stories,
  writerBySlug,
  writers,
  type AnnouncementSettings,
  type FeaturedWritersSettings,
  type SiteContactSettings,
  type SiteFooterSettings,
} from "@/lib/data";

export const Route = createFileRoute("/admin/homepage-builder")({
  head: () =>
    pageHead(
      "Homepage & Site builder · tossatale admin",
      "Arrange front page hero, featured writers carousel, top announcement bar, footer details, and contact form settings.",
    ),
  component: HomepageBuilder,
});

const slots = [
  { name: "Hero spotlight", capacity: 1, count: 1 },
  { name: "Featured writers", capacity: 6, count: 5 },
  { name: "Featured row", capacity: 3, count: 3 },
  { name: "Announcement & Footer", capacity: 2, count: 2 },
];

export function HomepageBuilder() {
  const [activeTab, setActiveTab] = useState<"layout" | "writers" | "announcement" | "footer" | "contact">("layout");

  // Featured writers carousel state
  const [featuredWriters, setFeaturedWriters] = useState<FeaturedWritersSettings>(defaultFeaturedWritersSettings);

  // Announcement bar state
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(defaultAnnouncementSettings);

  // Contact form & details state
  const [contact, setContact] = useState<SiteContactSettings>(defaultContactSettings);

  // Footer branding state
  const [footer, setFooter] = useState<SiteFooterSettings>(defaultFooterSettings);

  const handleSave = () => {
    toast.success("Homepage, Featured Writers Carousel, and Announcement settings published!", {
      description: "All changes are live across the tossatale platform.",
    });
  };

  const handleReset = () => {
    setFeaturedWriters(defaultFeaturedWritersSettings);
    setAnnouncement(defaultAnnouncementSettings);
    setContact(defaultContactSettings);
    setFooter(defaultFooterSettings);
    toast.info("Settings reset to defaults");
  };

  return (
    <AppShell
      role="admin"
      title="Homepage & Site Builder"
      blurb="Manage front page layout slots, footer editorial text, and reader contact form settings."
      actions={
        <>
          <Button variant="ghostOutline" onClick={handleReset}>
            <RefreshCw className="size-4" /> Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="size-4" /> Publish changes
          </Button>
        </>
      }
    >
      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {slots.map((s) => (
          <Panel key={s.name} className="p-5">
            <p className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-subtle uppercase">
              {s.name}
            </p>
            <p className="mt-2 font-display text-[1.75rem] leading-none text-heading">
              {s.count}
              <span className="text-subtle">/{s.capacity}</span>
            </p>
            <p className="mt-2 text-[0.8125rem] text-subtle">
              {s.count === s.capacity ? "Slot configured" : `${s.capacity - s.count} open`}
            </p>
          </Panel>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("layout")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[0.9375rem] font-bold transition-colors ${
            activeTab === "layout"
              ? "border-primary text-primary-hover"
              : "border-transparent text-subtle hover:text-heading"
          }`}
        >
          <LayoutTemplate className="size-4" /> Front Page Layout
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("writers")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[0.9375rem] font-bold transition-colors ${
            activeTab === "writers"
              ? "border-primary text-primary-hover"
              : "border-transparent text-subtle hover:text-heading"
          }`}
        >
          <Users className="size-4" /> Featured Writers Carousel
          <Badge tone="info">{featuredWriters.featuredSlugs.length} Featured</Badge>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[0.9375rem] font-bold transition-colors ${
            activeTab === "announcement"
              ? "border-primary text-primary-hover"
              : "border-transparent text-subtle hover:text-heading"
          }`}
        >
          <Megaphone className="size-4" /> Announcement Bar
          {announcement.enabled ? (
            <Badge tone="success">Active</Badge>
          ) : (
            <Badge tone="neutral">Hidden</Badge>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[0.9375rem] font-bold transition-colors ${
            activeTab === "footer"
              ? "border-primary text-primary-hover"
              : "border-transparent text-subtle hover:text-heading"
          }`}
        >
          <FileText className="size-4" /> Footer Details Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[0.9375rem] font-bold transition-colors ${
            activeTab === "contact"
              ? "border-primary text-primary-hover"
              : "border-transparent text-subtle hover:text-heading"
          }`}
        >
          <MessageSquare className="size-4" /> Contact Form & Desk Details
        </button>
      </div>

      {/* TAB 1: FRONT PAGE LAYOUT */}
      {activeTab === "layout" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Front page story order</h2>
              <Button size="sm" variant="soft">
                <Plus className="size-4" /> Add story
              </Button>
            </div>
            <ul className="mt-5 space-y-3">
              {stories.slice(0, 6).map((s, i) => (
                <li
                  key={s.slug}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface-alt/50 p-3"
                >
                  <GripVertical className="size-4 shrink-0 text-subtle" />
                  <span className="font-display text-lg text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[0.9375rem] font-bold text-heading">
                      {s.title}
                    </p>
                    <p className="text-[0.8125rem] text-subtle">{writerBySlug(s.writer)?.name}</p>
                  </div>
                  <Badge tone={i === 0 ? "info" : "neutral"}>{i === 0 ? "Hero" : `Slot ${i + 1}`}</Badge>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="space-y-6">
            <Panel className="p-6">
              <h2 className="text-xl">Collections shelf</h2>
              <ul className="mt-4 space-y-3">
                {collections.map((c) => (
                  <li key={c.slug} className="flex items-center gap-3">
                    <img src={c.cover} alt="" loading="lazy" className="h-11 w-14 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-sans text-[0.875rem] font-bold text-heading">
                        {c.title}
                      </p>
                      <p className="text-[0.75rem] text-subtle">{c.count} stories</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="p-6">
              <h2 className="text-xl">Series banner</h2>
              <p className="mt-2 text-[0.9375rem] text-body">Currently promoting:</p>
              <div className="mt-3 flex items-center gap-3 rounded-2xl paper-gradient p-3">
                <img src={series[0]!.cover} alt="" className="h-14 w-20 rounded-lg object-cover" />
                <div>
                  <p className="font-sans text-[0.9375rem] font-bold text-heading">
                    {series[0]!.title}
                  </p>
                  <p className="text-[0.8125rem] text-subtle">{series[0]!.parts} parts</p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURED WRITERS CAROUSEL MANAGEMENT */}
      {activeTab === "writers" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Panel className="p-6">
            <div className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">Featured Writers Carousel Selection</h2>
                <Badge tone="info">
                  {featuredWriters.featuredSlugs.length} Writers Featured
                </Badge>
              </div>
              <p className="mt-1 text-[0.875rem] text-subtle">
                Choose which writers are highlighted in the homepage Featured Writers Carousel. Click to feature or unfeature any writer.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Section Eyebrow" hint="Top tag text above the title">
                  <Input
                    value={featuredWriters.eyebrow}
                    onChange={(e) =>
                      setFeaturedWriters({ ...featuredWriters, eyebrow: e.target.value })
                    }
                    placeholder="The people behind the pages"
                  />
                </Field>

                <Field label="Section Title" hint="Main title for the writer carousel">
                  <Input
                    value={featuredWriters.title}
                    onChange={(e) =>
                      setFeaturedWriters({ ...featuredWriters, title: e.target.value })
                    }
                    placeholder="Featured writers"
                  />
                </Field>
              </div>

              <Field label="Section Blurb" hint="Short subtitle description">
                <Input
                  value={featuredWriters.blurb}
                  onChange={(e) =>
                    setFeaturedWriters({ ...featuredWriters, blurb: e.target.value })
                  }
                  placeholder="Meet the curious writers publishing on tossatale."
                />
              </Field>

              <div className="pt-2">
                <h3 className="font-sans text-[0.75rem] font-black tracking-widest text-subtle uppercase mb-3">
                  Writers Directory — Select Writers to Feature
                </h3>
                <ul className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
                  {writers.map((w) => {
                    const isFeatured = featuredWriters.featuredSlugs.includes(w.slug);
                    const featuredIndex = featuredWriters.featuredSlugs.indexOf(w.slug);

                    return (
                      <li
                        key={w.slug}
                        className={`flex items-center justify-between gap-4 p-4 transition-colors ${
                          isFeatured ? "bg-primary-light/40" : "hover:bg-surface-alt"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar initials={w.initials} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-[0.9375rem] font-bold text-heading truncate">
                                {w.name}
                              </span>
                              {w.verified && <VerifiedBadge />}
                              {isFeatured && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-sans text-[0.625rem] font-extrabold text-primary uppercase">
                                  <Star className="size-3 fill-primary" />
                                  Slot #{featuredIndex + 1}
                                </span>
                              )}
                            </div>
                            <p className="text-[0.8125rem] text-subtle truncate">
                              {w.role} · {w.stories} stories · {w.followers} followers
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isFeatured ? "primary" : "ghostOutline"}
                          onClick={() => {
                            if (isFeatured) {
                              setFeaturedWriters({
                                ...featuredWriters,
                                featuredSlugs: featuredWriters.featuredSlugs.filter((s) => s !== w.slug),
                              });
                              toast.info(`Removed ${w.name} from featured writers carousel`);
                            } else {
                              setFeaturedWriters({
                                ...featuredWriters,
                                featuredSlugs: [...featuredWriters.featuredSlugs, w.slug],
                              });
                              toast.success(`Featured ${w.name} on homepage carousel!`);
                            }
                          }}
                        >
                          {isFeatured ? (
                            <>
                              <Check className="size-4" /> Featured
                            </>
                          ) : (
                            <>
                              <Plus className="size-4" /> Feature on homepage
                            </>
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Button onClick={handleSave}>
                  <Save className="size-4" /> Save Writer Carousel Settings
                </Button>
                <Button
                  variant="ghostOutline"
                  onClick={() =>
                    setFeaturedWriters({
                      ...featuredWriters,
                      featuredSlugs: writers.map((w) => w.slug),
                    })
                  }
                >
                  Feature All Writers
                </Button>
              </div>
            </div>
          </Panel>

          {/* Live Preview Panel */}
          <div className="space-y-6">
            <Panel className="p-6">
              <h3 className="font-sans text-[0.75rem] font-black tracking-widest text-primary uppercase">
                Featured Writers Carousel Preview
              </h3>
              <p className="mt-1 text-[0.8125rem] text-subtle">
                Currently featuring <strong>{featuredWriters.featuredSlugs.length} writer{featuredWriters.featuredSlugs.length === 1 ? "" : "s"}</strong> on the homepage.
              </p>

              <div className="mt-4 rounded-2xl border border-border bg-background p-4 shadow-lift space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="font-sans text-[0.625rem] font-extrabold uppercase text-primary tracking-wider">
                      {featuredWriters.eyebrow}
                    </span>
                    <h4 className="font-display text-base font-bold text-heading">
                      {featuredWriters.title}
                    </h4>
                  </div>
                  <span className="text-[0.6875rem] text-subtle bg-surface-alt px-2 py-1 rounded-md">
                    Carousel Controls →
                  </span>
                </div>

                {featuredWriters.featuredSlugs.length === 0 ? (
                  <p className="text-center py-6 text-[0.8125rem] text-subtle">
                    No writers featured yet. Select writers from the directory list on the left!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {featuredWriters.featuredSlugs.map((slug, idx) => {
                      const w = writerBySlug(slug);
                      if (!w) return null;
                      return (
                        <div
                          key={slug}
                          className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar initials={w.initials} size="sm" />
                            <div className="min-w-0">
                              <p className="font-sans text-[0.8125rem] font-bold text-heading truncate">
                                {w.name}
                              </p>
                              <p className="text-[0.6875rem] text-subtle truncate">{w.role}</p>
                            </div>
                          </div>
                          <span className="font-mono text-[0.6875rem] text-primary font-bold">
                            #{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENT BAR MANAGEMENT */}
      {activeTab === "announcement" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Panel className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl">Top Announcement Bar</h2>
                <p className="mt-1 text-[0.875rem] text-subtle">
                  Highlight breaking news, audio releases, or special editorial series at the top of the header.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-sans text-[0.875rem] font-bold text-heading">
                  Show Announcement Bar
                </span>
              </label>
            </div>

            <div className="mt-6 space-y-5">
              <Field label="Badge Tag Text" hint="Short highlight pill (e.g., NEW ANNOUNCEMENT, SPECIAL EDITION, AUDIO)">
                <Input
                  value={announcement.badgeText}
                  onChange={(e) => setAnnouncement({ ...announcement, badgeText: e.target.value })}
                  placeholder="NEW ANNOUNCEMENT"
                />
              </Field>

              <Field label="Announcement News Text" hint="The primary news headline displayed in the top bar.">
                <Textarea
                  rows={3}
                  value={announcement.text}
                  onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                  placeholder="tossatale Audio is now open..."
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Action Link Text" hint="Button/link text (e.g. Learn more, Listen now)">
                  <Input
                    value={announcement.linkText}
                    onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })}
                    placeholder="Learn more"
                  />
                </Field>

                <Field label="Action Target URL / Route" hint="Target route (e.g. /coming-soon, /series)">
                  <Input
                    value={announcement.linkTo}
                    onChange={(e) => setAnnouncement({ ...announcement, linkTo: e.target.value })}
                    placeholder="/coming-soon"
                  />
                </Field>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Button onClick={handleSave}>
                  <Save className="size-4" /> Save Announcement Settings
                </Button>
                <Button
                  variant="ghostOutline"
                  onClick={() =>
                    setAnnouncement({
                      ...announcement,
                      enabled: !announcement.enabled,
                    })
                  }
                >
                  {announcement.enabled ? "Hide Announcement Bar" : "Enable Announcement Bar"}
                </Button>
              </div>
            </div>
          </Panel>

          {/* Live Preview Card */}
          <div className="space-y-6">
            <Panel className="p-6">
              <h3 className="font-sans text-[0.75rem] font-black tracking-widest text-primary uppercase">
                Header Announcement Preview
              </h3>
              <p className="mt-1 text-[0.8125rem] text-subtle">
                Status: {announcement.enabled ? (
                  <strong className="text-success font-bold">Active & Visible</strong>
                ) : (
                  <strong className="text-subtle font-bold">Disabled (Hidden by default)</strong>
                )}
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background shadow-lift">
                <div className="bg-gradient-to-r from-primary-hover via-primary to-primary-hover p-3 text-white">
                  <div className="flex items-center justify-between gap-2 text-[0.8125rem]">
                    <div className="flex flex-wrap items-center gap-2">
                      {announcement.badgeText && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-sans text-[0.625rem] font-bold uppercase tracking-wider text-white">
                          <Sparkles className="size-3" />
                          {announcement.badgeText}
                        </span>
                      )}
                      <span className="font-medium text-white/95">{announcement.text || "Your announcement text..."}</span>
                      {announcement.linkText && (
                        <span className="font-bold underline ml-1">{announcement.linkText} →</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface flex items-center justify-between border-t border-border">
                  <span className="font-display font-bold text-heading">tossatale</span>
                  <span className="text-[0.75rem] text-subtle">Header Navigation Mock</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
      {activeTab === "footer" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Panel className="p-6">
            <h2 className="text-xl">Footer Content & Branding</h2>
            <p className="mt-1 text-[0.875rem] text-subtle">
              Customize the text, taglines, and legal details displayed in the footer across all pages.
            </p>

            <div className="mt-6 space-y-5">
              <Field label="Footer Description Bio" hint="Brief summary shown next to the logo in the footer.">
                <Textarea
                  rows={3}
                  value={footer.aboutText}
                  onChange={(e) => setFooter({ ...footer, aboutText: e.target.value })}
                />
              </Field>

              <Field label="Editorial Tagline Quote">
                <Input
                  value={footer.tagline}
                  onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Copyright Line">
                  <Input
                    value={footer.copyrightText}
                    onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                  />
                </Field>

                <Field label="Secondary Footer Sub-note">
                  <Input
                    value={footer.subnoteText}
                    onChange={(e) => setFooter({ ...footer, subnoteText: e.target.value })}
                  />
                </Field>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave}>
                  <Save className="size-4" /> Save Footer Settings
                </Button>
              </div>
            </div>
          </Panel>

          {/* Footer Live Preview */}
          <div className="space-y-6">
            <Panel className="p-6">
              <h3 className="font-sans text-[0.75rem] font-black tracking-widest text-primary uppercase">
                Live Footer Preview
              </h3>

              <div className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-paper">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary text-white font-display font-bold">
                    T
                  </span>
                  <span className="font-display text-lg font-bold text-heading">Tossatale</span>
                </div>
                <p className="mt-3 text-[0.875rem] text-body">{footer.aboutText}</p>
                <p className="mt-4 font-display text-[0.9375rem] italic text-primary">
                  {footer.tagline}
                </p>
                <div className="mt-6 border-t border-divider pt-3 text-[0.75rem] text-subtle flex flex-col gap-1">
                  <p>{footer.copyrightText}</p>
                  <p>{footer.subnoteText}</p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT FORM & DESK DETAILS MANAGEMENT */}
      {activeTab === "contact" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            {/* Contact Form Header Settings */}
            <Panel className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl">Contact Form Settings</h2>
                  <p className="mt-1 text-[0.875rem] text-subtle">
                    Configure the headline, subtitle, and behavior of the reader contact form on `/contact`.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contact.enablePublicForm}
                    onChange={(e) => setContact({ ...contact, enablePublicForm: e.target.checked })}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="font-sans text-[0.875rem] font-bold text-heading">Enable Form</span>
                </label>
              </div>

              <div className="mt-6 space-y-5">
                <Field label="Form Main Headline">
                  <Input
                    value={contact.formHeadline}
                    onChange={(e) => setContact({ ...contact, formHeadline: e.target.value })}
                  />
                </Field>

                <Field label="Form Subtitle & Expectations">
                  <Textarea
                    rows={2}
                    value={contact.formSubtitle}
                    onChange={(e) => setContact({ ...contact, formSubtitle: e.target.value })}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Inbox Submissions Notify Email">
                    <Input
                      type="email"
                      value={contact.inboxNotificationEmail}
                      onChange={(e) =>
                        setContact({ ...contact, inboxNotificationEmail: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Auto-Reply Confirmation Text">
                    <Input
                      value={contact.autoReplyMessage}
                      onChange={(e) => setContact({ ...contact, autoReplyMessage: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </Panel>

            {/* Editorial Desk Details */}
            <Panel className="p-6">
              <h2 className="text-xl">Editorial Desk Contact Details</h2>
              <p className="mt-1 text-[0.875rem] text-subtle">
                Public email channels, telephone numbers, and physical office location.
              </p>

              <div className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Member Support Email">
                    <Input
                      type="email"
                      value={contact.supportEmail}
                      onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
                    />
                  </Field>

                  <Field label="Submissions & Pitches Email">
                    <Input
                      type="email"
                      value={contact.pitchesEmail}
                      onChange={(e) => setContact({ ...contact, pitchesEmail: e.target.value })}
                    />
                  </Field>

                  <Field label="Press Email">
                    <Input
                      type="email"
                      value={contact.pressEmail}
                      onChange={(e) => setContact({ ...contact, pressEmail: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Desk Phone Number">
                    <Input
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    />
                  </Field>

                  <Field label="Working Hours">
                    <Input
                      value={contact.workingHours}
                      onChange={(e) => setContact({ ...contact, workingHours: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Physical Bureau Address">
                  <Input
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  />
                </Field>

                <div className="pt-3">
                  <Button onClick={handleSave}>
                    <Save className="size-4" /> Save Contact Details
                  </Button>
                </div>
              </div>
            </Panel>
          </div>

          {/* Contact Details Live Card Preview */}
          <div className="space-y-6">
            <Panel className="p-6">
              <h3 className="font-sans text-[0.75rem] font-black tracking-widest text-primary uppercase">
                Contact Page Preview
              </h3>

              <div className="mt-4 rounded-2xl border border-border bg-surface-alt/40 p-5 space-y-4">
                <div>
                  <h4 className="font-display text-lg font-bold text-heading">{contact.formHeadline}</h4>
                  <p className="mt-1 text-[0.8125rem] text-body">{contact.formSubtitle}</p>
                </div>

                <div className="space-y-3 text-[0.8125rem] text-body border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-primary shrink-0" />
                    <span>Pitches: <strong>{contact.pitchesEmail}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-primary shrink-0" />
                    <span>Support: <strong>{contact.supportEmail}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-primary shrink-0" />
                    <span>Phone: <strong>{contact.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary shrink-0" />
                    <span>Hours: <strong>{contact.workingHours}</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>Address: <strong>{contact.address}</strong></span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-success">
                    <CheckCircle2 className="size-3.5" />
                    {contact.enablePublicForm ? "Public Contact Form Active" : "Form Currently Disabled"}
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}
