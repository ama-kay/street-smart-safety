import { Link, useLocation } from "@tanstack/react-router";
import { Home, Users, Settings, User, AlertTriangle } from "lucide-react";

// Persistent bottom tab bar used across the authenticated app screens.
export function BottomNav() {
  const { pathname } = useLocation();

  const Tab = ({
    to,
    Icon,
    label,
  }: {
    to: "/home" | "/contacts" | "/settings" | "/profile/edit";
    Icon: typeof Home;
    label: string;
  }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 flex items-end justify-between">
      <Tab to="/home" Icon={Home} label="Home" />
      <Tab to="/contacts" Icon={Users} label="Contacts" />
      <Link to="/trigger" className="flex flex-col items-center -mt-6">
        <span className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-emergency">
          <AlertTriangle className="w-7 h-7" />
        </span>
        <span className="text-[10px] mt-1 text-muted-foreground">SOS</span>
      </Link>
      <Tab to="/settings" Icon={Settings} label="Settings" />
      <Tab to="/profile/edit" Icon={User} label="Profile" />
    </nav>
  );
}
