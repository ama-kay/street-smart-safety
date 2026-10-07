/* eslint-disable prettier/prettier */

import { createFileRoute, Link } from "@tanstack/react-router";
import { requireCompletedSetup } from "@/lib/routeGuards";
import { useEffect, useState } from "react";
import {
  getUserProfile,
  type UserProfile,
} from "@/services/profileService";
import { getUnreadNotificationCount } from "@/services/notificationService";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import {
  Users,
  Clock,
  BookOpen,
  Settings as Cog,
  AlertTriangle,
  Bell,
  UserRound,
} from "lucide-react";

export const Route = createFileRoute("/home")({
  beforeLoad: requireCompletedSetup,
  component: Home,
});

type OperatingSystem = "ios" | "android";

function getOperatingSystem(): OperatingSystem {
  const userAgent = navigator.userAgent;

  if (/Android/i.test(userAgent)) {
    return "android";
  }

  return "ios";
}

function Home() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const operatingSystem = getOperatingSystem();

  useEffect(() => {
    async function loadProfile() {
      const data = await getUserProfile();
      setProfile(data);
    }

    loadProfile();
  }, []);

  useEffect(() => {
    async function loadUnreadNotifications() {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadNotificationCount(count);
      } catch (error) {
        console.error(
          "Failed to load unread notification count:",
          error,
        );
      }
    }

    loadUnreadNotifications();
  }, []);

  const isProfileIncomplete = profile
    ? !isProfileComplete(profile)
    : false;

  return (
    <MobileShell>
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back,
          </p>

          <h1 className="text-2xl font-bold">
            {profile?.first_name || "there"}
          </h1>
        </div>

        <Link
          to="/notifications"
          className="relative w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center"
          aria-label={
            unreadNotificationCount > 0
              ? `${unreadNotificationCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="w-5 h-5" />

          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
              {unreadNotificationCount > 99
                ? "99+"
                : unreadNotificationCount}
            </span>
          )}
        </Link>
      </header>

      <div className="flex-1 px-6 overflow-y-auto pb-6">
        <div className="flex justify-center py-8">
          <Link
            to="/trigger"
            className="relative w-56 h-56 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center pulse-ring shadow-emergency active:scale-95 transition-transform"
          >
            <AlertTriangle
              className="w-14 h-14"
              strokeWidth={2.2}
            />

            <span className="mt-3 font-bold text-sm tracking-wide">
              TRIGGER
            </span>

            <span className="font-bold text-sm tracking-wide">
              EMERGENCY
            </span>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground -mt-2 mb-6">
          {operatingSystem === "android"
            ? "Press the emergency button to send an alert."
            : "Press or triple-tap the back of your phone"}
        </p>

        {isProfileIncomplete && (
          <Link
            to="/profile/edit"
            className="mb-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 active:scale-[0.99] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <UserRound className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                Complete your emergency profile
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Add your personal and medical details so they can be
                available when you need emergency assistance.
              </p>

              <p className="text-xs font-semibold text-primary mt-2">
                Complete profile →
              </p>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <MenuCard
            to="/contacts"
            Icon={Users}
            label="Emergency Contacts"
          />

          <MenuCard
            to="/history"
            Icon={Clock}
            label="Emergency History"
          />

          {operatingSystem === "ios" && (
            <MenuCard
              to="/new-shortcut-token"
              Icon={BookOpen}
              label="Update Shortcut"
            />
          )}

          <MenuCard
            to="/settings"
            Icon={Cog}
            label="Settings"
          />
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  );
}

function isProfileComplete(
  profile: UserProfile,
): boolean {
  const requiredFields = [
    profile.first_name,
    profile.last_name,
    profile.phone,
    profile.DOB,
    profile.blood_type,
    profile.allergies,
    profile.health_conditions,
    profile.address,
  ];

  return requiredFields.every(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0,
  );
}

function MenuCard({
  to,
  Icon,
  label,
}: {
  to:
    | "/contacts"
    | "/history"
    | "/new-shortcut-token"
    | "/settings";
  Icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-card active:scale-[0.98] transition-transform"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>

      <span className="text-sm font-semibold leading-tight">
        {label}
      </span>
    </Link>
  );
}