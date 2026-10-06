import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/track/$alertId/$trackingToken")({
  component: TrackingPage,
});

type Alert = {
  id: string;
  user_id: string;
  status: string | null;
  message: string | null;
  trigger_source: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  location_updated_at: string | null;
};

type Victim = {
  user_id: string;
  first_name: string;
  last_name: string;
  other_names: string;
  phone: string;
  email?: string | null;
  DOB?: string | null;
  country?: string | null;
  gender?: string | null;
  profession?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  health_conditions?: string | null;
};

type TrackingAccessResponse = {
  alert: Alert;
  permissions: {
    contact_id: string;
    share_medical_info: boolean;
    share_personal_info: boolean;
  };
  victim: Victim | null;
  error?: string;
};

function TrackingPage() {
  const { alertId, trackingToken } = Route.useParams();

  const [alert, setAlert] = useState<Alert | null>(null);
  const [victim, setVictim] = useState<Victim | null>(null);

  const [shareMedicalInfo, setShareMedicalInfo] = useState(false);
  const [sharePersonalInfo, setSharePersonalInfo] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEmergency() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: functionError } =
          await supabase.functions.invoke<TrackingAccessResponse>("tracking-access", {
            body: {
              alertId,
              trackingToken,
            },
          });

        if (!mounted) {
          return;
        }

        if (functionError) {
          console.error("Tracking access function failed:", functionError);

          setError("This emergency link is invalid or the emergency could not be found.");
          setLoading(false);
          return;
        }

        if (!data || data.error) {
          console.error("Tracking access error:", data?.error);

          setError(
            data?.error || "This emergency link is invalid or the emergency could not be found.",
          );
          setLoading(false);
          return;
        }

        console.log("TRACKING ACCESS DATA:", data);

        setAlert(data.alert);
        setVictim(data.victim);

        setSharePersonalInfo(data.permissions?.share_personal_info ?? false);

        setShareMedicalInfo(data.permissions?.share_medical_info ?? false);

        setLoading(false);
      } catch (loadError) {
        console.error("Tracking page error:", loadError);

        if (!mounted) {
          return;
        }

        setError("Something went wrong while loading this emergency.");
        setLoading(false);
      }
    }

    loadEmergency();

    // =======================================================
    // Listen for live emergency/location updates
    // =======================================================

    const channel = supabase
      .channel(`sos-tracking-${alertId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sos_alerts",
          filter: `id=eq.${alertId}`,
        },
        (payload) => {
          console.log("Realtime location update:", payload.new);

          if (!mounted) {
            return;
          }

          setAlert(payload.new as Alert);
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription:", status);
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [alertId, trackingToken]);

  // =========================================================
  // Loading state
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600">Loading emergency...</p>
      </div>
    );
  }

  // =========================================================
  // Error state
  // =========================================================

  if (error || !alert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <span className="text-2xl">⚠️</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Tracking Unavailable</h1>

          <p className="mt-3 text-gray-600">
            {error || "This emergency link is invalid or the emergency no longer exists."}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // Emergency status
  // =========================================================

  const isActive =
    alert.status?.toLowerCase() === "active" || alert.status?.toLowerCase() === "pending";

  // =========================================================
  // Victim information
  // =========================================================

  // Name and phone are ALWAYS visible.
  const victimName = victim
    ? [victim.first_name, victim.other_names, victim.last_name].filter(Boolean).join(" ")
    : "Unknown";

  const victimPhone = victim?.phone || "Phone number unavailable";

  // =========================================================
  // Additional personal information
  // =========================================================

  const showPersonalInformation = sharePersonalInfo;

  const showAvatar = showPersonalInformation && Boolean(victim?.avatar_url);

  const hasAdditionalPersonalInformation =
    showPersonalInformation &&
    Boolean(
      victim?.email ||
      victim?.DOB ||
      victim?.country ||
      victim?.gender ||
      victim?.profession ||
      victim?.address,
    );

  // =========================================================
  // Medical information
  // =========================================================

  const hasMedicalInformation =
    shareMedicalInfo &&
    Boolean(victim?.blood_type || victim?.allergies || victim?.health_conditions);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        {/* ================================================= */}
        {/* Emergency Header */}
        {/* ================================================= */}

        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              isActive ? "bg-red-100" : "bg-gray-100"
            }`}
          >
            <span className="text-2xl">{isActive ? "🚨" : "ℹ️"}</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {isActive ? "Emergency Active" : "Emergency"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {isActive
              ? "An emergency alert has been activated."
              : `Emergency status: ${alert.status ?? "Unknown"}`}
          </p>

          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-left">
            <p className="text-xs text-gray-500">Emergency Started</p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* Victim Information */}
        {/* ================================================= */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Person in Emergency</h2>

          <div className="mt-4 space-y-4">
            {/* Profile Photo */}

            {showAvatar && victim?.avatar_url && (
              <div className="flex justify-center">
                <img
                  src={victim.avatar_url}
                  alt={victimName}
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            )}

            {/* Name - ALWAYS SHOWN */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</p>

              <p className="mt-1 text-base font-semibold text-gray-900">{victimName}</p>
            </div>

            {/* Phone - ALWAYS SHOWN */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</p>

              <p className="mt-1 text-sm text-gray-800">{victimPhone}</p>
            </div>

            {/* ================================================= */}
            {/* Additional Personal Information */}
            {/* ================================================= */}

            {hasAdditionalPersonalInformation && (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-800">Personal Information</h3>

                <div className="mt-3 space-y-3">
                  {/* Email */}

                  {victim?.email && (
                    <div>
                      <p className="text-xs text-gray-500">Email</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.email}</p>
                    </div>
                  )}

                  {/* Date of Birth */}

                  {victim?.DOB && (
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.DOB}</p>
                    </div>
                  )}

                  {/* Gender */}

                  {victim?.gender && (
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.gender}</p>
                    </div>
                  )}

                  {/* Country */}

                  {victim?.country && (
                    <div>
                      <p className="text-xs text-gray-500">Country</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.country}</p>
                    </div>
                  )}

                  {/* Profession */}

                  {victim?.profession && (
                    <div>
                      <p className="text-xs text-gray-500">Profession</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.profession}</p>
                    </div>
                  )}

                  {/* Address */}

                  {victim?.address && (
                    <div>
                      <p className="text-xs text-gray-500">Address</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* Medical Information */}
            {/* ================================================= */}

            {hasMedicalInformation && (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-800">Medical Information</h3>

                <div className="mt-3 space-y-3">
                  {/* Blood Type */}

                  {victim?.blood_type && (
                    <div>
                      <p className="text-xs text-gray-500">Blood Type</p>

                      <p className="mt-1 text-sm font-medium text-gray-800">{victim.blood_type}</p>
                    </div>
                  )}

                  {/* Allergies */}

                  {victim?.allergies && (
                    <div>
                      <p className="text-xs text-gray-500">Allergies</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.allergies}</p>
                    </div>
                  )}

                  {/* Health Conditions */}

                  {victim?.health_conditions && (
                    <div>
                      <p className="text-xs text-gray-500">Health Conditions</p>

                      <p className="mt-1 text-sm text-gray-800">{victim.health_conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* Live Location */}
        {/* ================================================= */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Live Location</h2>

          {alert.latitude !== null && alert.longitude !== null ? (
            <>
              <LiveTrackingMap latitude={alert.latitude} longitude={alert.longitude} />

              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">Current Location</p>

                <p className="mt-2 text-sm text-gray-600">Latitude: {alert.latitude}</p>

                <p className="text-sm text-gray-600">Longitude: {alert.longitude}</p>

                {alert.location_accuracy !== null && (
                  <p className="mt-2 text-xs text-gray-500">
                    Accuracy: ±{alert.location_accuracy} m
                  </p>
                )}

                {alert.location_updated_at && (
                  <p className="mt-1 text-xs text-gray-500">
                    Updated: {new Date(alert.location_updated_at).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-600">Waiting for the victim's location...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
