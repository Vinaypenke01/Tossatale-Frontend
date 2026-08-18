import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bookmark,
  Clock,
  FileCheck2,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  Layers,
  LogOut,
  PenLine,
  User,
  Users,
  Newspaper,
  Youtube,
  Clapperboard,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Avatar } from "@/components/tossa/kit";
import logo from "@/assets/tossatale_redefine_logo.jpg";
import { ThemeToggle } from "@/components/tossa/SiteLayout";
import { cn } from "@/lib/utils";

export type Role = "admin" | "writer" | "reader";

type NavItem = { label: string; to: string; icon: LucideIcon };

const navs: Record<Role, NavItem[]> = {
  admin: [
    { label: "Overview", to: "/admin", icon: LayoutDashboard },
    { label: "Write story", to: "/admin/editor", icon: PenLine },
    { label: "Blogs", to: "/admin/blogs", icon: Newspaper },
    { label: "Videos", to: "/admin/videos", icon: Youtube },
    { label: "Upcoming projects", to: "/admin/upcoming-projects", icon: Clapperboard },
    { label: "Review queue", to: "/admin/review-queue", icon: FileCheck2 },
    { label: "Homepage builder", to: "/admin/homepage-builder", icon: LayoutTemplate },
    { label: "Writers", to: "/admin/writers", icon: Users },
    { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    { label: "Profile", to: "/admin/profile", icon: User },
  ],
  writer: [
    { label: "Studio", to: "/writer", icon: LayoutDashboard },
    { label: "New story", to: "/writer/editor", icon: PenLine },
    { label: "My stories", to: "/writer/stories", icon: Library },
    { label: "My series", to: "/writer/series", icon: Layers },
    { label: "Analytics", to: "/writer/analytics", icon: BarChart3 },
    { label: "My profile", to: "/writer/profile", icon: User },
  ],
  reader: [
    { label: "Dashboard", to: "/reader", icon: LayoutDashboard },
    { label: "Bookmarks", to: "/reader/bookmarks", icon: Bookmark },
    { label: "History", to: "/reader/history", icon: Clock },
    { label: "Following", to: "/reader/following", icon: UserPlus },
  ],
};

const personas: Record<Role, { name: string; initials: string; role: string }> = {
  admin: { name: "Devika Rao", initials: "DR", role: "Managing editor" },
  writer: { name: "Meera Raghavan", initials: "MR", role: "Writer · verified" },
  reader: { name: "Aniket Bose", initials: "AB", role: "Member since 2024" },
};

export function StatCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-paper">
      <p className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-subtle uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-[2rem] leading-none text-heading">{value}</p>
      <p className="mt-2 text-[0.8125rem] text-subtle">
        {delta && <span className="font-sans font-bold text-success">{delta}</span>} {hint}
      </p>
    </div>
  );
}

export function AppShell({
  role,
  title,
  blurb,
  actions,
  children,
}: {
  role: Role;
  title: string;
  blurb?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const items = navs[role];
  const person = personas[role];
  const isAdmin = role === "admin";

  return (
    <div
      className={cn(
        "min-h-dvh bg-background",
        isAdmin
          ? "grid grid-cols-[200px_1fr] sm:grid-cols-[240px_1fr] lg:grid-cols-[264px_1fr]"
          : "lg:grid lg:grid-cols-[264px_1fr]"
      )}
    >
      <aside
        className={cn(
          "sticky top-0 flex h-dvh flex-col border-r border-border bg-surface overflow-y-auto shrink-0",
          !isAdmin && "border-b lg:border-b-0 lg:border-r"
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-5">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logo}
              alt="tossatale"
              width={36}
              height={36}
              className="size-9 rounded-xl object-cover shadow-paper shrink-0"
            />
            <div className="min-w-0">
              <Link to="/" className="block truncate font-display text-[1.125rem] leading-none text-heading">
                tossatale
              </Link>
              <span className="font-sans text-[0.6875rem] font-black tracking-[0.18em] text-primary uppercase">
                {role}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex flex-col gap-1 px-3 py-2 overflow-y-auto flex-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === `/${role}` }}
              activeProps={{ className: "bg-primary-light text-primary-hover" }}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-sans text-[0.875rem] sm:text-[0.9375rem] font-bold text-body transition-colors hover:bg-primary-light hover:text-primary-hover"
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-border px-4 py-4 sm:px-5 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar initials={person.initials} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-[0.875rem] font-bold text-heading">
                {person.name}
              </p>
              <p className="truncate text-[0.75rem] text-subtle">{person.role}</p>
            </div>
            <Link
              to="/auth"
              aria-label="Log out"
              title="Log out"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-subtle transition-colors hover:border-primary hover:bg-primary-light hover:text-primary-hover"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-10 lg:py-14">
          <header className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.1] font-display font-bold text-heading">{title}</h1>
              {blurb && <p className="mt-3 text-[0.9375rem] sm:text-[1.0625rem] text-body">{blurb}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
          </header>
          <div className={cn("mt-10 space-y-10")}>{children}</div>
        </div>
      </main>
    </div>
  );
}
