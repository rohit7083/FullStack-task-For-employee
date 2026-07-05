import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

interface NotificationItem {
  id: number | string;
  message: string;
  type: "TASK_ASSIGNED" | "TASK_DUE_SOON" | "TASK_COMPLETED";
  isRead: boolean;
  createdAt: string;
}

const typeIcon: Record<NotificationItem["type"], string> = {
  TASK_ASSIGNED: "📋",
  TASK_DUE_SOON: "⏰",
  TASK_COMPLETED: "✅",
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data.notifications);
    } catch {
      // fail silently — notifications are a convenience, not core flow
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: number | string) => {
    if (typeof id === "string" && id.startsWith("virtual-")) return;
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-full border border-border bg-panel flex items-center justify-center hover:border-brand transition-colors"
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-priority-high text-white text-[10px] leading-4 text-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-panel shadow-lg z-30">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>

          {loading && notifications.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted text-center">Loading…</p>
          )}

          {!loading && notifications.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted text-center">You're all caught up.</p>
          )}

          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`px-4 py-3 text-sm border-b border-border last:border-0 cursor-pointer hover:bg-paper transition-colors ${
                  n.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex gap-2">
                  <span aria-hidden>{typeIcon[n.type]}</span>
                  <div>
                    <p className="text-ink">{n.message}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
