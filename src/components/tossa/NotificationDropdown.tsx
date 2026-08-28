import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await api.get("/notifications/unread-count/");
      return res.data?.unread_count || 0;
    },
    refetchInterval: 30000, // 30s polling
  });

  const unreadCount: number = unreadData || 0;

  // Fetch notifications list when opened
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const res = await api.get("/notifications/");
      return res.data?.results || res.data || [];
    },
    enabled: open,
  });

  const notifications: NotificationItem[] = Array.isArray(notificationsData)
    ? notificationsData
    : [];

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.post(`/notifications/${id}/mark-read/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await api.post("/notifications/mark-all-read/");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className={cn(
          "relative grid size-8 place-items-center rounded-full border border-border bg-surface text-subtle transition-all hover:border-primary hover:text-primary shrink-0 shadow-xs",
          open && "border-primary text-primary"
        )}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-white shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-surface shadow-lift animate-in fade-in slide-in-from-top-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[0.9375rem] font-bold text-heading">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-[0.6875rem] font-extrabold text-primary-hover">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-1 text-[0.75rem] font-bold text-primary hover:underline"
              >
                <Check className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {isLoading ? (
              <div className="py-8 text-center text-[0.875rem] text-subtle font-medium">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <CheckCircle2 className="size-8 text-subtle/60 mb-2" />
                <p className="font-sans text-[0.875rem] font-bold text-heading">All caught up!</p>
                <p className="text-[0.75rem] text-subtle mt-0.5">
                  You don't have any notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                let timeAgo = "";
                try {
                  timeAgo = formatDistanceToNow(new Date(notif.created_at), { addSuffix: true });
                } catch {
                  timeAgo = "recently";
                }

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 p-3.5 transition-colors hover:bg-muted/30",
                      !notif.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="mt-0.5 grid size-7 place-items-center rounded-full bg-primary-light text-primary-hover shrink-0">
                      <Sparkles className="size-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-sans text-[0.8125rem] font-bold text-heading truncate">
                          {notif.title}
                        </p>
                        <span className="text-[0.6875rem] text-subtle shrink-0">{timeAgo}</span>
                      </div>
                      <p className="mt-0.5 text-[0.75rem] text-body line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        {notif.action_url && (
                          <Link
                            to={notif.action_url}
                            onClick={() => {
                              if (!notif.is_read) markReadMutation.mutate(notif.id);
                              setOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[0.75rem] font-bold text-primary hover:underline"
                          >
                            View details <ExternalLink className="size-3" />
                          </Link>
                        )}
                        {!notif.is_read && (
                          <button
                            type="button"
                            onClick={() => markReadMutation.mutate(notif.id)}
                            className="text-[0.6875rem] text-subtle hover:text-heading"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
