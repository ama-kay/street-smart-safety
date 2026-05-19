import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { Users, Clock, BookOpen, Settings as Cog, AlertTriangle, Bell } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: Home,
});

// Main authenticated home / dashboard
function Home() {
  return (
    <MobileShell>
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold">John</h1>
        </div>
        <button className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-6 overflow-y-auto pb-6">
        {/* Trigger button — main action */}
        <div className="flex justify-center py-8">
          <Link
            to="/trigger"
            className="relative w-56 h-56 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center pulse-ring shadow-emergency active:scale-95 transition-transform"
          >
            <AlertTriangle className="w-14 h-14" strokeWidth={2.2} />
            <span className="mt-3 font-bold text-sm tracking-wide">TRIGGER</span>
            <span className="font-bold text-sm tracking-wide">EMERGENCY</span>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground -mt-2 mb-6">
          Press and hold or triple-tap your phone
        </p>

        <div className="grid grid-cols-2 gap-3">
          <MenuCard to="/contacts" Icon={Users} label="Emergency Contacts" />
          <MenuCard to="/history" Icon={Clock} label="Emergency History" />
          <MenuCard to="/shortcut-setup" Icon={BookOpen} label="Setup Guide" />
          <MenuCard to="/settings" Icon={Cog} label="Settings" />
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  );
}

function MenuCard({
  to,
  Icon,
  label,
}: {
  to: "/contacts" | "/history" | "/shortcut-setup" | "/settings";
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
      <span className="text-sm font-semibold leading-tight">{label}</span>
    </Link>
  );
}
