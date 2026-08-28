import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Film,
  Globe,
  Instagram,
  Layers,
  LayoutDashboard,
  Linkedin,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Twitter,
  User,
  X,
  Youtube,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Avatar, Button, ButtonLink } from "@/components/tossa/kit";
import logo from "@/assets/official_tossatale_logo.png";
import { api } from "@/lib/api";
import { categories, defaultAnnouncementSettings, defaultFooterSettings, type AnnouncementSettings, type SiteFooterSettings } from "@/lib/data";
import { CookieConsentBanner } from "@/components/tossa/CookieConsentBanner";
import { useAuth } from "@/components/auth/AuthContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Films", to: "/videos" },
  // { label: "Writers", to: "/writers" },
  { label: "Blog", to: "/blogs" },
];

const mobileNavLinks = [
  { label: "Home", to: "/" },
  { label: "Search Library", to: "/search" },
  { label: "Stories", to: "/stories" },
  { label: "Films", to: "/videos" },
  { label: "Upcoming Projects", to: "/upcoming-projects" },
  { label: "Blog", to: "/blogs" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ & Help", to: "/faq" },
];

export type UserRole = "guest" | "reader" | "writer" | "admin";

export function getInitialRole(): UserRole {
  if (typeof window === "undefined") return "guest";

  const pathname = window.location.pathname;
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/writer")) return "writer";
  if (pathname.startsWith("/reader")) return "reader";

  const saved = (localStorage.getItem("tossatale_user_role") || "").toLowerCase();
  if (saved === "user" || saved === "reader") return "reader";
  if (saved === "writer") return "writer";
  if (saved === "admin") return "admin";
  return "guest";
}

export function useUserRole(): [UserRole, (role: UserRole) => void] {
  const [role, setRoleState] = useState<UserRole>("guest");

  useEffect(() => {
    setRoleState(getInitialRole());

    const handleStorageChange = () => {
      setRoleState(getInitialRole());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setRole = (newRole: UserRole) => {
    localStorage.setItem("tossatale_user_role", newRole);
    setRoleState(newRole);
    window.dispatchEvent(new Event("storage"));
  };

  return [role, setRole];
}

function useTheme(): [string, (next: string) => void] {
  const [theme, setThemeState] = useState<string>("light");

  useEffect(() => {
    const saved = localStorage.getItem("tossatale_theme");
    if (saved) {
      setThemeState(saved);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(prefersDark ? "dark" : "light");
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = (next: string) => {
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tossatale_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tossatale_theme", "light");
    }
    setThemeState(next);
  };

  return [theme, toggleTheme];
}

export function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={isDark ? "Switch to daylight reading mode" : "Switch to night reading mode"}
      onClick={() => toggleTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-8 w-14 items-center rounded-full p-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner",
        isDark ? "bg-[#252529] border border-border" : "bg-[#d8e6fd] border border-primary/20",
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full transition-transform duration-300 shadow-md",
          isDark
            ? "translate-x-[1.45rem] bg-[#d5b064] text-[#161618] shadow-amber-900/40"
            : "translate-x-0 bg-[#5182ed] text-white shadow-blue-500/40",
        )}
      >
        {isDark ? (
          <Moon className="size-3.5 fill-current text-[#161618]" />
        ) : (
          <Sun className="size-3.5 text-white" />
        )}
      </span>
    </button>
  );
}

const roleProfiles: Record<UserRole, { name: string; initials: string; role: string; profileUrl: string; dashboardUrl: string }> = {
  guest: {
    name: "Guest Visitor",
    initials: "G",
    role: "Visitor Mode",
    profileUrl: "/auth",
    dashboardUrl: "/",
  },
  reader: {
    name: "Reader",
    initials: "RD",
    role: "Community Reader",
    profileUrl: "/reader/history",
    dashboardUrl: "/reader",
  },
  writer: {
    name: "Writer",
    initials: "WR",
    role: "Contributing Writer",
    profileUrl: "/writer/profile",
    dashboardUrl: "/writer",
  },
  admin: {
    name: "Editorial Desk",
    initials: "ED",
    role: "Managing Editor",
    profileUrl: "/admin/profile",
    dashboardUrl: "/admin",
  },
};

const roleNavLinks: Record<UserRole, Array<{ label: string; to: string }>> = {
  guest: [],
  reader: [
    { label: "Bookmarks", to: "/reader/bookmarks" },
    { label: "History", to: "/reader/history" },
    { label: "Following", to: "/reader/following" },
  ],
  writer: [
    { label: "Studio Overview", to: "/writer" },
    { label: "My Drafts & Published", to: "/writer/stories" },
    { label: "Analytics", to: "/writer/analytics" },
  ],
  admin: [
    { label: "Control Desk", to: "/admin" },
    { label: "Review Queue", to: "/admin/review-queue" },
    { label: "Homepage Builder", to: "/admin/homepage-builder" },
  ],
};

function UserProfileDropdown({ role, onRoleChange }: { role: UserRole; onRoleChange: (r: UserRole) => void }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const normalizedRole: UserRole = (role && roleProfiles[role.toLowerCase() as UserRole])
    ? (role.toLowerCase() as UserRole)
    : "guest";
  const defaultProfile = roleProfiles[normalizedRole] || roleProfiles.guest;

  const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") || user?.email || defaultProfile.name;
  const userInitials = user?.first_name
    ? user.first_name.substring(0, 2).toUpperCase()
    : displayName.substring(0, 2).toUpperCase() || defaultProfile.initials;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3 text-left transition-colors hover:border-primary shrink-0"
      >
        <Avatar initials={userInitials} size="sm" />
        <div className="hidden text-left md:block">
          <p className="font-sans text-[0.8125rem] font-bold text-heading leading-tight max-w-[120px] truncate">{displayName}</p>
          <p className="text-[0.6875rem] text-primary font-bold uppercase tracking-wider">{normalizedRole}</p>
        </div>
        <ChevronDown className="size-3.5 text-subtle" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-surface p-2 shadow-lift animate-in fade-in slide-in-from-top-2">
          <div className="border-b border-border p-3">
            <p className="font-sans text-[0.875rem] font-bold text-heading truncate">{displayName}</p>
            <p className="text-[0.75rem] text-subtle truncate">{user?.email || defaultProfile.role}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[0.6875rem] font-bold text-primary-hover uppercase tracking-wider">
              <ShieldCheck className="size-3" /> Active: {normalizedRole}
            </div>
          </div>

          <div className="py-2 border-b border-border">
            <Link
              to={defaultProfile.dashboardUrl}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-bold text-heading hover:bg-primary-light hover:text-primary-hover"
            >
              <LayoutDashboard className="size-4 text-primary" />
              <span>{normalizedRole === "reader" ? "Reader Space" : normalizedRole === "writer" ? "Writer Studio" : normalizedRole === "admin" ? "Admin Desk" : "Dashboard"}</span>
            </Link>
            <Link
              to={defaultProfile.profileUrl}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-bold text-heading hover:bg-primary-light hover:text-primary-hover"
            >
              <User className="size-4 text-primary" />
              <span>Profile Settings</span>
            </Link>
          </div>

          <div className="p-1">
            <button
              type="button"
              onClick={async () => {
                await logout();
                onRoleChange("guest");
                setOpen(false);
                toast.success("Signed out successfully");
                navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-bold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center py-1">
      <img
        src={logo}
        alt="tossatale"
        className={cn(
          "h-9 w-auto max-w-[160px] object-contain transition-opacity hover:opacity-90",
          onDark && "brightness-0 invert",
        )}
      />
    </Link>
  );
}

function StoriesDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-[0.875rem] font-semibold transition-all cursor-pointer",
          open ? "bg-primary-light text-primary-hover" : "text-heading/85 hover:bg-primary-light hover:text-primary-hover",
        )}
      >
        <span>Stories</span>
        <ChevronDown className={cn("size-3.5 text-subtle transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 w-48 pt-2 animate-in fade-in slide-in-from-top-2">
          <div className="rounded-2xl border border-border bg-surface p-2 shadow-lift">
            <Link
              to="/stories"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.875rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
            >
              <BookOpen className="size-4 text-primary" />
              <span>All Stories</span>
            </Link>
            <Link
              to="/videos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.875rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
            >
              <Film className="size-4 text-primary" />
              <span>Short Films</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnouncementBar({
  announcement: propAnnouncement,
}: {
  announcement?: AnnouncementSettings | undefined;
}) {
  const [dismissed, setDismissed] = useState(false);

  const { data: homepageData } = useQuery({
    queryKey: ["public-homepage-config"],
    queryFn: async () => {
      try {
        const res = await api.get("/public/homepage/");
        return res.data?.data || res.data || {};
      } catch {
        return {};
      }
    },
    enabled: !propAnnouncement,
  });

  const announcement = propAnnouncement || homepageData?.announcement || defaultAnnouncementSettings;

  if (!announcement || !announcement.enabled || !announcement.text || dismissed) {
    return null;
  }

  return (
    <div className="relative z-50 bg-gradient-to-r from-primary-hover via-primary to-primary-hover px-4 py-2 text-white shadow-paper transition-all">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 text-[0.875rem]">
        <div className="flex flex-1 flex-wrap items-center justify-center gap-2 text-center sm:justify-start">
          {announcement.badgeText && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-sans text-[0.6875rem] font-extrabold tracking-wider uppercase text-white backdrop-blur">
              <Sparkles className="size-3" />
              {announcement.badgeText}
            </span>
          )}
          <span className="font-sans font-medium text-white/95">{announcement.text}</span>
          {announcement.linkText && (
            <Link
              to={announcement.linkTo || "#"}
              className="inline-flex items-center gap-1 font-sans font-bold text-white underline underline-offset-4 hover:text-white/80 transition-colors ml-1"
            >
              {announcement.linkText} <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="grid size-7 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function SiteHeader({ announcement }: { announcement?: AnnouncementSettings | undefined } = {}) {
  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useUserRole();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const roleLinks = (mounted && roleNavLinks[currentRole]) ? roleNavLinks[currentRole] : [];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <AnnouncementBar announcement={announcement} />
      <div className="mx-auto grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] h-18 max-w-[1240px] items-center px-5 py-4 lg:px-8">
        <div className="justify-self-start">
          <Wordmark />
        </div>

        <nav className="justify-self-center hidden items-center gap-2 whitespace-nowrap lg:flex shrink-0">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-primary-light text-primary-hover font-bold shadow-xs" }}
            className="rounded-full px-3.5 py-1.5 font-sans text-[0.875rem] font-semibold text-heading/85 transition-all hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Home
          </Link>

          <StoriesDropdown />

          {navLinks.filter((l) => l.to !== "/").map((l) => (
            <Link
              key={l.to}
              to={l.to as any}
              activeProps={{ className: "bg-primary-light text-primary-hover font-bold shadow-xs" }}
              className="rounded-full px-3.5 py-1.5 font-sans text-[0.875rem] font-semibold text-heading/85 transition-all hover:bg-primary-light hover:text-primary-hover shrink-0"
            >
              {l.label}
            </Link>
          ))}

          {/* Integrated Reader Links in Navbar (Only for Readers) */}
          {mounted && currentRole === "reader" && roleLinks.length > 0 && (
            <div className="ml-1.5 flex items-center gap-0.5 border-l border-border pl-1.5 shrink-0">
              {roleLinks.map((rl) => (
                <Link
                  key={rl.to}
                  to={rl.to}
                  activeProps={{ className: "bg-primary-light text-primary-hover font-bold" }}
                  className="rounded-full px-3 py-1.5 font-sans text-[0.875rem] font-semibold text-primary transition-all hover:bg-primary-light hover:text-primary-hover shrink-0"
                >
                  {rl.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="justify-self-end flex items-center gap-3 shrink-0">
          <Link
            to="/search"
            search={{ q: "" }}
            aria-label="Search tossatale"
            className="hidden size-8 place-items-center rounded-full border border-border bg-surface text-subtle transition-all hover:border-primary hover:text-primary md:grid shrink-0 shadow-xs"
          >
            <Search className="size-4 text-subtle" />
          </Link>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* User Profile Dropdown OR Guest Sign In Buttons */}
          {!mounted || currentRole === "guest" ? (
            <div className="hidden sm:flex items-center gap-2">
              <ButtonLink to="/auth" variant="ghostOutline" size="sm">
                Sign in
              </ButtonLink>
            </div>
          ) : (
            <UserProfileDropdown role={currentRole} onRoleChange={setCurrentRole} />
          )}

          <Button
            variant="quiet"
            size="icon"
            aria-label="Open menu"
            aria-expanded={open}
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Menu className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="absolute right-4 top-full mt-2 z-50 w-72 rounded-2xl border border-border bg-surface p-3 shadow-lift lg:hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-border">
            <span className="font-sans text-[0.625rem] font-black tracking-[0.2em] text-primary uppercase">
              Navigation
            </span>
            <Button variant="quiet" size="icon" className="size-6" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="size-3.5" />
            </Button>
          </div>

          <nav className="mt-2 grid grid-cols-2 gap-1">
            {mobileNavLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to as any}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2.5 py-2 font-sans text-[0.8125rem] font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {currentRole === "guest" ? (
            <div className="mt-3 border-t border-border pt-2.5">
              <ButtonLink to="/auth" variant="ghostOutline" size="sm" className="w-full justify-center px-2 text-[0.75rem]" onClick={() => setOpen(false)}>
                Sign in
              </ButtonLink>
            </div>
          ) : (
            <div className="mt-3 border-t border-border pt-2.5 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-sans text-[0.625rem] font-black tracking-[0.2em] text-primary uppercase">
                  Account ({currentRole})
                </span>
                <span className="text-xs text-subtle truncate max-w-[120px]">{user?.full_name || user?.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <Link
                  to={currentRole === "writer" ? "/writer" : currentRole === "admin" ? "/admin" : "/reader"}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-2.5 py-1.5 font-sans text-[0.75rem] font-bold text-primary hover:bg-primary-light text-center border border-primary/20"
                >
                  Dashboard
                </Link>
                <Link
                  to={currentRole === "writer" ? "/writer/profile" : currentRole === "admin" ? "/admin/profile" : "/reader"}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-2.5 py-1.5 font-sans text-[0.75rem] font-bold text-heading hover:bg-surface-alt text-center border border-border"
                >
                  Profile
                </Link>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setCurrentRole("guest");
                  setOpen(false);
                  toast.success("Signed out successfully");
                  navigate({ to: "/" });
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 py-2 text-xs font-bold text-destructive hover:bg-destructive/15 transition-colors"
              >
                <LogOut className="size-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Stories", to: "/stories" },
      { label: "Blog", to: "/blogs" },
      { label: "Short Films", to: "/videos" },
      { label: "Upcoming Projects", to: "/upcoming-projects" },
    ],
  },
  {
    title: "Community & Writers",
    links: [
      { label: "Writer Registration", to: "/auth?mode=signup" },
      { label: "Writers Directory", to: "/writers" },
      { label: "Newsletter", to: "/#newsletter" },
      { label: "About Us", to: "/about" },
      { label: "Contact & Pitch", to: "/contact" },
      { label: "FAQ & Help", to: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Submission Guidelines", to: "/contact" },
      { label: "Stay Tuned", to: "/upcoming-projects" },
    ],
  },
];

export function SiteFooter({ footer: propFooter }: { footer?: SiteFooterSettings | undefined } = {}) {
  const { data: homepageData } = useQuery({
    queryKey: ["public-homepage-config"],
    queryFn: async () => {
      try {
        const res = await api.get("/public/homepage/");
        return res.data?.data || res.data || {};
      } catch {
        return {};
      }
    },
    enabled: !propFooter,
  });

  const footer = propFooter || homepageData?.footer || defaultFooterSettings;

  const aboutText = footer.aboutText || footer.about_text || defaultFooterSettings.aboutText;
  const tagline = footer.tagline || defaultFooterSettings.tagline;
  const copyrightText = footer.copyrightText || footer.copyright_text || defaultFooterSettings.copyrightText;
  const twitterUrl = footer.twitter || footer.socials?.twitter || "https://twitter.com";
  const instagramUrl = footer.instagram || footer.socials?.instagram || "https://instagram.com";
  const linkedinUrl = footer.linkedin || footer.socials?.linkedin || "https://linkedin.com";
  const youtubeUrl = footer.youtube || footer.socials?.youtube || "https://youtube.com";

  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-sm text-[0.9375rem] text-body">
              {aboutText}
            </p>
            <div className="mt-4 flex items-center gap-3 text-subtle">
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                  <Twitter className="size-4" />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                  <Instagram className="size-4" />
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                  <Linkedin className="size-4" />
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noreferrer" aria-label="YouTube" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                  <Youtube className="size-4" />
                </a>
              )}
            </div>
            <p className="mt-6 font-display text-[1.0625rem] italic text-primary">
              {tagline}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="mb-4 font-sans text-[0.6875rem] font-black tracking-[0.2em] text-primary uppercase">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-[0.9375rem] text-body transition-colors hover:text-primary"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-divider pt-6 text-[0.8125rem] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-heading">Privacy Policy</Link>
            <Link to="/" className="hover:text-heading">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({
  children,
  announcement,
  footer,
}: {
  children: ReactNode;
  announcement?: AnnouncementSettings | undefined;
  footer?: SiteFooterSettings | undefined;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader announcement={announcement} />
      <main>{children}</main>
      <SiteFooter footer={footer} />
      <CookieConsentBanner />
    </div>
  );
}

export function ReaderLayout({
  title,
  blurb,
  actions,
  children,
}: {
  title: string;
  blurb?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8 lg:py-14">
        <header className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-display font-bold leading-[1.1] text-heading">
              {title}
            </h1>
            {blurb && <p className="mt-3 text-[1.0625rem] text-body">{blurb}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
        </header>
        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </SiteLayout>
  );
}
