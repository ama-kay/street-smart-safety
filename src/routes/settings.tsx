import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { User, Users, Bell, Lock, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase, type Profile } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  component: () => (
    <RequireAuth>
      <Settings />
    </RequireAuth>
  ),
});

function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Partial<Profile> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name,last_name,email,profile_photo_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    user?.email ||
    "Your Profile";
  const email = profile?.email || user?.email || "";
  const initials =
    `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase() ||
    (user?.email?.[0]?.toUpperCase() ?? "U");

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <MobileShell>
      <ScreenHeader title="Settings" />

      <div className="flex-1 px-6 pt-6 pb-4 overflow-y-auto">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden">
            {profile?.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{name}</h3>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-6 bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <Row icon={User} label="Edit Profile" to="/profile/edit" />
          <Row icon={Users} label="Manage Contacts" to="/contacts" />

          <Row icon={Bell} label="Notifications" to="/notifications" />
          <Row icon={Lock} label="Privacy" to="/privacy" />
          <Row icon={HelpCircle} label="Help & Support" to="/help" />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full text-primary font-semibold py-4 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      <BottomNav />
    </MobileShell>
  );
}

function Row({
  icon: Icon,
  label,
  to,
  last,
}: {
  icon: typeof User;
  label: string;
  to?: string;
  last?: boolean;
}) {
  const inner = (
    <div className={`flex items-center gap-4 px-4 py-4 ${!last ? "border-b border-border" : ""}`}>
      <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>

      <span className="flex-1 text-sm font-medium">{label}</span>

      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );

  return to ? (
    <Link to={to} className="block">
      {inner}
    </Link>
  ) : (
    <button className="w-full text-left">{inner}</button>
  );
}
