import { createFileRoute } from "@tanstack/react-router";
import { Users, Radio, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "2,847",
    icon: Users,
    change: "+12%",
    color: "text-info",
    bg: "bg-info-soft",
  },
  {
    label: "Active Emergencies",
    value: "3",
    icon: Radio,
    change: "",
    color: "text-emergency",
    bg: "bg-emergency-soft",
  },
  {
    label: "Alerts Today",
    value: "18",
    icon: AlertTriangle,
    change: "+5",
    color: "text-warning",
    bg: "bg-warning-soft",
  },
  {
    label: "Cancelled Alerts",
    value: "7",
    icon: XCircle,
    change: "",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
];

const recentAlerts = [
  { user: "John Doe", time: "2 min ago", status: "Pending", location: "Downtown" },
  { user: "Jane Smith", time: "15 min ago", status: "Sent", location: "West Side" },
  { user: "Bob Wilson", time: "1 hr ago", status: "Resolved", location: "Central" },
  { user: "Alice Brown", time: "2 hrs ago", status: "Cancelled", location: "East End" },
  { user: "Tom Davis", time: "3 hrs ago", status: "Sent", location: "North District" },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  Sent: "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

export default function AdminDashboard() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Emergency system overview</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                {/*   <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div> */}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              {/* {stat.change && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-safe" />
                  <span className="text-xs text-safe font-medium">{stat.change}</span>
                </div>
              )} */}
            </div>
          ))}
        </div>

        {/* Recent Alerts Table */}
        <div className="bg-card rounded-lg border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Recent Alerts</h2>
          </div>
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
              {recentAlerts.map((alert, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 border-border hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{alert.user}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{alert.time}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{alert.location}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[alert.status]}`}
                    >
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
