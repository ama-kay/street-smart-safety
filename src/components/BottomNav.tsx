import { Link, useLocation } from "@tanstack/react-router";
import { Home, Users, Settings, User, AlertTriangle } from "lucide-react";

// Persistent bottom tab bar used across the authenticated app screens.
export function BottomNav() {
  const { pathname } = useLocation();
  const items: Array<{ to: string; icon: typeof Home; label: string; center?: boolean }> = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/contacts", icon: Users, label: "Contacts" },
    { to: "/trigger", icon: AlertTriangle, label: "SOS", center: true },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/profile/edit", icon: User, label: "Profile" },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 flex items-end justify-between">
      {items.map(({ to, icon: Icon, label, center }) => {
        const active = pathname === to;
        if (center) {
          return (
            <Link key={to} to={to} className="flex flex-col items-center -mt-6">
              <span className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-emergency">
                <Icon className="w-7 h-7" />
              </span>
              <span className="text-[10px] mt-1 text-muted-foreground">{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
