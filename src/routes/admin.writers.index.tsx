import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Mail, Search, User, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Avatar, Badge, Button, ButtonLink, Input, Panel, VerifiedBadge } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/writers/")({
  head: () =>
    pageHead(
      "Writer management · tossatale admin",
      "Review writer profiles, verification status, personal info and publishing activity.",
    ),
  component: AdminWriters,
});

function AdminWriters() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [isAddWriterOpen, setIsAddWriterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add Writer
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "OTHER",
    bio: "",
    profilePhoto: "",
    websiteUrl: "",
    instagramUrl: "",
    xUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    isVerified: true,
    isActive: true,
  });

  const { data: apiWriters, isLoading } = useQuery({
    queryKey: ["admin-writers", query],
    queryFn: async () => {
      const res = await api.get(`/admin/writers/${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      return res.data?.results || res.data || [];
    },
  });

  const rows = (apiWriters && Array.isArray(apiWriters))
    ? apiWriters.map((w: any) => ({
        slug: w.slug,
        name: w.name || w.user?.full_name || "Writer",
        initials: (w.name || w.user?.full_name || "W").substring(0, 2).toUpperCase(),
        handle: `@${w.slug}`,
        gender: w.gender || "OTHER",
        profilePhoto: w.profile_photo || "",
        verified: w.is_verified || false,
        role: w.role === "ADMIN" ? "Admin / Storyteller" : "Storyteller",
        userRole: w.role || "WRITER",
        location: "India",
        stories: typeof w.total_stories === "number" ? w.total_stories : 0,
        supporters: typeof w.total_supports === "number" ? `${w.total_supports}` : w.total_likes ? `${w.total_likes}` : "0",
        reads: w.total_reads ? `${w.total_reads}` : "0",
      }))
    : [];

  const handleEmailClick = (e: React.MouseEvent, writerName: string) => {
    e.stopPropagation();
    toast.info(`Opening email composer for ${writerName}...`);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddWriterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error("Please provide an email address.");
      return;
    }
    if (!formData.firstName.trim()) {
      toast.error("Please provide the writer's first name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/admin/writers/invite/", {
        email: formData.email.trim(),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        password: formData.password.trim() || undefined,
        gender: formData.gender,
        bio: formData.bio.trim(),
        profile_photo: formData.profilePhoto.trim(),
        website_url: formData.websiteUrl.trim(),
        instagram_url: formData.instagramUrl.trim(),
        x_url: formData.xUrl.trim(),
        linkedin_url: formData.linkedinUrl.trim(),
        youtube_url: formData.youtubeUrl.trim(),
        is_verified: formData.isVerified,
        is_active: formData.isActive,
      });

      toast.success(res.data?.message || `Writer "${formData.firstName}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["admin-writers"] });
      setIsAddWriterOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        gender: "OTHER",
        bio: "",
        profilePhoto: "",
        websiteUrl: "",
        instagramUrl: "",
        xUrl: "",
        linkedinUrl: "",
        youtubeUrl: "",
        isVerified: true,
        isActive: true,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create writer. Please check details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Writers"
      blurb="Who is publishing, how often, and who is waiting on verification."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => setIsAddWriterOpen(true)} className="gap-2 shadow-sm">
            <UserPlus className="size-4" /> Add Writer
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total writers" value={String(rows.length)} hint="registered" />
        <StatCard label="Verified" value={String(rows.filter((r: any) => r.verified).length)} />
        <StatCard label="Pending verification" value={String(rows.filter((r: any) => !r.verified).length)} hint="needs review" />
        <StatCard label="Published this week" value="0" />
      </div>

      <Panel className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-display font-bold text-heading">Directory</h2>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search writers by name..."
              className="pl-11"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-subtle font-medium">Loading writers directory...</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="font-display text-lg font-bold text-heading">No writers found</h3>
            <p className="mt-1 text-[0.875rem] text-subtle">
              {query ? `No writers match "${query}".` : "There are currently no registered writers in the system."}
            </p>
            <Button
              variant="primary"
              onClick={() => setIsAddWriterOpen(true)}
              className="mt-4 gap-2 inline-flex"
            >
              <UserPlus className="size-4" /> Add your first writer
            </Button>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {rows.map((w: any) => (
              <li
                key={w.slug}
                className="group flex flex-col gap-4 py-5 sm:flex-row sm:items-center transition-colors hover:bg-surface-alt/30 px-3 rounded-2xl"
              >
                <Link to="/admin/writers/$slug" params={{ slug: w.slug }} className="shrink-0">
                  <Avatar initials={w.initials} gender={w.gender} src={w.profilePhoto} />
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-sans text-[0.9375rem] font-bold text-heading">
                    <Link
                      to="/admin/writers/$slug"
                      params={{ slug: w.slug }}
                      className="hover:text-primary transition-colors"
                    >
                      {w.name}
                    </Link>
                    {w.verified && <VerifiedBadge />}
                    {w.userRole === "ADMIN" && (
                      <span className="text-[0.6875rem] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-[0.8125rem] text-subtle">
                    {w.handle} · {w.role} · {w.location}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-[0.8125rem] text-subtle">
                  <span>
                    <strong className="font-sans text-heading">{w.stories}</strong> stories
                  </span>
                  <span>
                    <strong className="font-sans text-heading">{w.supporters}</strong> supporters
                  </span>
                  <span className="hidden sm:inline">
                    <strong className="font-sans text-heading">{w.reads}</strong> reads
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={w.verified ? "success" : "warning"}>
                    {w.verified ? "Verified" : "Pending"}
                  </Badge>

                  <ButtonLink
                    to="/admin/writers/$slug"
                    params={{ slug: w.slug }}
                    size="sm"
                    variant="ghostOutline"
                    className="hidden md:inline-flex"
                  >
                    <User className="size-3.5 mr-1" /> View details
                  </ButtonLink>

                  <Button
                    size="icon"
                    variant="ghostOutline"
                    aria-label={`Email ${w.name}`}
                    onClick={(e) => handleEmailClick(e, w.name)}
                  >
                    <Mail className="size-4" />
                  </Button>

                  <Link
                    to="/admin/writers/$slug"
                    params={{ slug: w.slug }}
                    className="grid size-9 place-items-center rounded-xl border border-border text-subtle transition-colors hover:border-primary hover:text-primary md:hidden"
                    aria-label={`View detail screen for ${w.name}`}
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Add Writer Modal */}
      {isAddWriterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border pb-4 sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-primary-light text-primary">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-heading">Add New Writer</h3>
                  <p className="text-[0.8125rem] text-subtle">Create a writer profile and configure publishing credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWriterOpen(false)}
                className="grid size-9 place-items-center rounded-full text-subtle hover:bg-surface-hover hover:text-heading transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddWriterSubmit} className="mt-6 space-y-6">
              {/* Account Credentials */}
              <div className="space-y-4">
                <h4 className="text-[0.875rem] font-bold text-primary uppercase tracking-wider">
                  1. Account Information
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Amrita"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      Last Name
                    </label>
                    <Input
                      placeholder="e.g. Sen"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="writer@tossatale.com"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      Initial Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Set login password (optional)"
                      value={formData.password}
                      onChange={(e) => handleFormChange("password", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.8125rem] font-bold text-heading mb-2">
                    Gender Selection <span className="text-subtle font-normal">(Determines storyteller avatar)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "MALE", label: "Male", icon: "👨" },
                      { id: "FEMALE", label: "Female", icon: "👩" },
                      { id: "OTHER", label: "Other", icon: "🧑" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleFormChange("gender", g.id)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-2xl border p-3 text-[0.875rem] font-bold transition-all",
                          formData.gender === g.id
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                            : "border-border bg-surface text-body hover:bg-surface-hover hover:text-heading"
                        )}
                      >
                        <span className="text-base">{g.icon}</span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-4 border-t border-border pt-5">
                <h4 className="text-[0.875rem] font-bold text-primary uppercase tracking-wider">
                  2. Public Profile
                </h4>
                <div>
                  <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                    Storyteller Bio / About
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Short biographical intro and storytelling focus..."
                    value={formData.bio}
                    onChange={(e) => handleFormChange("bio", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-[0.875rem] text-heading placeholder:text-subtle focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                    Profile Photo URL
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    value={formData.profilePhoto}
                    onChange={(e) => handleFormChange("profilePhoto", e.target.value)}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4 border-t border-border pt-5">
                <h4 className="text-[0.875rem] font-bold text-primary uppercase tracking-wider">
                  3. Social Links & Website
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      Personal Website
                    </label>
                    <Input
                      placeholder="https://writerwebsite.com"
                      value={formData.websiteUrl}
                      onChange={(e) => handleFormChange("websiteUrl", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      Instagram URL
                    </label>
                    <Input
                      placeholder="https://instagram.com/writerhandle"
                      value={formData.instagramUrl}
                      onChange={(e) => handleFormChange("instagramUrl", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      X (Twitter) URL
                    </label>
                    <Input
                      placeholder="https://x.com/writerhandle"
                      value={formData.xUrl}
                      onChange={(e) => handleFormChange("xUrl", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-bold text-heading mb-1.5">
                      LinkedIn URL
                    </label>
                    <Input
                      placeholder="https://linkedin.com/in/writerhandle"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleFormChange("linkedinUrl", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Verification & Status */}
              <div className="space-y-3 border-t border-border pt-5">
                <h4 className="text-[0.875rem] font-bold text-primary uppercase tracking-wider">
                  4. Verification & Status
                </h4>
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-2.5 text-[0.875rem] font-medium text-heading cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => handleFormChange("isVerified", e.target.checked)}
                      className="size-4 rounded-md border-border text-primary focus:ring-primary"
                    />
                    Verify writer profile immediately with blue check badge
                  </label>

                  <label className="flex items-center gap-2.5 text-[0.875rem] font-medium text-heading cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleFormChange("isActive", e.target.checked)}
                      className="size-4 rounded-md border-border text-primary focus:ring-primary"
                    />
                    Active account (allowed to write and publish stories)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="ghostOutline"
                  onClick={() => setIsAddWriterOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? "Creating Writer..." : "Create & Add Writer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
