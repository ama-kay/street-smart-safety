import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { User, Users, Bell, Lock, HelpCircle, ChevronRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  return (
    <MobileShell>
      <ScreenHeader title="Settings" />

      <div className="flex-1 px-6 pt-6 pb-4 overflow-y-auto">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            JD
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">John Doe</h3>
            <p className="text-xs text-muted-foreground">john.doe@example.com</p>
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
        <button className="mt-6 w-full text-primary font-semibold py-4 flex items-center justify-center gap-2">
          <a href="/login" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Log Out
          </a>
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
