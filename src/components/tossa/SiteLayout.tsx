import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronDown,
  Clock,
  Facebook,
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
  UserPlus,
  X,
  Youtube,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Avatar, Button, ButtonLink, XIcon } from "@/components/tossa/kit";
import logo from "@/assets/official_tossatale_logo.png";
import faviconLogo from "@/assets/favicon-96x96.png";
import { api } from "@/lib/api";
import { categories, defaultAnnouncementSettings, defaultFooterSettings, type AnnouncementSettings, type SiteFooterSettings } from "@/lib/data";
import { CookieConsentBanner } from "@/components/tossa/CookieConsentBanner";
import { useAuth, normalizeUserRole } from "@/components/auth/AuthContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Blog", to: "/blogs" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const mobileNavLinks = [
  { label: "Home", to: "/" },
  { label: "Stories", to: "/stories" },
  { label: "Blog", to: "/blogs" },
  { label: "Films", to: "/videos" },
  { label: "Search Library", to: "/search" },
];

export type UserRole = "guest" | "reader" | "writer" | "admin";

export function useUserRole(): [UserRole, (role: UserRole) => void] {
  const { user, isAuthenticated } = useAuth();

  const role: UserRole = (isAuthenticated && user)
    ? normalizeUserRole(user.role)
    : "guest";

  const setRole = (newRole: UserRole) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tossatale_user_role", newRole);
      window.dispatchEvent(new Event("storage"));
    }
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

  return (
    <button
      suppressHydrationWarning
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => toggleTheme(theme === "dark" ? "light" : "dark")}
      className="flex size-8 items-center justify-center text-black dark:text-white hover:text-primary transition-colors shrink-0 cursor-pointer"
    >
      {theme === "dark" ? (
        <Sun className="size-4.5 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="size-4.5 text-black hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}

const roleNavLinks: Record<UserRole, { label: string; to: string }[]> = {
  guest: [],
  reader: [
    { label: "Dashboard", to: "/reader" },
    { label: "Bookmarks", to: "/reader/bookmarks" },
  ],
  writer: [
    { label: "Studio", to: "/writer" },
    { label: "My Stories", to: "/writer/stories" },
    { label: "Write", to: "/writer/editor" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin" },
    { label: "Review Queue", to: "/admin/review-queue" },
  ],
};

function UserProfileDropdown({
  role,
  onRoleChange,
}: {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    onRoleChange("guest");
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  const displayName = user?.full_name || user?.email || (role === "admin" ? "Admin" : role === "writer" ? "Writer" : "Reader");
  const userInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="relative shrink-0">
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-2.5 transition-all hover:border-primary/40 cursor-pointer"
      >
        <Avatar
          initials={userInitials}
          gender={(user as any)?.gender || "OTHER"}
          src={user?.avatar_url || ""}
          size="sm"
        />
        <span className="font-sans text-[0.8125rem] font-bold text-heading hidden sm:inline max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className={cn("size-3.5 text-subtle transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-border bg-surface p-2 shadow-lift animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="font-sans text-[0.8125rem] font-bold text-heading truncate">{displayName}</p>
            <p className="font-sans text-[0.6875rem] font-extrabold uppercase tracking-wider text-primary">
              {role === "admin" ? "Administrator" : role === "writer" ? "Story Writer" : "Reader"}
            </p>
          </div>

          <div className="space-y-0.5">
            {role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
              >
                <LayoutDashboard className="size-4 text-primary" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            {role === "writer" && (
              <>
                <Link
                  to="/writer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
                >
                  <LayoutDashboard className="size-4 text-primary" />
                  <span>Writer Studio</span>
                </Link>
                <Link
                  to="/writer/editor"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
                >
                  <PenLine className="size-4 text-primary" />
                  <span>Write New Story</span>
                </Link>
              </>
            )}
            {role === "reader" && (
              <Link
                to="/reader/history"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
              >
                <Clock className="size-4 text-primary" />
                <span>Reading History</span>
              </Link>
            )}
          </div>

          <div className="border-t border-border mt-1 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-sans font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
    <Link to="/" className="inline-flex items-center py-0.5">
      {/* Mobile & Tablet Compact Logo */}
      <img
        src={faviconLogo}
        alt="tossatale"
        className={cn(
          "size-9 sm:size-10 object-contain lg:hidden transition-opacity hover:opacity-90 shadow-xs",
          onDark && "brightness-0 invert",
        )}
      />
      {/* Desktop Full Logo */}
      <img
        src={logo}
        alt="tossatale"
        className={cn(
          "hidden lg:block h-11 sm:h-12 w-auto max-w-[190px] object-contain transition-opacity hover:opacity-90",
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
          "flex items-center gap-1 px-3 py-1.5 font-sans text-[0.9375rem] font-medium transition-colors cursor-pointer text-black dark:text-white hover:text-[#2B638C]",
          open && "text-[#2B638C] font-bold",
        )}
      >
        <span>Stories</span>
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 w-48 pt-2 animate-in fade-in slide-in-from-top-2">
          <div className="rounded-2xl border border-border bg-surface p-2 shadow-lift">
            <Link
              to="/stories"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
            >
              <BookOpen className="size-4 text-primary" />
              <span>All Stories</span>
            </Link>
            <Link
              to="/videos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
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

  if (!announcement || !announcement.enabled || !announcement.text) {
    return null;
  }

  const AnnouncementContent = () => (
    <div className="inline-flex items-center gap-2 whitespace-nowrap text-[0.8125rem] sm:text-[0.875rem] px-4 shrink-0">
      {announcement.badgeText && (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-sans text-[0.6875rem] font-extrabold tracking-wider uppercase text-white backdrop-blur shrink-0">
          <Sparkles className="size-3" />
          {announcement.badgeText}
        </span>
      )}
      <span className="font-sans font-medium text-white/95 shrink-0">{announcement.text}</span>
      {announcement.linkText && (
        <Link
          to={announcement.linkTo || "#"}
          className="inline-flex items-center gap-1 font-sans font-bold text-white underline underline-offset-4 hover:text-white/80 transition-colors ml-1 shrink-0"
        >
          {announcement.linkText} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );

  return (
    <div className="relative z-50 bg-gradient-to-r from-primary-hover via-primary to-primary-hover py-2 text-white shadow-paper transition-all overflow-hidden select-none">
      {/* Desktop View: Centered single line */}
      <div className="hidden md:flex items-center justify-center w-full">
        <AnnouncementContent />
      </div>

      {/* Mobile View: Continuous single-line scrolling carousel */}
      <div className="md:hidden flex w-full overflow-hidden">
        <div className="animate-announcement-ticker flex items-center">
          <AnnouncementContent />
          <AnnouncementContent />
          <AnnouncementContent />
          <AnnouncementContent />
        </div>
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
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-colors">
      <AnnouncementBar announcement={announcement} />
      <div className="mx-auto grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] h-18 max-w-[1240px] items-center px-5 py-3 lg:px-8">
        <div className="justify-self-start">
          <Wordmark />
        </div>

        <nav className="justify-self-center hidden items-center gap-5 whitespace-nowrap lg:flex shrink-0">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-[#2B638C] dark:text-[#5295c5] font-bold" }}
            className="px-2 py-1 font-sans text-[0.9375rem] font-medium text-black dark:text-white transition-colors hover:text-[#2B638C] shrink-0"
          >
            Home
          </Link>

          <StoriesDropdown />

          <Link
            to="/blogs"
            activeProps={{ className: "text-[#2B638C] dark:text-[#5295c5] font-bold" }}
            className="px-2 py-1 font-sans text-[0.9375rem] font-medium text-black dark:text-white transition-colors hover:text-[#2B638C] shrink-0"
          >
            Blog
          </Link>

          <Link
            to="/about"
            activeProps={{ className: "text-[#2B638C] dark:text-[#5295c5] font-bold" }}
            className="px-2 py-1 font-sans text-[0.9375rem] font-medium text-black dark:text-white transition-colors hover:text-[#2B638C] shrink-0"
          >
            About
          </Link>

          <Link
            to="/contact"
            activeProps={{ className: "text-[#2B638C] dark:text-[#5295c5] font-bold" }}
            className="px-2 py-1 font-sans text-[0.9375rem] font-medium text-black dark:text-white transition-colors hover:text-[#2B638C] shrink-0"
          >
            Contact
          </Link>

          {/* Integrated Reader Links in Navbar (Only for Readers) */}
          {mounted && currentRole === "reader" && roleLinks.length > 0 && (
            <div className="ml-1.5 flex items-center gap-1 border-l border-border pl-2 shrink-0">
              {roleLinks.map((rl) => (
                <Link
                  key={rl.to}
                  to={rl.to}
                  activeProps={{ className: "text-[#2B638C] dark:text-[#5295c5] font-bold" }}
                  className="px-2 py-1 font-sans text-[0.875rem] font-medium text-black dark:text-white transition-colors hover:text-[#2B638C] shrink-0"
                >
                  {rl.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="justify-self-end flex items-center gap-2.5 shrink-0">
          <Link
            to="/search"
            search={{ q: "" }}
            aria-label="Search tossatale"
            className="hidden size-8 place-items-center text-black dark:text-white transition-colors hover:text-primary md:grid shrink-0 cursor-pointer"
          >
            <Search className="size-4.5" />
          </Link>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* Desktop User Profile Dropdown OR Guest Sign In */}
          {!mounted || currentRole === "guest" ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF6B35] hover:bg-[#e85b27] text-white font-bold px-4.5 py-2 text-[0.875rem] shadow-xs transition-all hover:shadow-md"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <div className="hidden lg:block">
              <UserProfileDropdown role={currentRole} onRoleChange={setCurrentRole} />
            </div>
          )}

          {/* Mobile Single Menu Trigger: Shows Avatar when logged in, or Hamburger when guest */}
          {mounted && currentRole !== "guest" ? (
            <button
              type="button"
              aria-label="Open navigation and account menu"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden flex items-center gap-1.5 rounded-full border border-border bg-surface p-1 pr-2 transition-all hover:border-primary/40 cursor-pointer shadow-xs"
            >
              <Avatar
                initials={(user?.full_name || user?.email || "User").substring(0, 2).toUpperCase()}
                gender={(user as any)?.gender || "OTHER"}
                src={user?.avatar_url || ""}
                size="xs"
              />
              <Menu className="size-3.5 text-heading" />
            </button>
          ) : (
            <Button
              variant="quiet"
              size="icon"
              aria-label="Open menu"
              aria-expanded={open}
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute right-4 top-full mt-2 z-50 w-72 rounded-2xl border border-border bg-surface p-3.5 shadow-lift lg:hidden animate-in fade-in slide-in-from-top-2">
          {/* Header row in mobile popup */}
          <div className="flex items-center justify-between px-1 pb-2 border-b border-border">
            <span className="font-sans text-[0.625rem] font-black tracking-[0.2em] text-primary uppercase">
              {currentRole === "guest" ? "Navigation" : "Menu & Account"}
            </span>
            <Button variant="quiet" size="icon" className="size-6" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="size-3.5" />
            </Button>
          </div>

          {/* If Logged In: Account Identity Card at Top */}
          {currentRole !== "guest" && (
            <div className="mt-2.5 p-2 rounded-xl bg-surface-alt/70 border border-border">
              <div className="flex items-center gap-2.5">
                <Avatar
                  initials={(user?.full_name || user?.email || "User").substring(0, 2).toUpperCase()}
                  gender={(user as any)?.gender || "OTHER"}
                  src={user?.avatar_url || ""}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[0.8125rem] font-bold text-heading truncate">
                    {user?.full_name || user?.email || "My Account"}
                  </p>
                  <p className="font-sans text-[0.6875rem] font-extrabold uppercase tracking-wider text-primary">
                    {currentRole === "admin" ? "Administrator" : currentRole === "writer" ? "Story Writer" : "Reader"}
                  </p>
                </div>
              </div>

              {/* Quick Role Links */}
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-border/60 pt-2">
                {currentRole === "reader" && (
                  <>
                    <Link
                      to="/reader"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1.5 font-sans text-[0.75rem] font-bold text-primary hover:bg-primary-light text-center border border-primary/20"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/reader/history"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1.5 font-sans text-[0.75rem] font-bold text-heading hover:bg-primary-light text-center border border-border"
                    >
                      History
                    </Link>
                  </>
                )}
                {currentRole === "writer" && (
                  <>
                    <Link
                      to="/writer"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1.5 font-sans text-[0.75rem] font-bold text-primary hover:bg-primary-light text-center border border-primary/20"
                    >
                      Studio
                    </Link>
                    <Link
                      to="/writer/editor"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1.5 font-sans text-[0.75rem] font-bold text-heading hover:bg-primary-light text-center border border-border"
                    >
                      New Story
                    </Link>
                  </>
                )}
                {currentRole === "admin" && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1.5 font-sans text-[0.75rem] font-bold text-primary hover:bg-primary-light text-center border border-primary/20"
                    >
                      Admin Panel
                    </Link>
                    <Link
                      to="/admin/review-queue"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1.5 font-sans text-[0.75rem] font-bold text-heading hover:bg-primary-light text-center border border-border"
                    >
                      Review Queue
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="mt-2.5">
            <p className="px-1 mb-1 font-sans text-[0.625rem] font-bold tracking-wider text-subtle uppercase">
              Explore
            </p>
            <nav className="grid grid-cols-2 gap-1">
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
          </div>

          {/* Bottom Action: Sign in (Guest) OR Sign out (Logged in) */}
          {currentRole === "guest" ? (
            <div className="mt-3 border-t border-border pt-2.5">
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-[#FF6B35] hover:bg-[#e85b27] text-white font-bold py-2 text-[0.8125rem] shadow-xs transition-all"
              >
                Sign in / Register
              </Link>
            </div>
          ) : (
            <div className="mt-3 border-t border-border pt-2">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setCurrentRole("guest");
                  setOpen(false);
                  navigate({ to: "/" });
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-sans text-[0.8125rem] font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="size-4" /> Sign Out
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
      { label: "Home", to: "/" },
      { label: "Stories", to: "/stories" },
      { label: "Blog", to: "/blogs" },
      { label: "Short Films", to: "/videos" },
      { label: "Upcoming Projects", to: "/upcoming-projects" },
    ],
  },
  {
    title: "Writers",
    links: [
      { label: "Writers Directory", to: "/writers" },
      { label: "Reader to Writer", to: "/auth?mode=signup" },
      { label: "Help", to: "/faq" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact Us", to: "/contact" },
      { label: "FAQs", to: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Submission Guidelines", to: "/contact" },
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

  const copyrightText = footer.copyrightText || footer.copyright_text || defaultFooterSettings.copyrightText;
  const twitterUrl = footer.twitter || footer.socials?.twitter || "https://twitter.com";
  const instagramUrl = footer.instagram || footer.socials?.instagram || "https://instagram.com";
  const linkedinUrl = footer.linkedin || footer.socials?.linkedin || "https://linkedin.com";
  const youtubeUrl = footer.youtube || footer.socials?.youtube || "https://youtube.com";
  const facebookUrl = (footer as any).facebook || (footer as any).socials?.facebook || "https://facebook.com";

  return (
    <footer className="mt-16 bg-slate-100 dark:bg-zinc-900 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] text-black dark:text-white">
      <div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 font-sans text-[0.875rem] font-bold text-black dark:text-white uppercase tracking-wider">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[0.9375rem] font-normal text-black/80 dark:text-white/80 transition-colors hover:text-[#2B638C] dark:hover:text-[#5295c5]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-black/10 dark:border-white/10 pt-6 text-[0.875rem] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-black dark:text-white">All rights reserved.</p>
            <p className="text-subtle text-[0.8125rem]">{copyrightText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-black dark:text-white mr-1 text-[0.875rem]">Follow us:</span>
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid size-8 place-items-center rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs transition-transform hover:scale-105 hover:text-primary">
                <Facebook className="size-4" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-8 place-items-center rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs transition-transform hover:scale-105 hover:text-primary">
                <Instagram className="size-4" />
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noreferrer" aria-label="X" className="grid size-8 place-items-center rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs transition-transform hover:scale-105 hover:text-primary">
                <XIcon className="size-3.5" />
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-8 place-items-center rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs transition-transform hover:scale-105 hover:text-primary">
                <Linkedin className="size-4" />
              </a>
            )}
            {youtubeUrl && (
              <a href={youtubeUrl} target="_blank" rel="noreferrer" aria-label="YouTube" className="grid size-8 place-items-center rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs transition-transform hover:scale-105 hover:text-primary">
                <Youtube className="size-4" />
              </a>
            )}
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
