import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, ShieldAlert, User } from "lucide-react";
import { useEffect, useState } from "react";

import { getAdminEmergencyDetails, type AdminEmergencyDetails } from "@/services/adminService";

export const Route = createFileRoute("/admin/emergencyLogs_/$alertId")({
  component: EmergencyLogsDetails,
});

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  Active: "bg-emergency-soft text-emergency",
  Sent: "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

function EmergencyLogsDetails() {
  const { alertId } = Route.useParams();

  const [emergency, setEmergency] = useState<AdminEmergencyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmergency() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminEmergencyDetails(alertId);

        setEmergency(data);
      } catch (err) {
        console.error("Failed to load emergency details:", err);

        setError(err instanceof Error ? err.message : "Failed to load emergency details.");
      } finally {
        setLoading(false);
      }
    }

    loadEmergency();
  }, [alertId]);

  if (loading) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        Loading emergency details...
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div>
        <Link
          to="/admin/emergencyLogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Emergency Logs
        </Link>

        <div className="bg-emergency-soft text-emergency border border-border rounded-lg px-4 py-3 text-sm">
          {error ?? "Emergency alert not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Link
        to="/admin/emergencyLogs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Emergency Logs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShieldAlert className="h-6 w-6 text-emergency" />

            <h1 className="text-2xl font-bold text-foreground">Emergency Details</h1>
          </div>

          <p className="text-sm text-muted-foreground">Emergency alert information</p>
        </div>

        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            statusStyles[emergency.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {emergency.status}
        </span>
      </div>

      {/* Emergency information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Details */}
        <section className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Emergency Information</h2>
          </div>

          <div className="p-5 space-y-5">
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Triggered"
              value={formatEmergencyDate(emergency.createdAt)}
            />

            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={emergency.location}
            />

            <InfoRow
              icon={<ShieldAlert className="h-4 w-4" />}
              label="Trigger Source"
              value={emergency.triggerSource ?? "Unknown"}
            />

            <div>
              <p className="text-xs text-muted-foreground mb-2">Message</p>

              <div className="bg-secondary/40 rounded-md px-3 py-3 text-sm text-foreground">
                {emergency.message || "No emergency message provided."}
              </div>
            </div>

            {(emergency.latitude !== null || emergency.longitude !== null) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Latitude</p>

                  <p className="text-sm text-foreground">{emergency.latitude ?? "Unknown"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Longitude</p>

                  <p className="text-sm text-foreground">{emergency.longitude ?? "Unknown"}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* User Information */}
        <section className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">User Information</h2>
          </div>

          <div className="p-5 space-y-5">
            <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={emergency.user.name} />

            <InfoRow label="Phone" value={emergency.user.phone} />

            <InfoRow label="Email" value={emergency.user.email} />

            <InfoRow label="Address" value={emergency.user.address ?? "Not provided"} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Blood Type</p>

                <p className="text-sm text-foreground">
                  {emergency.user.bloodType ?? "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Allergies</p>

                <p className="text-sm text-foreground">
                  {emergency.user.allergies ?? "None provided"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Health Conditions</p>

              <p className="text-sm text-foreground">
                {emergency.user.healthConditions ?? "None provided"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Location placeholder
      <section className="bg-card rounded-lg border border-border overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Emergency Location</h2>
        </div>

        <div className="p-5">
          <div className="rounded-lg bg-secondary/30 border border-border min-h-48 flex flex-col items-center justify-center text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mb-2" />

            <p className="text-sm font-medium text-foreground">Map coming later</p>

            <p className="text-xs text-muted-foreground mt-1">
              Live location tracking will be displayed here.
            </p>

            {emergency.latitude !== null && emergency.longitude !== null && (
              <p className="text-xs text-muted-foreground mt-3">
                {emergency.latitude}, {emergency.longitude}
              </p>
            )}
          </div>
        </div>
      </section> */}
    </div>
  );
}

/*
 * =========================================================
 * Reusable information row
 * =========================================================
 */

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>

        <p className="text-sm text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * Format emergency date
 * =========================================================
 */

function formatEmergencyDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
