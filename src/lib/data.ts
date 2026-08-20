import coverLane from "@/assets/cover-lane.jpg";
import coverPlatform from "@/assets/cover-platform.jpg";
import coverDesk from "@/assets/cover-desk.jpg";
import coverTerrace from "@/assets/cover-terrace.jpg";
import coverBoat from "@/assets/cover-boat.jpg";
import coverBookshop from "@/assets/cover-bookshop.jpg";

export const covers = {
  lane: coverLane,
  platform: coverPlatform,
  desk: coverDesk,
  terrace: coverTerrace,
  boat: coverBoat,
  bookshop: coverBookshop,
};

export const defaultCover = coverLane;

export type Writer = {
  slug: string;
  name: string;
  initials: string;
  handle: string;
  gender?: string;
  photo?: string;
  verified: boolean;
  role: string;
  location: string;
  bio: string;
  stories: number;
  followers: string;
  reads: string;
  joined: string;
  socials: { label: string; href: string }[];
  achievements: string[];
};

export type Story = {
  slug: string;
  title: string;
  dek: string;
  writer: string;
  category: string;
  categorySlug?: string;
  date: string;
  readingTime: number;
  cover: string;
  featured?: boolean;
  trending?: boolean;
  bookmarked?: boolean;
  tags: string[];
  views: number;
  likes: number;
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  count: number;
};

export type Collection = {
  slug: string;
  title: string;
  blurb: string;
  count: number;
  cover: string;
};

export type Series = {
  slug: string;
  title: string;
  blurb: string;
  writer: string;
  parts: number;
  progress: number;
  cover?: string;
};

export type Blog = {
  slug: string;
  title: string;
  dek: string;
  tag: string;
  date: string;
  readingTime: number;
  cover: string;
};

export type Video = {
  slug: string;
  title: string;
  series: string;
  duration: string;
  views: string;
  cover: string;
  youtubeUrl: string;
};

export type UpcomingProject = {
  slug: string;
  title: string;
  category: string;
  cover: string;
  status: string;
  expectedRelease: string;
  director: string;
  logline: string;
};

export type AnnouncementSettings = {
  enabled: boolean;
  text: string;
  badgeText?: string;
  linkText?: string;
  linkTo?: string;
  href?: string;
};

export type FeaturedWritersSettings = {
  eyebrow: string;
  title: string;
  blurb: string;
  featuredSlugs: string[];
};

export type SiteContactSettings = {
  email: string;
  phone: string;
  address: string;
  supportHours: string;
  enablePublicForm?: boolean;
  formHeadline?: string;
  formSubtitle?: string;
  inboxNotificationEmail?: string;
  autoReplyMessage?: string;
  supportEmail?: string;
  pitchesEmail?: string;
  pressEmail?: string;
  workingHours?: string;
};

export type SiteFooterSettings = {
  tagline: string;
  copyright: string;
  aboutText?: string;
  copyrightText?: string;
  subnoteText?: string;
};

export type FooterSettings = SiteFooterSettings;

export const defaultAnnouncementSettings: AnnouncementSettings = {
  enabled: false,
  text: "",
  badgeText: "NEW",
  linkText: "Read more",
  linkTo: "/stories",
  href: "/stories",
};

export const defaultFeaturedWritersSettings: FeaturedWritersSettings = {
  eyebrow: "The people behind the pages",
  title: "Featured Storytellers",
  blurb: "Writers whose stories you won't want to miss.",
  featuredSlugs: [],
};

export const defaultContactSettings: SiteContactSettings = {
  email: "hello@tossatale.com",
  phone: "+91 98765 43210",
  address: "Varanasi, Uttar Pradesh, India",
  supportHours: "Mon-Fri 9:00 AM - 6:00 PM IST",
  enablePublicForm: true,
  formHeadline: "Get in touch with us",
  formSubtitle: "We'd love to hear your feedback or story proposals.",
  inboxNotificationEmail: "editor@tossatale.com",
  autoReplyMessage: "Thank you for reaching out to tossatale.",
  supportEmail: "support@tossatale.com",
  pitchesEmail: "pitches@tossatale.com",
  pressEmail: "press@tossatale.com",
  workingHours: "Mon-Fri 9:00 AM - 6:00 PM IST",
};

export const defaultFooterSettings: FooterSettings = {
  tagline: "Stories worth slowing down for.",
  copyright: "© tossatale. All rights reserved.",
  aboutText: "A community for longform stories and visual storytelling.",
  copyrightText: "© tossatale. All rights reserved.",
  subnoteText: "Crafted for deep readers.",
};

// Pure empty array exports — all data is fetched live from Django REST APIs
export const writers: Writer[] = [];
export const stories: Story[] = [];
export const categories: Category[] = [];
export const collections: Collection[] = [];
export const series: Series[] = [];
export const blogs: Blog[] = [];
export const videos: Video[] = [];
export const upcomingProjects: UpcomingProject[] = [];

export const featuredStory: Story | undefined = undefined;
export const latestStories: Story[] = [];
export const trendingStories: Story[] = [];

export function writerBySlug(slug: string): Writer | undefined {
  return writers.find((w) => w.slug === slug);
}

export function storyBySlug(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}

export function storiesByWriter(writerSlug: string): Story[] {
  return stories.filter((s) => s.writer === writerSlug);
}
