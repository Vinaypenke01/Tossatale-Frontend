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
import { toast } from "sonner";

import { Avatar, Button, ButtonLink } from "@/components/tossa/kit";
import logo from "@/assets/tossatale_offical_logo-removebg-preview.png";
import { categories, defaultAnnouncementSettings, defaultFooterSettings, type AnnouncementSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Films", to: "/videos" },
  // { label: "Writers", to: "/writers" },
  { label: "Blog", to: "/blogs" },
];

const mobileNavLinks = [
  { label: "Home", to: "/" },
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

  const saved = localStorage.getItem("tossatale_user_role") as UserRole;
  return saved || "guest";
}

export function useUserRole(): [UserRole, (role: UserRole) => void] {
  const [role, setRoleState] = useState<UserRole>(getInitialRole);

  useEffect(() => {
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

export function useTheme(): [string, (theme: string) => void] {
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
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
      aria-label="Toggle theme"
      onClick={() => {
        const next = isDark ? "light" : "dark";
        toggleTheme(next);
        toast.info(next === "dark" ? "Switched to Dark Mode 🌙" : "Switched to Light Mode ☀️");
      }}
      className={cn(
        "relative flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-all duration-300 focus:outline-none border shadow-inner",
        isDark
          ? "bg-[#161618] border-white/15"
          : "bg-[#dce6fd] border-[#b9cdfb]",
      )}
    >
      <span
        className={cn(
          "grid size-6 place-items-center rounded-full transition-all duration-300 ease-out shadow-md",
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
    name: "Ananya Sharma",
    initials: "AS",
    role: "Avid Reader",
    profileUrl: "/reader/history",
    dashboardUrl: "/reader",
  },
  writer: {
    name: "Meera Raghavan",
    initials: "MR",
    role: "Contributing Writer",
    profileUrl: "/writer/profile",
    dashboardUrl: "/writer",
  },
  admin: {
    name: "Tossatale Desk",
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
  const profile = roleProfiles[role];
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3 text-left transition-colors hover:border-primary shrink-0"
      >
        <Avatar initials={profile.initials} size="sm" />
        <div className="hidden text-left md:block">
          <p className="font-sans text-[0.8125rem] font-bold text-heading leading-tight">{profile.name}</p>
          <p className="text-[0.6875rem] text-primary font-bold uppercase tracking-wider">{role}</p>
        </div>
        <ChevronDown className="size-3.5 text-subtle" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-surface p-2 shadow-lift animate-in fade-in slide-in-from-top-2">
          <div className="border-b border-border p-3">
            <p className="font-sans text-[0.875rem] font-bold text-heading">{profile.name}</p>
            <p className="text-[0.75rem] text-subtle">{profile.role}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[0.6875rem] font-bold text-primary-hover uppercase tracking-wider">
              <ShieldCheck className="size-3" /> Active: {role}
            </div>
          </div>

          <div className="py-2 border-b border-border">
            <Link
              to={profile.dashboardUrl}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-bold text-heading hover:bg-primary-light hover:text-primary-hover"
            >
              <LayoutDashboard className="size-4 text-primary" />
              <span>{role === "reader" ? "Reader Space" : role === "writer" ? "Writer Studio" : role === "admin" ? "Admin Desk" : "Dashboard"}</span>
            </Link>
            <Link
              to={profile.profileUrl}
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
              onClick={() => {
                onRoleChange("guest");
                setOpen(false);
                toast.success("Switched to Guest Mode");
                navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.875rem] font-bold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Switch to Guest</span>
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
      <div className="mx-auto grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] h-18 max-w-[1240px] items-center px-5 py-4 lg:px-8">
        <div className="justify-self-start">
          <Wordmark />
        </div>

        <nav className="justify-self-center hidden items-center gap-2 whitespace-nowrap lg:flex shrink-0">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-primary-light text-primary-hover font-bold" }}
            className="rounded-full px-3 py-1.5 font-sans text-[0.8125rem] font-medium text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Home
          </Link>

          <StoriesDropdown />

          <Link
            to="/videos"
            activeProps={{ className: "bg-primary-light text-primary-hover font-bold" }}
            className="rounded-full px-3 py-1.5 font-sans text-[0.8125rem] font-medium text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Films
          </Link>

          <Link
            to="/blogs"
            activeProps={{ className: "bg-primary-light text-primary-hover font-bold" }}
            className="rounded-full px-3 py-1.5 font-sans text-[0.8125rem] font-medium text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
          >
            Blog
          </Link>

          <Link
            to="/contact"
            activeProps={{ className: "bg-primary text-primary-foreground font-bold" }}
            className="rounded-full px-3.5 py-1.5 font-sans text-[0.8125rem] font-medium text-body transition-colors hover:bg-primary-light hover:text-primary-hover shrink-0"
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

        <div className="justify-self-end flex items-center gap-3 shrink-0">
          <Link
            to="/search"
            aria-label="Search tossatale"
            className="hidden size-8 place-items-center rounded-full border border-border bg-surface text-subtle transition-all hover:border-primary hover:text-primary md:grid shrink-0 shadow-xs"
          >
            <Search className="size-4 text-subtle" />
          </Link>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* User Profile Dropdown OR Guest Sign In Buttons */}
          {currentRole === "guest" ? (
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
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2.5 py-2 font-sans text-[0.8125rem] font-bold text-heading hover:bg-primary-light hover:text-primary-hover transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {currentRole === "guest" && (
            <div className="mt-3 border-t border-border pt-2.5">
              <ButtonLink to="/auth" variant="ghostOutline" size="sm" className="w-full justify-center px-2 text-[0.75rem]" onClick={() => setOpen(false)}>
                Sign in
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
    title: "Explore",
    links: [
      { label: "Stories", to: "/stories" },
      { label: "Blog", to: "/blogs" },
      { label: "Short Films", to: "/videos" },
      { label: "Upcoming Projects", to: "/upcoming-projects" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Newsletter", to: "/#newsletter" },
      { label: "Writers", to: "/writers" },
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
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
                suppressHydrationWarning
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
            <div className="mt-4 flex items-center gap-3 text-subtle">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                <Twitter className="size-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                <Instagram className="size-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                <Linkedin className="size-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="grid size-8 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-primary hover:text-primary">
                <Youtube className="size-4" />
              </a>
            </div>
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
