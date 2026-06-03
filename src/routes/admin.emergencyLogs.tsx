import { createFileRoute } from "@tanstack/react-router";
import { Search, MapPin, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/emergencyLogs")({
  component: AdminEmergencyLogs,
});

const logs = [
  {
    id: "ALT-001",
    user: "John Doe",
    timestamp: "Mar 14, 3:42 PM",
    location: "5th Ave",
    status: "Sent",
    contacts: 3,
  },
  {
    id: "ALT-002",
    user: "Maria Garcia",
    timestamp: "Mar 14, 3:38 PM",
    location: "Oak St Mall",
    status: "Sent",
    contacts: 2,
  },
  {
    id: "ALT-003",
    user: "James Lee",
    timestamp: "Mar 14, 3:30 PM",
    location: "Central Park",
    status: "Cancelled",
    contacts: 0,
  },
  {
    id: "ALT-004",
    user: "Sara Khan",
    timestamp: "Mar 14, 2:55 PM",
    location: "Highway 101",
    status: "Resolved",
    contacts: 4,
  },
  {
    id: "ALT-005",
    user: "Alice Brown",
    timestamp: "Mar 13, 11:20 AM",
    location: "East End",
    status: "Sent",
    contacts: 2,
  },
  {
    id: "ALT-006",
    user: "Tom Davis",
    timestamp: "Mar 13, 9:05 AM",
    location: "North District",
    status: "Cancelled",
    contacts: 0,
  },
];

const statusStyles: Record<string, string> = {
  Sent: "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

export default function AdminEmergencyLogs() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Emergency Logs</h1>
        <p className="text-sm text-muted-foreground mb-6">Full alert history</p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 w-72">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Alert ID
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Timestamp
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Contacts Notified
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b last:border-0 border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 text-sm text-info font-mono">{log.id}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{log.user}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{log.timestamp}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {log.location}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[log.status]}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{log.contacts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
