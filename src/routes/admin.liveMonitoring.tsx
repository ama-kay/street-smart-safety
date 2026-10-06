import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { getLiveEmergencies, type LiveEmergency } from "@/services/adminService";

export const Route = createFileRoute("/admin/liveMonitoring")({
  component: LiveMonitoring,
});

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  Active: "bg-emergency-soft text-emergency",
  Sent: "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

export default function LiveMonitoring() {
  const [emergencies, setEmergencies] = useState<LiveEmergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEmergencies() {
      try {
        setLoading(true);
        setError(null);

        const data = await getLiveEmergencies();

        setEmergencies(data);
      } catch (err) {
        console.error("Failed to load live emergencies:", err);

        setError(err instanceof Error ? err.message : "Failed to load live emergencies.");
      } finally {
        setLoading(false);
      }
    }

    loadEmergencies();
  }, []);

  return (
    <div>
      <div>
        {/* Header */}
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

        {/* Error */}
        {error && (
          <div className="bg-emergency-soft text-emergency border border-border rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Loading emergencies...
            </div>
          ) : emergencies.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No live emergencies</p>

              <p className="text-sm text-muted-foreground mt-1">
                There are currently no pending or active emergency alerts.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    User
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Phone
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

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {emergencies.map((emergency) => (
                  <tr
                    key={emergency.id}
                    className="border-b last:border-0 border-border hover:bg-secondary/30 transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {emergency.user}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3 text-sm text-muted-foreground">{emergency.phone}</td>

                    {/* Time */}
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {formatEmergencyTime(emergency.createdAt)}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />

                        <span>{emergency.location}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          statusStyles[emergency.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {emergency.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/admin/liveMonitoring/$alertId",
                            params: {
                              alertId: emergency.id,
                            },
                          })
                        }
                        className="flex items-center gap-1 text-xs font-medium text-info hover:underline"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
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

/*
 * =========================================================
 * Format emergency time
 * =========================================================
 */

function formatEmergencyTime(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
