import { createFileRoute } from "@tanstack/react-router";
import { requireCompletedSetup } from "@/lib/routeGuards";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Clock, AlertTriangle } from "lucide-react";
import { getSOSAlerts, type SOSAlert } from "@/services/alertService";

export const Route = createFileRoute("/history")({
  beforeLoad: requireCompletedSetup,
  component: History,
});

function History() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getSOSAlerts();
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load emergency history.");
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  return (
    <MobileShell>
      <ScreenHeader title="Emergency History" />

      <div className="flex-1 px-6 pt-6 pb-10 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">Recent alerts you've triggered.</p>

        {/* LOADING */}

        {loading && (
          <div className="flex justify-center py-10">
            <p className="text-sm text-muted-foreground">Loading history...</p>
          </div>
        )}

        {/* ERROR */}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* EMPTY STATE */}

        {!loading && !error && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />

            <p className="text-sm font-semibold">No emergencies yet</p>

            <p className="text-xs text-muted-foreground mt-1">
              Your triggered emergency alerts will appear here.
            </p>
          </div>
        )}

        {/* ALERT HISTORY */}

        {!loading && !error && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const date = new Date(alert.created_at);

              const triggerMode =
                alert.trigger_source === "shortcut" ? "Emergency Shortcut" : "App";

              const hasCoordinates = alert.latitude !== null && alert.longitude !== null;

              return (
                <div
                  key={alert.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4 shadow-card overflow-hidden"
                >
                  {/* ICON */}

                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">
                    {/* TITLE + STATUS */}

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm min-w-0">Emergency Alert</h3>

                      <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {alert.status || "Active"}
                      </span>
                    </div>

                    {/* DATE + TIME */}

                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />

                      <span>
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}{" "}
                        ·{" "}
                        {date.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>

                    {/* TRIGGER MODE */}

                    <p className="text-xs text-muted-foreground mt-2">
                      Triggered by:{" "}
                      <span className="font-medium text-foreground">{triggerMode}</span>
                    </p>

                    {/* LOCATION */}

                    <div className="mt-2 min-w-0">
                      <p className="text-[11px] font-semibold text-muted-foreground">Location</p>

                      {hasCoordinates ? (
                        <p className="text-xs text-muted-foreground mt-0.5 break-all">
                          {Number(alert.latitude).toFixed(6)}, {Number(alert.longitude).toFixed(6)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-0.5">Location unavailable</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
