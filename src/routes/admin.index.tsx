/* eslint-disable prettier/prettier */

import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Radio,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getAdminDashboardData,
  type AdminDashboardStats,
  type RecentAlert,
} from "@/services/adminService";
// import { supabase } from "@/lib/supabase";

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  Active: "bg-emergency-soft text-emergency",
  Sent: "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

// const { data, error } = await supabase.rpc("is_admin");

// console.log("is admin:", data);
// console.log("error:", error);

export default function AdminDashboard() {
  const [stats, setStats] =
    useState<AdminDashboardStats>({
      totalUsers: 0,
      activeEmergencies: 0,
      alertsToday: 0,
      cancelledAlerts: 0,
    });

  const [recentAlerts, setRecentAlerts] =
    useState<RecentAlert[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await getAdminDashboardData();

        if (!isMounted) {
          return;
        }

        setStats(data.stats);
        setRecentAlerts(data.recentAlerts);
        setError(null);
      } catch (err) {
        console.error(
          "Failed to load admin dashboard:",
          err,
        );

        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    /*
     * Load immediately.
     */

    loadDashboard();

    /*
     * Refresh every 5 seconds.
     */

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    /*
     * Cleanup when leaving the dashboard.
     */

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-info",
      bg: "bg-info-soft",
    },
    {
      label: "Active Emergencies",
      value: stats.activeEmergencies,
      icon: Radio,
      color: "text-emergency",
      bg: "bg-emergency-soft",
    },
    {
      label: "Alerts Today",
      value: stats.alertsToday,
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning-soft",
    },
    {
      label: "Cancelled Alerts",
      value: stats.cancelledAlerts,
      icon: XCircle,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Dashboard
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          Emergency system overview
        </p>

        {error && (
          <div className="bg-emergency-soft text-emergency border border-border rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}

        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-lg border border-border p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>

                <div
                  className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon
                    className={`h-4 w-4 ${stat.color}`}
                  />
                </div>
              </div>

              <p className="text-2xl font-bold text-foreground">
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Alerts */}

        <div className="bg-card rounded-lg border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              Recent Alerts
            </h2>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Loading alerts...
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No emergency alerts yet.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    User
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Time
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Location
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b last:border-0 border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {alert.user}
                    </td>

                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {alert.time}
                    </td>

                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {alert.location}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          statusStyles[alert.status] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}