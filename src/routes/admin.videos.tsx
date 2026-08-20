import { createFileRoute } from "@tanstack/react-router";
import { Edit2, FileVideo, Folder, Link2, Play, Plus, Send, Trash2, Youtube } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/tossa/AppShell";
import { Badge, Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { videos as mockVideos } from "@/lib/data";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/videos")({
  head: () =>
    pageHead(
      "Post a YouTube video · tossatale admin",
      "Paste a YouTube link, add editorial context, and publish it to the tossatale video library.",
    ),
  component: AdminVideos,
});

function youtubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function AdminVideos() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"editor" | "library">("editor");

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [activeEditingId, setActiveEditingId] = useState<string | number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const id = useMemo(() => youtubeId(url), [url]);

  // Fetch uploaded videos from backend API
  const { data: apiVideos, isLoading } = useQuery({
    queryKey: ["admin-videos-list"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/videos/");
        return res.data?.results || res.data?.data || res.data || [];
      } catch {
        return mockVideos;
      }
    },
  });

  const videosList = (apiVideos && Array.isArray(apiVideos) && apiVideos.length > 0)
    ? apiVideos
    : mockVideos;

  const handleClearEditor = () => {
    setUrl("");
    setTitle("");
    setNotes("");
    setActiveEditingId(null);
  };

  const handlePublish = async () => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube video URL.");
      return;
    }
    if (!id) {
      toast.error("Invalid YouTube URL", {
        description: "Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)",
      });
      return;
    }
    if (!title.trim() || title.trim().length < 2) {
      toast.error("Please provide a video title (at least 2 characters).");
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        youtube_url: url.trim(),
        title: title.trim(),
        editorial_note: notes.trim(),
      };

      if (activeEditingId) {
        await api.patch(`/admin/videos/${activeEditingId}/`, payload);
        toast.success("Video Updated!", { description: `"${title}" has been updated successfully.` });
      } else {
        await api.post("/admin/videos/", payload);
        toast.success("Video Published Live!", { description: `"${title}" is now published live under /videos.` });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-videos-list"] });
      handleClearEditor();
      setActiveTab("library");
    } catch (err: any) {
      toast.error("Failed to save video", {
        description: err.response?.data?.message || err.response?.data?.error || err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditVideo = (video: any) => {
    setActiveEditingId(video.id || video.slug);
    setUrl(video.youtube_url || (video.youtube_id ? `https://www.youtube.com/watch?v=${video.youtube_id}` : ""));
    setTitle(video.title || "");
    setNotes(video.editorial_note || video.description || "");
    setActiveTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteVideo = async (video: any) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) return;
    try {
      await api.delete(`/admin/videos/${video.id || video.slug}/`);
      toast.success("Video Deleted", { description: `"${video.title}" was removed.` });
      queryClient.invalidateQueries({ queryKey: ["admin-videos-list"] });
    } catch (err: any) {
      toast.error("Failed to delete video", {
        description: err.response?.data?.message || err.message || "An error occurred while deleting.",
      });
    }
  };

  return (
    <AppShell
      role="admin"
      title="Manage YouTube Videos"
      blurb="Post, edit, and organize YouTube videos for the tossatale video library."
      actions={
        activeTab === "editor" ? (
          <div className="flex items-center gap-2">
            {activeEditingId && (
              <Button variant="ghostOutline" size="sm" onClick={handleClearEditor}>
                Cancel Edit
              </Button>
            )}
            <Button onClick={handlePublish} disabled={isPublishing}>
              <Send className="size-4" /> {isPublishing ? "Saving..." : activeEditingId ? "Update Video" : "Publish Video"}
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={() => { handleClearEditor(); setActiveTab("editor"); }} className="gap-1.5">
            <Plus className="size-4" /> Post New Video
          </Button>
        )
      }
    >
      {/* Workspace Navigation Tabs */}
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
            <FileVideo className="size-4" /> {activeEditingId ? "Editing Video" : "Post / Edit Video"}
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
            <Folder className="size-4" /> Admin Videos Desk
            <span className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[0.75rem] font-extrabold",
              activeTab === "library" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}>
              {videosList.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "editor" ? (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel className="space-y-5 p-6 lg:p-8">
            <Field label="YouTube link" hint="Standard, short, or Shorts URLs all work">
              <div className="relative">
                <Link2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="pl-11"
                />
              </div>
            </Field>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface-alt/60">
              {id ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title="Video preview"
                    allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                  />
                </div>
              ) : (
                <div className="grid aspect-video place-items-center text-subtle">
                  <span className="flex flex-col items-center gap-2 text-[0.875rem]">
                    <Youtube className="size-6 text-red-500" /> Paste a link to preview video
                  </span>
                </div>
              )}
            </div>

            <Field label="Title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meera Raghavan on writing about family"
              />
            </Field>
            <Field label="Editorial note" hint="Shown under the player on /videos">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Why this film belongs in the library…"
              />
            </Field>
          </Panel>

          <div className="space-y-6">
            <Panel className="p-6">
              <h2 className="text-xl">Status</h2>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone={id ? "success" : "warning"}>{id ? "Link verified" : "No link yet"}</Badge>
              </div>
              <p className="mt-3 text-[0.8125rem] text-subtle">
                Videos publish instantly and are indexed under the video library.
              </p>
            </Panel>
          </div>
        </div>
      ) : (
        /* Admin Videos Desk View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-heading">Uploaded Video Library</h2>
              <p className="text-[0.875rem] text-subtle">Manage, edit, or remove all published videos.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-subtle">Loading video library...</div>
          ) : videosList.length === 0 ? (
            <Panel className="p-12 text-center">
              <FileVideo className="mx-auto size-10 text-subtle" />
              <h3 className="mt-4 font-display text-lg font-bold text-heading">No videos uploaded yet</h3>
              <p className="mt-1 text-[0.875rem] text-subtle">Post your first YouTube video link to showcase it in the video library.</p>
              <Button className="mt-6" onClick={() => setActiveTab("editor")}>
                <Plus className="size-4" /> Post a Video
              </Button>
            </Panel>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videosList.map((video: any) => {
                const videoYtId = video.youtube_id || youtubeId(video.youtube_url || "") || "default";
                const thumbUrl = video.cover || video.cover_image || `https://img.youtube.com/vi/${videoYtId}/hqdefault.jpg`;

                return (
                  <Panel key={video.id || video.slug || video.title} hover className="overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={thumbUrl}
                          alt={video.title}
                          className="size-full object-cover opacity-90"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/25">
                          <span className="grid size-12 place-items-center rounded-full bg-white/90 shadow-md">
                            <Play className="size-5 text-primary fill-current translate-x-0.5" />
                          </span>
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone="success">Live</Badge>
                        </div>
                        <h3 className="mt-3 font-display text-[1.1rem] font-bold text-heading line-clamp-2 min-h-[3rem]">
                          {video.title}
                        </h3>
                        {video.editorial_note && (
                          <p className="mt-2 text-[0.875rem] text-body line-clamp-2">
                            {video.editorial_note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border bg-surface-alt/40 px-5 py-3">
                      <Button variant="ghostOutline" size="sm" onClick={() => handleEditVideo(video)} className="gap-1.5">
                        <Edit2 className="size-3.5" /> Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteVideo(video)} className="gap-1">
                        <Trash2 className="size-3.5" /> Delete
                      </Button>
                    </div>
                  </Panel>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
