/* eslint-disable prettier/prettier */
import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { ShieldLogo } from "@/components/ShieldLogo";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Radio,
  Users,
  FileText,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Radio, label: "Live Emergencies", path: "/admin/liveMonitoring" },
  { icon: Users, label: "Users", path: "/admin/userManagement" },
  { icon: FileText, label: "Emergency Logs", path: "/admin/emergencyLogs" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Failed to log out:", error);
    return;
  }

  navigate({
    to: "/admin/login",
    replace: true,
  });
}

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* <div className="bg-red-500 text-white p-10">Test Tailwind</div> */}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-card border-r border-border z-40
          flex flex-col transition-all duration-300

          w-20
          lg:w-60

          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div
          className="
            h-[81px] border-b border-border
            flex items-center
            justify-between
            px-4
            lg:justify-start lg:px-6
          "
        >
          <div className="flex items-center gap-3">
            <ShieldLogo size={40} />

            <span
              className="
                hidden lg:block
                font-bold text-foreground
              "
            >
              Street Smart
            </span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="
              md:hidden
              p-2
              rounded-lg
              hover:bg-secondary
              transition-colors
            "
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {sidebarItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                title={item.label}
                onClick={() => {
                  navigate({ to: item.path });
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center
                  rounded-lg transition-colors

                  ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }

                  px-3 py-3
                  gap-3
                  justify-center
                  lg:justify-start
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />

                <span
                  className="
                    hidden lg:block
                    text-sm font-medium
                  "
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-border">
          <button
            title="Log Out"
            onClick={handleLogout}
            className="
              w-full flex items-center
              justify-center lg:justify-start
              gap-3 px-3 py-3 rounded-lg

              text-sm font-medium
              text-muted-foreground
              hover:text-emergency
              hover:bg-secondary/50
            "
          >
            <LogOut className="h-5 w-5" />

            <span className="hidden lg:block">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-20 lg:ml-60">
        {/* Top bar */}
        <header
          className="
            sticky top-0 z-20
            bg-card/80 backdrop-blur
            border-b border-border
            px-4 lg:px-8 py-3
            flex items-center justify-between
          "
        >
          {/* Hamburger mobile only */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div
            className="
              hidden sm:flex
              items-center gap-2
              bg-secondary rounded-lg
              px-3 py-2
              w-72
            "
          >
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              placeholder="Search..."
              className="
                bg-transparent
                outline-none
                text-sm
                w-full
              "
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              className="
                relative p-2 rounded-lg
                hover:bg-secondary
              "
            >
              <Bell className="h-5 w-5 text-muted-foreground" />

              <span
                className="
                  absolute top-1 right-1
                  w-2 h-2 rounded-full
                  bg-emergency
                "
              />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="
                  w-8 h-8 rounded-full
                  bg-secondary
                  flex items-center justify-center
                "
              >
                <span className="text-xs font-semibold">AD</span>
              </div>

              <span
                className="
                  hidden sm:block
                  text-sm font-medium
                "
              >
                Admin
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
