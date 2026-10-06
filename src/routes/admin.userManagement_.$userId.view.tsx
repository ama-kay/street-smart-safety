import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  HeartPulse,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getAdminUserDetails,
  type AdminUserAlert,
  type AdminUserDetails,
} from "@/services/adminService";

export const Route = createFileRoute("/admin/userManagement_/$userId/view")({
  component: UserDetails,
});

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  Active: "bg-emergency-soft text-emergency",
  Sent: "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

function UserDetails() {
  const { userId } = Route.useParams();

  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [alerts, setAlerts] = useState<AdminUserAlert[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminUserDetails(userId);

        setUser(data.user);
        setAlerts(data.alerts);
      } catch (err) {
        console.error("Failed to load user details:", err);

        setError(err instanceof Error ? err.message : "Failed to load user details.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <Link
          to="/admin/userManagement"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        <div className="bg-card rounded-lg border border-border px-5 py-8">
          <p className="text-sm text-emergency">{error ?? "User not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <Link
        to="/admin/userManagement"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h1>View User</h1>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>

            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            user.setupCompleted ? "bg-safe-soft text-safe" : "bg-warning-soft text-warning"
          }`}
        >
          {user.setupCompleted ? "Setup Completed" : "Setup Incomplete"}
        </span>
      </div>

      {/* Contact / Account */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone} />

        <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />

        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="Registered"
          value={user.registered}
        />
      </div>

      {/* Personal information */}
      <div className="bg-card rounded-lg border border-border mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />

          <h2 className="text-base font-semibold text-foreground">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
          <DetailItem label="First Name" value={getValue(user.name.split(" ")[0])} />

          <DetailItem label="Other Names" value={user.otherNames} />

          <DetailItem label="Date of Birth" value={formatDate(user.dateOfBirth)} />

          <DetailItem label="Gender" value={user.gender} />

          <DetailItem label="Country" value={user.country} />

          <DetailItem label="Profession" value={user.profession} />

          <DetailItem label="Address" value={user.address} />
        </div>
      </div>

      {/* Medical information */}
      <div className="bg-card rounded-lg border border-border mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-emergency" />

          <h2 className="text-base font-semibold text-foreground">Emergency Medical Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">
          <DetailItem label="Blood Type" value={user.bloodType} />

          <DetailItem label="Allergies" value={user.allergies} />

          <DetailItem label="Health Conditions" value={user.healthConditions} />
        </div>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Total Alerts"
          value={user.alerts}
        />

        <SummaryCard
          icon={<Activity className="h-4 w-4" />}
          label="Active Alerts"
          value={alerts.filter((alert) => alert.status === "Active").length}
        />

        <SummaryCard
          icon={<HeartPulse className="h-4 w-4" />}
          label="Resolved Alerts"
          value={alerts.filter((alert) => alert.status === "Resolved").length}
        />
      </div>

      {/* Emergency history */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Emergency History</h2>
        </div>

        {alerts.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            This user has no emergency alerts.
          </div>
        ) : (
          <div>
            {alerts.map((alert) => (
              <div key={alert.id} className="px-5 py-4 border-b last:border-0 border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          statusStyles[alert.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {alert.status}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {formatAlertDate(alert.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {alert.location}
                    </div>

                    {alert.message && (
                      <p className="text-sm text-foreground mt-2">{alert.message}</p>
                    )}

                    {alert.triggerSource && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Trigger: {alert.triggerSource}
                      </p>
                    )}
                  </div>

                  {alert.latitude !== null && alert.longitude !== null && (
                    <a
                      href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-info hover:underline whitespace-nowrap"
                    >
                      View Map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * Small UI components
 * =========================================================
 */

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>

      <p className="text-sm text-foreground">{value || "Not provided"}</p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        {icon}

        <span className="text-sm">{label}</span>
      </div>

      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

/*
 * =========================================================
 * Formatting
 * =========================================================
 */

function getValue(value: string): string {
  return value || "Not provided";
}

function formatDate(date: string | null): string {
  if (!date) {
    return "Not provided";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAlertDate(date: string): string {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
