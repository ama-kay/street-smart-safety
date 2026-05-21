import { createFileRoute } from '@tanstack/react-router'
import { Eye, MapPin } from "lucide-react";

export const Route = createFileRoute('/admin/liveMonitoring')({
  component: LiveMonitoring,
})

const emergencies = [
  { user: "John Doe", phone: "+1 555-0101", time: "Mar 14, 3:42 PM", location: "5th Ave, Downtown", status: "Pending" },
  { user: "Maria Garcia", phone: "+1 555-0202", time: "Mar 14, 3:38 PM", location: "Oak Street Mall", status: "Alert Sent" },
  { user: "James Lee", phone: "+1 555-0303", time: "Mar 14, 3:30 PM", location: "Central Park W", status: "Pending" },
  { user: "Sara Khan", phone: "+1 555-0404", time: "Mar 14, 2:55 PM", location: "Highway 101", status: "Resolved" },
  { user: "Carlos Diaz", phone: "+1 555-0505", time: "Mar 14, 2:10 PM", location: "River Walk", status: "Cancelled" },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  "Alert Sent": "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

export default function LiveMonitoring() {
  return (
    <div>
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Live Emergencies</h1>
          <p className="text-sm text-muted-foreground">Real-time emergency monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-safe animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">User</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Phone</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Time</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Location</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {emergencies.map((e, i) => (
              <tr key={i} className="border-b last:border-0 border-border hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{e.user}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{e.phone}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{e.time}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {e.location}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[e.status]}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="flex items-center gap-1 text-xs font-medium text-info hover:underline">
                    <Eye className="h-3 w-3" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>

);}

