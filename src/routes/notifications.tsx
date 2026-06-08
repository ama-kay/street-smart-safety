/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

import {
  Download,
  MapPin,
  Bell,
  ShieldAlert,
  UserPlus,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
});

const notifications = [
  {
    icon: Download,
    title: "Update available",
    message: "Version 2.4.1 is ready to install. Tap to update.",
    time: "2m ago",
    tone: "info" as const,
  },
  {
    icon: MapPin,
    title: "Location services switched off",
    message: "Enable location to share your position during an emergency.",
    time: "1h ago",
    tone: "warning" as const,
  },
  {
    icon: ShieldAlert,
    title: "Emergency test successful",
    message: "Your test alert was delivered to all contacts.",
    time: "Yesterday",
    tone: "safe" as const,
  },
  {
    icon: UserPlus,
    title: "New contact added",
    message: "Sarah Chen was added to your emergency contacts.",
    time: "2 days ago",
    tone: "info" as const,
  },
  {
    icon: Bell,
    title: "Quiet hours enabled",
    message: "Non-emergency notifications are muted from 10pm–7am.",
    time: "3 days ago",
    tone: "muted" as const,
  },
  {
    icon: CheckCircle2,
    title: "Profile verified",
    message: "Your phone number has been confirmed.",
    time: "1 week ago",
    tone: "safe" as const,
  },
];

const toneStyles = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  safe: "bg-safe-soft text-safe",
  muted: "bg-secondary text-muted-foreground",
};

function Notifications() {
  const navigate = useNavigate();

  return (
    <MobileShell>
      <ScreenHeader title="Notifications" back="/settings" />
      <div className="px-5 pt-8 pb-6">
        {/* Header */}
       {/*  <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/settings" })}
            className="p-1"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>

          <h1 className="text-xl font-bold text-foreground">
            Notifications
          </h1>
        </div> */}

        {/* Notifications list */}
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border"
            >
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${toneStyles[n.tone]}`}
              >
                <n.icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {n.title}
                  </h3>

                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {n.time}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-0.5">
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

export default Notifications;