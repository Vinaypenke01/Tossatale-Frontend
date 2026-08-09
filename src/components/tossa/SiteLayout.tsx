import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Globe,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  X,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import { Avatar, Button, ButtonLink } from "@/components/tossa/kit";
import logo from "@/assets/tossatale_redefine_logo.jpg";
import { categories, defaultAnnouncementSettings, defaultFooterSettings, type AnnouncementSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Films", to: "/videos" },
  // { label: "Writers", to: "/writers" },
  { label: "Blogs", to: "/blogs" },
];

const mobileNavLinks = [
  { label: "Home", to: "/" },
  { label: "Stories", to: "/stories" },
  { label: "Series", to: "/series" },
  { label: "Films", to: "/videos" },
  { label: "Blogs", to: "/blogs" },
  { label: "Contact", to: "/contact" },
  { label: "Categories", to: "/categories" },
];

export type UserRole = "guest" | "reader" | "writer" | "admin";

export function getInitialRole(): UserRole {
  if (typeof window === "undefined") return "guest";

  const pathname = window.location.pathname;
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/writer")) return "writer";
  if (pathname.startsWith("/reader")) return "reader";

  const saved = localStorage.getItem("tossatale_user_role") as UserRole;
  if (saved && (saved === "guest" || saved === "reader" || saved === "writer" || saved === "admin")) {
    return saved;
  }
  return "guest";
}

export function useUserRole(): [UserRole, (r: UserRole) => void] {
  const [role, setRole] = useState<UserRole>(getInitialRole);

  useEffect(() => {
    const handleRoleUpdate = () => {
      setRole(getInitialRole());
    };

    window.addEventListener("storage", handleRoleUpdate);
    window.addEventListener("tossatale_role_change", handleRoleUpdate);

    return () => {
      window.removeEventListener("storage", handleRoleUpdate);
      window.removeEventListener("tossatale_role_change", handleRoleUpdate);
    };
  }, []);

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("tossatale_user_role", newRole);
      window.dispatchEvent(new Event("tossatale_role_change"));
    }
  };

  return [role, updateRole];
}

export type Theme = "light" | "dark";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("tossatale_theme") as Theme;
  if (saved && (saved === "light" || saved === "dark")) {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme(): [Theme, (t?: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = (newTheme?: Theme) => {
    const target = newTheme || (theme === "dark" ? "light" : "dark");
    setTheme(target);
    if (typeof window !== "undefined") {
      localStorage.setItem("tossatale_theme", target);
      if (target === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return [theme, toggleTheme];
}

export function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();

  return (
    <Button
      variant="ghostOutline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        toggleTheme(next);
        toast.info(next === "dark" ? "Switched to Dark Mode 🌙" : "Switched to Light Mode ☀️");
      }}
      className="size-9 rounded-full border border-border bg-surface text-body hover:border-primary hover:text-primary transition-all duration-300 active:scale-95 shrink-0 shadow-xs"
    >
      {theme === "dark" ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-heading" />}
    </Button>
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
  writer: {
    name: "Meera Raghavan",
    initials: "MR",
    role: "Verified Writer",
    profileUrl: "/writer/profile",
    dashboardUrl: "/writer",
  },
  admin: {
    name: "Devika Rao",
    initials: "DR",
    role: "Senior Managing Editor",
    profileUrl: "/admin/profile",
    dashboardUrl: "/admin",
  },
  reader: {
    name: "Aniket Bose",
    initials: "AB",
    role: "Member Reader",
    profileUrl: "/reader",
    dashboardUrl: "/reader",
  },
};

const roleNavLinks: Record<UserRole, { label: string; to: string }[]> = {
  guest: [],
  writer: [
    { label: "Studio", to: "/writer" },
    { label: "New Story", to: "/writer/editor" },
    { label: "My Stories", to: "/writer/stories" },
    { label: "My Series", to: "/writer/series" },
    { label: "My Profile", to: "/writer/profile" },
  ],
  admin: [
    { label: "Admin Desk", to: "/admin" },
    { label: "Review Queue", to: "/admin/review-queue" },
    { label: "Homepage Builder", to: "/admin/homepage-builder" },
    { label: "Writers", to: "/admin/writers" },
    { label: "Admin Profile", to: "/admin/profile" },
  ],
  reader: [
    { label: "Dashboard", to: "/reader" },
    { label: "Bookmarks", to: "/reader/bookmarks" },
    { label: "History", to: "/reader/history" },
    { label: "Following", to: "/reader/following" },
  ],
};

function UserProfileDropdown({
  role,
  onRoleChange,
}: {
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const profile = roleProfiles[role];

  const handleRoleSelect = (r: UserRole) => {
    onRoleChange(r);
    setDropdownOpen(false);
    if (r === "writer") {
      toast.info("Switched to Writer Mode — Navigating to Studio...");
      navigate({ to: "/writer" });
    } else if (r === "admin") {
      toast.info("Switched to Admin Mode — Navigating to Admin Desk...");
      navigate({ to: "/admin" });
    } else {
      toast.info("Switched to Reader Mode!");
      navigate({ to: "/reader" });
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3 shadow-paper transition-colors hover:border-primary"
      >
        <Avatar initials={profile.initials} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="font-sans text-[0.8125rem] font-bold text-heading leading-none truncate max-w-[110px]">
            {profile.name}
          </p>
          <span className="font-sans text-[0.625rem] font-extrabold text-primary uppercase tracking-wider">
            {role}
          </span>
        </div>
        <ChevronDown className="size-3.5 text-subtle" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-surface p-4 shadow-lift z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Avatar initials={profile.initials} size="md" />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[0.9375rem] font-bold text-heading truncate">
                {profile.name}
              </p>
              <p className="text-[0.75rem] text-subtle truncate">{profile.role}</p>
            </div>
          </div>

          <div className="py-2 space-y-1">
            <Link
              to={profile.profileUrl}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-sans font-bold text-body hover:bg-primary-light hover:text-primary-hover"
            >
              <User className="size-4" /> My Profile & Settings
            </Link>
            <Link
              to={profile.dashboardUrl}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-sans font-bold text-body hover:bg-primary-light hover:text-primary-hover"
            >
              <LayoutDashboard className="size-4" /> Role Dashboard
            </Link>
          </div>

          <div className="border-t border-border pt-3 mt-1">
            <p className="font-sans text-[0.6875rem] font-black tracking-widest text-subtle uppercase mb-2">
              Active Role Switcher
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-alt p-1">
              {(["reader", "writer", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={cn(
                    "rounded-lg py-1.5 font-sans text-[0.75rem] font-bold capitalize transition-colors",
                    role === r ? "bg-primary text-primary-foreground shadow-sm" : "text-subtle hover:text-heading",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onRoleChange("guest");
                toast.info("Logged out of tossatale.");
                navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-sans font-bold text-error hover:bg-error/10 text-left"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src={logo}
        alt="tossatale"
        width={40}
        height={40}
        className="size-10  object-cover shadow-paper"
      />
      <span
        className={cn(
          "font-display text-[1.35rem] leading-none font-bold tracking-tight",
          onDark ? "text-white" : "text-heading",
        )}
      >
        tossatale
      </span>
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1.5 font-sans text-[0.8125rem] font-bold transition-colors",
          open ? "bg-primary-light text-primary-hover" : "text-body hover:bg-primary-light hover:text-primary-hover",
        )}
      >
        <span>Stories</span>
        <ChevronDown className={cn("size-3 text-subtle transition-transform duration-200", open && "rotate-180")} />
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
              to="/series"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.875rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
            >
              <Layers className="size-4 text-primary" />
              <span>Story Series</span>
            </Link>
            <Link
              to="/categories"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.875rem] font-sans font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
            >
              <Sparkles className="size-4 text-primary" />
              <span>Categories</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnouncementBar({
  announcement = defaultAnnouncementSettings,
}: {
  announcement?: AnnouncementSettings | undefined;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement.enabled || !announcement.text || dismissed) {
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

  const roleLinks = roleNavLinks[currentRole];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <AnnouncementBar announcement={announcement} />
      <div className="mx-auto flex h-18 max-w-[1240px] items-center gap-6 px-5 py-4 lg:px-8">
        <Wordmark />

        <nav className="ml-auto hidden items-center gap-1 whitespace-nowrap lg:flex shrink-0">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-primary-light text-primary-hover" }}
            className="rounded-full px-2.5 py-1.5 font-sans text-[0.8125rem] font-bold text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Home
          </Link>

          <StoriesDropdown />

          <Link
            to="/videos"
            activeProps={{ className: "bg-primary-light text-primary-hover" }}
            className="rounded-full px-2.5 py-1.5 font-sans text-[0.8125rem] font-bold text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Films
          </Link>

          {/* <Link to="/writers">Writers</Link> */}

          <Link
            to="/blogs"
            activeProps={{ className: "bg-primary-light text-primary-hover" }}
            className="rounded-full px-2.5 py-1.5 font-sans text-[0.8125rem] font-bold text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Blogs
          </Link>

          <Link
            to="/contact"
            activeProps={{ className: "bg-primary-light text-primary-hover" }}
            className="rounded-full px-2.5 py-1.5 font-sans text-[0.8125rem] font-bold text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Contact
          </Link>

          {/* Integrated Reader Links in Navbar (Only for Readers) */}
          {currentRole === "reader" && roleLinks.length > 0 && (
            <div className="ml-1.5 flex items-center gap-0.5 border-l border-border pl-1.5 shrink-0">
              {roleLinks.map((rl) => (
                <Link
                  key={rl.to}
                  to={rl.to}
                  activeProps={{ className: "bg-primary-light text-primary-hover" }}
                  className="rounded-full px-2.5 py-1.5 font-sans text-[0.8125rem] font-bold text-primary transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
                >
                  {rl.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            to="/search"
            aria-label="Search tossatale"
            className="hidden h-8.5 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-[0.75rem] text-subtle transition-colors hover:border-primary hover:text-primary md:flex shrink-0"
          >
            <Search className="size-3.5 text-subtle" />
            <span>Search</span>
            <kbd className="rounded-md bg-surface-alt px-1 py-0.5 font-sans text-[0.625rem] font-bold text-subtle">
              ⌘K
            </kbd>
          </Link>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* User Profile Dropdown OR Guest Sign In Buttons */}
          {currentRole === "guest" ? (
            <div className="hidden sm:flex items-center gap-2">
              <ButtonLink to="/auth" variant="ghostOutline" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink to="/auth" size="sm">
                Become Writer
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
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2.5 py-2 font-sans text-[0.8125rem] font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {currentRole === "guest" && (
            <div className="mt-3 border-t border-border pt-2.5 grid grid-cols-2 gap-1.5">
              <ButtonLink to="/auth" variant="ghostOutline" size="sm" className="w-full justify-center px-2 text-[0.75rem]" onClick={() => setOpen(false)}>
                Sign in
              </ButtonLink>
              <ButtonLink to="/auth" size="sm" className="w-full justify-center px-2 text-[0.75rem]" onClick={() => setOpen(false)}>
                Become Writer
              </ButtonLink>
            </div>
          )}

          {currentRole === "reader" && (
            <div className="mt-3 border-t border-border pt-2">
              <span className="px-2 font-sans text-[0.625rem] font-black tracking-[0.2em] text-primary uppercase">
                Reader Options
              </span>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {roleLinks.map((rl) => (
                  <Link
                    key={rl.to}
                    to={rl.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-2.5 py-1.5 font-sans text-[0.75rem] font-bold text-primary hover:bg-primary-light"
                  >
                    {rl.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

const footerColumns = [
  {
    title: "Read",
    links: [
      { label: "Stories", to: "/stories" },
      { label: "Story series", to: "/series" },
      { label: "Categories", to: "/categories" },
      { label: "Videos", to: "/videos" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Writers", to: "/writers" },
      { label: "The Journal", to: "/blogs" },
      { label: "About us", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms & conditions", to: "/terms" },
      { label: "Coming soon", to: "/coming-soon" },
    ],
  },
];

function FooterRoleSwitcher() {
  const [currentRole, setCurrentRole] = useUserRole();
  const navigate = useNavigate();

  const handleRoleClick = (r: UserRole) => {
    setCurrentRole(r);
    if (r === "writer") {
      toast.success("Switched to Writer Studio mode — Redirecting to Studio...");
      navigate({ to: "/writer" });
    } else if (r === "admin") {
      toast.success("Switched to Admin Control Desk mode — Redirecting to Desk...");
      navigate({ to: "/admin" });
    } else if (r === "reader") {
      toast.success("Switched to Reader Experience mode!");
      navigate({ to: "/reader" });
    } else {
      toast.info("Switched to Guest Visitor view");
      navigate({ to: "/" });
    }
  };

  return (
    <div className="mt-12 rounded-3xl border border-border bg-surface-alt p-6 shadow-paper">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
            <p className="font-sans text-[0.75rem] font-black tracking-[0.2em] text-primary uppercase">
              Platform Mode & Role Switcher
            </p>
          </div>
          <p className="mt-1 text-[0.875rem] text-body">
            Switch application modes instantly to explore Reader, Writer Studio, or Admin Desk views.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(
            [
              ["guest", "👁️ Guest View"],
              ["reader", "📖 Reader View"],
              ["writer", "✍️ Writer Studio"],
              ["admin", "🛡️ Admin Desk"],
            ] as const
          ).map(([rKey, label]) => {
            const isActive = currentRole === rKey;
            return (
              <button
                key={rKey}
                type="button"
                onClick={() => handleRoleClick(rKey)}
                className={cn(
                  "rounded-2xl px-4 py-2.5 font-sans text-[0.875rem] font-bold transition-all shadow-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lift scale-[1.03]"
                    : "bg-surface border border-border text-body hover:border-primary hover:text-primary hover:bg-primary-light/50",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-sm text-[0.9375rem] text-body">
              {defaultFooterSettings.aboutText}
            </p>
            <p className="mt-6 font-display text-[1.0625rem] italic text-primary">
              {defaultFooterSettings.tagline}
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

        {/* Footer Role Switcher Bar */}
        <FooterRoleSwitcher />

        <div className="mt-10 flex flex-col gap-3 border-t border-divider pt-6 text-[0.8125rem] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>{defaultFooterSettings.copyrightText}</p>
          <p>{defaultFooterSettings.subnoteText}</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({
  children,
  announcement,
}: {
  children: ReactNode;
  announcement?: AnnouncementSettings | undefined;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader announcement={announcement} />
      <main>{children}</main>
      <SiteFooter />
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
