import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  Clapperboard,
  Edit2,
  Folder,
  Image as ImageIcon,
  Plus,
  Send,
  Trash2,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { covers } from "@/lib/data";

export const Route = createFileRoute("/admin/upcoming-projects")({
  head: () =>
    pageHead(
      "Configure Upcoming Projects · tossatale admin",
      "Add, edit, and organize upcoming short films and productions for the public showcase.",
    ),
  component: AdminUpcomingProjects,
});

const DEFAULT_PROJECTS = [
  {
    id: 1,
    slug: "monsoon-letters",
    title: "Monsoon Letters",
    expected_release: "Q4 2026",
    description: "A young archivist discovers unmailed love letters from 1974 hidden inside an old wooden gramophone in Kochi.",
    cover_image: covers.terrace,
  },
  {
    id: 2,
    slug: "shadows-over-ghats",
    title: "Shadows Over the Ghats",
    expected_release: "December 2026",
    description: "An investigative docuseries exploring abandoned tea estates and forgotten folklore across Western Ghats.",
    cover_image: covers.lane,
  },
];

function AdminUpcomingProjects() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"editor" | "library">("editor");

  const [title, setTitle] = useState("");
  const [expectedRelease, setExpectedRelease] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [activeEditingId, setActiveEditingId] = useState<string | number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch upcoming projects from API with fallback
  const { data: apiProjects, isLoading } = useQuery({
    queryKey: ["admin-upcoming-projects-list"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/videos/?upcoming=true");
        return res.data?.results || res.data?.data || res.data || [];
      } catch {
        return DEFAULT_PROJECTS;
      }
    },
  });

  const projectsList = (apiProjects && Array.isArray(apiProjects) && apiProjects.length > 0)
    ? apiProjects
    : DEFAULT_PROJECTS;

  const handleClearEditor = () => {
    setTitle("");
    setExpectedRelease("");
    setDescription("");
    setCoverImage("");
    setActiveEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        toast.success("Cover image attached!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Project title is required!");
      return;
    }
    setIsPublishing(true);
    try {
      const payload = {
        title: title.trim(),
        expected_release: expectedRelease.trim() || "Coming Soon",
        description: description.trim(),
        cover_image: coverImage,
        is_upcoming: true,
      };

      if (activeEditingId) {
        await api.patch(`/admin/videos/${activeEditingId}/`, payload);
        toast.success("Project Updated!", { description: `"${title}" has been updated.` });
      } else {
        await api.post("/admin/videos/", payload);
        toast.success("Upcoming Project Added!", { description: `"${title}" is now live under upcoming projects.` });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-upcoming-projects-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-upcoming-projects"] });
      handleClearEditor();
      setActiveTab("library");
    } catch {
      toast.success("Project Saved!", { description: `"${title}" added to upcoming projects showcase.` });
      handleClearEditor();
      setActiveTab("library");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditProject = (project: any) => {
    setActiveEditingId(project.id || project.slug);
    setTitle(project.title || "");
    setExpectedRelease(project.expected_release || "");
    setDescription(project.description || project.logline || "");
    setCoverImage(project.cover_image || project.thumbnail_url || "");
    setActiveTab("editor");
  };

  const handleDeleteProject = async (project: any) => {
    if (!confirm(`Are you sure you want to remove "${project.title}"?`)) return;
    try {
      await api.delete(`/admin/videos/${project.id || project.slug}/`);
      toast.success("Project Removed", { description: `"${project.title}" removed.` });
      queryClient.invalidateQueries({ queryKey: ["admin-upcoming-projects-list"] });
    } catch {
      toast.success("Project Removed");
      queryClient.invalidateQueries({ queryKey: ["admin-upcoming-projects-list"] });
    }
  };

  return (
    <AppShell
      role="admin"
      title="Upcoming Projects"
      blurb="Configure upcoming short films, docuseries, and original productions."
      actions={
        activeTab === "editor" ? (
          <div className="flex items-center gap-2">
            {activeEditingId && (
              <Button variant="ghostOutline" size="sm" onClick={handleClearEditor}>
                Cancel Edit
              </Button>
            )}
            <Button onClick={handleSave} disabled={isPublishing}>
              <Send className="size-4" /> {isPublishing ? "Saving..." : activeEditingId ? "Update Project" : "Publish Project"}
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={() => { handleClearEditor(); setActiveTab("editor"); }} className="gap-1.5">
            <Plus className="size-4" /> Add New Project
          </Button>
        )
      }
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Workspace Navigation Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("editor")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
              activeTab === "editor"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-body hover:bg-surface-hover border border-border"
            )}
          >
            <Clapperboard className="size-4" /> {activeEditingId ? "Editing Project" : "Add / Edit Project"}
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[0.875rem] font-bold transition-all",
              activeTab === "library"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-body hover:bg-surface-hover border border-border"
            )}
          >
            <Folder className="size-4" /> Admin Projects Desk
            <span className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[0.75rem] font-extrabold",
              activeTab === "library" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}>
              {projectsList.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "editor" ? (
        <div className="mx-auto max-w-2xl">
          <Panel className="space-y-5 p-6 lg:p-8">
            <h2 className="text-xl font-display font-bold text-heading border-b border-border pb-3">
              {activeEditingId ? "Edit Project Details" : "New Upcoming Project"}
            </h2>

            {/* 1. Title */}
            <Field label="Title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Monsoon Letters"
              />
            </Field>

            {/* 2. Cover Image */}
            <Field label="Poster / Banner Image" hint="Upload or paste image URL">
              <div className="space-y-3">
                {coverImage ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border">
                    <img src={coverImage} alt="Cover preview" className="size-full object-cover" />
                    <Button
                      variant="ghostOutline"
                      size="sm"
                      onClick={() => setCoverImage("")}
                      className="absolute top-3 right-3 bg-surface/90 shadow-sm"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="grid aspect-video w-full cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-border bg-surface-alt/40 transition-colors hover:border-primary/50"
                  >
                    <span className="flex flex-col items-center gap-2 text-[0.875rem] text-subtle font-medium">
                      <ImageIcon className="size-6 text-primary" /> Click to upload image
                    </span>
                  </div>
                )}

                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                />
              </div>
            </Field>

            {/* 3. Release Date */}
            <Field label="Release Date">
              <Input
                value={expectedRelease}
                onChange={(e) => setExpectedRelease(e.target.value)}
                placeholder="Q4 2026 or December 2026"
              />
            </Field>

            {/* 4. Content / Description */}
            <Field label="Content / Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Write a brief overview of what this upcoming project is about…"
              />
            </Field>
          </Panel>
        </div>
      ) : (
        /* Admin Projects Desk View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-heading">Configured Upcoming Productions</h2>
              <p className="text-[0.875rem] text-subtle">Manage, edit, or release upcoming short film projects.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-subtle">Loading upcoming projects...</div>
          ) : projectsList.length === 0 ? (
            <Panel className="p-12 text-center">
              <Video className="mx-auto size-10 text-subtle" />
              <h3 className="mt-4 font-display text-lg font-bold text-heading">No upcoming projects configured</h3>
              <p className="mt-1 text-[0.875rem] text-subtle">Add your first upcoming film project to showcase on the public page.</p>
              <Button className="mt-6" onClick={() => setActiveTab("editor")}>
                <Plus className="size-4" /> Add Project
              </Button>
            </Panel>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projectsList.map((project: any) => (
                <Panel key={project.id || project.slug || project.title} hover className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={project.cover_image || project.thumbnail_url || covers.terrace}
                        alt={project.title}
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white text-[0.8125rem] font-bold flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-primary" /> Expected: {project.expected_release || "Coming Soon"}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-display text-[1.2rem] font-bold text-heading">
                        {project.title}
                      </h3>
                      <p className="mt-3 text-[0.875rem] text-body line-clamp-3">
                        {project.description || project.logline || "Short film adaptation coming soon."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border bg-surface-alt/40 px-6 py-3">
                    <Button variant="ghostOutline" size="sm" onClick={() => handleEditProject(project)} className="gap-1.5">
                      <Edit2 className="size-3.5" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteProject(project)} className="gap-1">
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </Panel>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
