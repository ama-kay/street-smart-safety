/* eslint-disable prettier/prettier */

import { createFileRoute } from "@tanstack/react-router";
import { requireCompletedSetup } from "@/lib/routeGuards";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useEffect, useState } from "react";
import {
  Download,
  MapPin,
  Bell,
  ShieldAlert,
  UserPlus,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/services/notificationService";

export const Route = createFileRoute("/notifications")({
  beforeLoad: requireCompletedSetup,
  component: Notifications,
});

const iconMap = {
  info: Download,
  warning: MapPin,
  safe: CheckCircle2,
  emergency: ShieldAlert,
  contact: UserPlus,
  system: Bell,
};

const toneStyles = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  safe: "bg-safe-soft text-safe",
  emergency: "bg-primary/10 text-primary",
  contact: "bg-info-soft text-info",
  system: "bg-secondary text-muted-foreground",
};

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();

        setNotifications(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
  (notification) => !notification.read,
).length;

const handleMarkAsRead = async (notificationId: string) => {
  try {
    await markNotificationAsRead(notificationId);

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
};

const handleMarkAllAsRead = async () => {
  if (unreadCount === 0) {
    return;
  }

  try {
    await markAllNotificationsAsRead();

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
};

  return (
    <MobileShell>
      <ScreenHeader title="Notifications" back="/settings" />

      {!loading && !error && unreadCount > 0 && (
        <div className="flex justify-end px-5 pt-3">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-primary"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="flex-1 px-5 pt-8 pb-6 overflow-y-auto">
        {/* LOADING */}

        {loading && (
          <div className="flex justify-center py-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading notifications...
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="flex flex-col items-center text-center py-10">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />

            <p className="text-sm font-semibold">
              Unable to load notifications
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mb-3" />

            <p className="text-sm font-semibold">
              No notifications yet
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Important updates and emergency activity will appear here.
            </p>
          </div>
        )}

        {/* NOTIFICATIONS */}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const iconType =
                notification.type as keyof typeof iconMap;

              const Icon = iconMap[iconType] ?? Bell;

              const tone =
                toneStyles[iconType] ??
                toneStyles.system;

              const date = new Date(notification.created_at);

              return (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() =>
                    !notification.read && handleMarkAsRead(notification.id)
                  }
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl bg-card border border-border transition-colors ${
                    !notification.read
                      ? "border-primary/20 active:bg-secondary/50"
                      : "active:bg-secondary/30"
                  }`}
                >
                  {/* ICON */}

                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${tone}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm text-foreground ${
                          notification.read
                            ? "font-medium"
                            : "font-semibold"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-0.5 break-words">
                      {notification.message}
                    </p>

                    <p className="text-[11px] text-muted-foreground mt-2">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}{" "}
                      ·{" "}
                      {date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

export default Notifications;