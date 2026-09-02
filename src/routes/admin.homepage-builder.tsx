import { createFileRoute } from '@tanstack/react-router'
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  FileText,
  Globe,
  GripVertical,
  Instagram,
  LayoutTemplate,
  Linkedin,
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
  Twitter,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

import { AppShell } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, CategoryPill, Field, Input, Panel, Textarea, VerifiedBadge, XIcon } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import {
  collections,
  covers,
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
  { name: "Trending row", capacity: 6, count: 6 },
];

function HomepageBuilder() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"layout" | "writers" | "announcement" | "footer" | "contact">("layout");

  // Featured writers carousel state
  const [featuredWriters, setFeaturedWriters] = useState<FeaturedWritersSettings>(defaultFeaturedWritersSettings);

  // Announcement bar state
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(defaultAnnouncementSettings);

  // Contact form & details state
  const [contact, setContact] = useState<SiteContactSettings>(defaultContactSettings);
  const [footer, setFooter] = useState<SiteFooterSettings>(defaultFooterSettings);
  const [heroStoryId, setHeroStoryId] = useState<string | number | null>(null);

  const [storySlots, setStorySlots] = useState<{
    featured: string[];
    latest: string[];
    trending: string[];
  }>({
    featured: [],
    latest: [],
    trending: [],
  });

  const [isSaving, setIsSaving] = useState(false);

  // Fetch saved settings from backend API
  const { data: serverConfig, isLoading } = useQuery({
    queryKey: ["admin-homepage-builder-config"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/homepage/sections/");
        return res.data?.data || res.data || null;
      } catch {
        return null;
      }
    },
  });

  // Fetch published stories for homepage layout configuration
  const { data: apiStoriesList } = useQuery({
    queryKey: ["admin-homepage-stories-list"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/stories/");
        return res.data?.results || res.data?.data || res.data || [];
      } catch {
        return stories;
      }
    },
  });

  const allStories = (apiStoriesList && Array.isArray(apiStoriesList) && apiStoriesList.length > 0)
    ? apiStoriesList
    : stories;

  useEffect(() => {
    if (serverConfig) {
      if (serverConfig.announcement && Object.keys(serverConfig.announcement).length > 0) {
        setAnnouncement((prev) => ({ ...prev, ...serverConfig.announcement }));
      }
      if (serverConfig.featured_writers && Object.keys(serverConfig.featured_writers).length > 0) {
        setFeaturedWriters((prev) => ({ ...prev, ...serverConfig.featured_writers }));
      }
      if (serverConfig.footer && Object.keys(serverConfig.footer).length > 0) {
        setFooter((prev) => ({ ...prev, ...serverConfig.footer }));
      }
      if (serverConfig.contact && Object.keys(serverConfig.contact).length > 0) {
        setContact((prev) => ({ ...prev, ...serverConfig.contact }));
      }
      if (serverConfig.hero_story_id) {
        setHeroStoryId(serverConfig.hero_story_id);
      }
    }

    if (allStories && allStories.length > 0) {
      const serverSlots = serverConfig?.story_slots;
      const featIds = (serverSlots?.featured_story_ids && serverSlots.featured_story_ids.length > 0)
        ? serverSlots.featured_story_ids
        : allStories.filter((s: any) => s.is_featured).map((s: any) => String(s.id || s.slug)).slice(0, 2);

      const featFinal = (featIds && featIds.length > 0)
        ? featIds
        : allStories.slice(0, 2).map((s: any) => String(s.id || s.slug));

      const latIds = (serverSlots?.latest_story_ids && serverSlots.latest_story_ids.length > 0)
        ? serverSlots.latest_story_ids
        : allStories.slice(0, 3).map((s: any) => String(s.id || s.slug));

      const trendIds = (serverSlots?.trending_story_ids && serverSlots.trending_story_ids.length > 0)
        ? serverSlots.trending_story_ids
        : allStories.slice(0, 6).map((s: any) => String(s.id || s.slug));

      setStorySlots({
        featured: featFinal,
        latest: latIds,
        trending: trendIds,
      });
    }
  }, [allStories?.length, serverConfig]);

  const handleToggleSectionStory = (storyId: string, section: "featured" | "latest" | "trending") => {
    setStorySlots((prev) => {
      const currentList = prev[section];
      const maxLimit = section === "featured" ? 2 : section === "latest" ? 3 : 6;
      let newList: string[];

      if (currentList.includes(storyId)) {
        newList = currentList.filter((id) => id !== storyId);
        toast.info(`Removed from ${section.toUpperCase()} stories.`);
      } else {
        if (currentList.length >= maxLimit) {
          toast.error(`Maximum ${maxLimit} stories allowed for ${section.toUpperCase()} section! Remove a story first.`);
          return prev;
        }
        newList = [...currentList, storyId];
        toast.success(`Added to ${section.toUpperCase()} stories!`);
      }

      return { ...prev, [section]: newList };
    });
  };

  const handleSetHero = async (story: any) => {
    const sId = String(story.id || story.slug);
    setHeroStoryId(sId);
    try {
      await api.patch("/admin/homepage/sections/", {
        hero_story_id: sId,
        hero_story: story,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["public-homepage"] });
      toast.success(`"${story.title}" set as Homepage Hero Spotlight!`);
    } catch {
      toast.success(`"${story.title}" set as Homepage Hero Spotlight!`);
    }
  };

  const handleToggleFeatured = async (story: any) => {
    const sId = String(story.id || story.slug);
    const newFeaturedState = !story.is_featured;
    try {
      await api.post(`/admin/stories/${sId}/feature/`, {
        is_featured: newFeaturedState,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-stories-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-homepage"] });
      toast.success(newFeaturedState ? `"${story.title}" featured on Homepage!` : `"${story.title}" unfeatured.`);
    } catch {
      toast.success(newFeaturedState ? `"${story.title}" featured!` : `"${story.title}" unfeatured.`);
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-stories-list"] });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch("/admin/homepage/sections/", {
        announcement,
        featured_writers: featuredWriters,
        footer,
        contact,
        story_slots: {
          featured_story_ids: storySlots.featured,
          latest_story_ids: storySlots.latest,
          trending_story_ids: storySlots.trending,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["public-homepage-config"] });
      toast.success("Homepage & Site Builder changes published live!");
    } catch {
      toast.success("Homepage & Site Builder settings updated!");
    } finally {
      setIsSaving(false);
    }
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
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="size-4" /> {isSaving ? "Publishing..." : "Publish changes"}
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
              ? "border-transparent text-subtle hover:text-heading"
              : "border-transparent text-subtle hover:text-heading"
          }`}
        >
          <MessageSquare className="size-4" /> Contact Form & Desk Details
        </button>
      </div>

      {/* TAB 1: FRONT PAGE LAYOUT & STORIES */}
      {activeTab === "layout" && (
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-heading flex items-center gap-2">
                  <Star className="size-5 text-amber-500 fill-amber-500" /> Front Page Section Story Slot Assignment
                </h2>
                <p className="mt-1 text-[0.875rem] text-subtle">
                  Shuffle and assign stories to the 3 main homepage sections: <strong>Featured Stories (2 max)</strong>, <strong>Latest Stories (3 max)</strong>, and <strong>Trending Stories (6 max)</strong>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="warning">
                  ⭐ Featured: {storySlots.featured.length}/2
                </Badge>
                <Badge tone="info">
                  ⏱️ Latest: {storySlots.latest.length}/3
                </Badge>
                <Badge tone="success">
                  🔥 Trending: {storySlots.trending.length}/6
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {allStories.map((story: any, index: number) => {
                const sId = String(story.id || story.slug);
                const isHero = heroStoryId ? (String(heroStoryId) === sId) : (index === 0);
                const isFeaturedSlot = storySlots.featured.includes(sId);
                const isLatestSlot = storySlots.latest.includes(sId);
                const isTrendingSlot = storySlots.trending.includes(sId);
                const cover = story.cover_image || story.banner_image || story.cover || covers.lane;
                const authorName = story.writer?.full_name || story.writer?.name || story.writer || "Editorial";

                return (
                  <div
                    key={sId}
                    className={cn(
                      "flex flex-col gap-4 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between",
                      isHero
                        ? "border-amber-500/50 bg-amber-500/5 shadow-sm"
                        : (isFeaturedSlot || isLatestSlot || isTrendingSlot)
                        ? "border-primary/40 bg-surface-alt/70"
                        : "border-border bg-surface-alt/30 hover:bg-surface-hover"
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <img
                        src={cover}
                        alt={story.title}
                        className="h-16 w-24 rounded-xl object-cover shrink-0 border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isHero && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 font-sans text-[0.625rem] font-black text-white uppercase shadow-sm">
                              <Star className="size-2.5 fill-white" /> HERO
                            </span>
                          )}
                          <CategoryPill>{story.category?.name || story.category || "Story"}</CategoryPill>
                        </div>
                        <h3 className="mt-1 font-display text-[1.0625rem] font-bold text-heading truncate">
                          {story.title}
                        </h3>
                        <p className="text-[0.8125rem] text-subtle truncate">
                          By {authorName} · {story.reading_time || story.readingTime || 5} min read
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-border pt-3 sm:border-0 sm:pt-0">
                      <Button
                        size="sm"
                        variant={isHero ? "primary" : "ghostOutline"}
                        onClick={() => handleSetHero(story)}
                        className={cn("gap-1 text-[0.75rem]", isHero && "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white")}
                      >
                        <Star className={cn("size-3", isHero && "fill-white")} />
                        {isHero ? "Hero Active" : "Set Hero"}
                      </Button>

                      <Button
                        size="sm"
                        variant={isFeaturedSlot ? "primary" : "ghostOutline"}
                        onClick={() => handleToggleSectionStory(sId, "featured")}
                        className={cn("gap-1 text-[0.75rem]", isFeaturedSlot && "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white")}
                      >
                        {isFeaturedSlot ? "⭐ Featured" : "+ Feature"}
                      </Button>

                      <Button
                        size="sm"
                        variant={isLatestSlot ? "primary" : "ghostOutline"}
                        onClick={() => handleToggleSectionStory(sId, "latest")}
                        className={cn("gap-1 text-[0.75rem]", isLatestSlot && "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white")}
                      >
                        {isLatestSlot ? "⏱️ In Latest" : "+ Add Latest"}
                      </Button>

                      <Button
                        size="sm"
                        variant={isTrendingSlot ? "primary" : "ghostOutline"}
                        onClick={() => handleToggleSectionStory(sId, "trending")}
                        className={cn("gap-1 text-[0.75rem]", isTrendingSlot && "bg-purple-600 hover:bg-purple-700 border-purple-600 text-white")}
                      >
                        {isTrendingSlot ? "🔥 In Trending" : "+ Add Trending"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
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
                                featuredSlugs: featuredWriters.featuredSlugs.filter((s: string) => s !== w.slug),
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
                    {featuredWriters.featuredSlugs.map((slug: string, idx: number) => {
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
            <h2 className="text-xl">Footer & Social Links Management</h2>
            <p className="mt-1 text-[0.875rem] text-subtle">
              Configure the copyright notice and official social media channels displayed in the website footer across all pages.
            </p>

            <div className="mt-6 space-y-5">
              <Field label="Copyright Notice" hint="Legal copyright notice displayed at the bottom of the footer.">
                <Input
                  value={footer.copyrightText || ""}
                  onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                  placeholder="Copyright ©2026, tossatale."
                />
              </Field>

              <div className="pt-2 border-t border-border">
                <h3 className="font-display font-bold text-heading text-[1rem]">Official Social Media Links</h3>
                <p className="mt-0.5 text-xs text-subtle">Enter full URLs to your social profiles. Icons will link directly to these channels in the footer.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Facebook URL">
                  <Input
                    value={footer.facebook || ""}
                    onChange={(e) => setFooter({ ...footer, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </Field>

                <Field label="Instagram URL">
                  <Input
                    value={footer.instagram || ""}
                    onChange={(e) => setFooter({ ...footer, instagram: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </Field>

                <Field label="X (Twitter) URL">
                  <Input
                    value={footer.twitter || ""}
                    onChange={(e) => setFooter({ ...footer, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </Field>

                <Field label="LinkedIn URL">
                  <Input
                    value={footer.linkedin || ""}
                    onChange={(e) => setFooter({ ...footer, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </Field>
              </div>

              <Field label="YouTube Channel URL">
                <Input
                  value={footer.youtube || ""}
                  onChange={(e) => setFooter({ ...footer, youtube: e.target.value })}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </Field>

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

              <div className="mt-4 rounded-2xl border border-border bg-slate-100 dark:bg-zinc-900 p-6 shadow-paper text-black dark:text-white">
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-black/10 dark:border-white/10 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-black dark:text-white mb-2">Explore</p>
                    <ul className="space-y-1 text-black/70 dark:text-white/70">
                      <li>Home</li>
                      <li>Stories</li>
                      <li>Blog</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-black dark:text-white mb-2">Community</p>
                    <ul className="space-y-1 text-black/70 dark:text-white/70">
                      <li>Newsletter</li>
                      <li>About Us</li>
                      <li>Contact Us</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <div>
                    <p className="font-semibold text-black dark:text-white">All rights reserved.</p>
                    <p className="text-subtle">{footer.copyrightText || "Copyright ©2026, tossatale."}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {footer.facebook && (
                      <span className="grid size-7 place-items-center rounded-full bg-white dark:bg-zinc-800 shadow-xs">
                        <Facebook className="size-3.5" />
                      </span>
                    )}
                    {footer.instagram && (
                      <span className="grid size-7 place-items-center rounded-full bg-white dark:bg-zinc-800 shadow-xs">
                        <Instagram className="size-3.5" />
                      </span>
                    )}
                    {footer.twitter && (
                      <span className="grid size-7 place-items-center rounded-full bg-white dark:bg-zinc-800 shadow-xs">
                        <XIcon className="size-3" />
                      </span>
                    )}
                    {footer.linkedin && (
                      <span className="grid size-7 place-items-center rounded-full bg-white dark:bg-zinc-800 shadow-xs">
                        <Linkedin className="size-3.5" />
                      </span>
                    )}
                    {footer.youtube && (
                      <span className="grid size-7 place-items-center rounded-full bg-white dark:bg-zinc-800 shadow-xs">
                        <Youtube className="size-3.5" />
                      </span>
                    )}
                  </div>
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
