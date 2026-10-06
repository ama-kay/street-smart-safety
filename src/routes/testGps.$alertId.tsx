import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/testGps/$alertId")({
  component: TestGpsPage,
});

function TestGpsPage() {
  const { alertId } = Route.useParams();

  const [status, setStatus] = useState<string | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState("Loading emergency...");

  // Load the SOS and listen for status changes
  useEffect(() => {
    let mounted = true;

    async function loadAlert() {
      const { data, error } = await supabase
        .from("sos_alerts")
        .select("status, latitude, longitude, location_accuracy")
        .eq("id", alertId)
        .single();

      if (!mounted) return;

      if (error) {
        console.error("Failed to load emergency:", error);
        setMessage("Could not load this emergency.");
        return;
      }

      setStatus(data.status);

      if (data.latitude !== null) {
        setLatitude(data.latitude);
      }

      if (data.longitude !== null) {
        setLongitude(data.longitude);
      }

      if (data.location_accuracy !== null) {
        setAccuracy(data.location_accuracy);
      }

      if (data.status?.toLowerCase() === "active") {
        setTracking(true);
        setMessage("Emergency active. Starting GPS tracking...");
      } else if (data.status?.toLowerCase() === "resolved") {
        setTracking(false);
        setMessage("Emergency resolved. GPS tracking stopped.");
      } else {
        setMessage(`Emergency status: ${data.status ?? "Unknown"}`);
      }
    }

    loadAlert();

    const channel = supabase
      .channel(`gps-status-${alertId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sos_alerts",
          filter: `id=eq.${alertId}`,
        },
        (payload) => {
          console.log("SOS update:", payload.new);

          if (!mounted) return;

          const newStatus = payload.new.status as string | null;

          setStatus(newStatus);

          if (newStatus?.toLowerCase() === "active") {
            setTracking(true);
            setMessage("Emergency active. GPS tracking is running.");
          }

          if (newStatus?.toLowerCase() === "resolved") {
            setTracking(false);
            setMessage("Emergency resolved. GPS tracking has stopped.");
          }
        },
      )
      .subscribe((subscriptionStatus) => {
        console.log("SOS status subscription:", subscriptionStatus);
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [alertId]);

  // Start/stop GPS based on the tracking state
  useEffect(() => {
    let watchId: number | null = null;

    if (!tracking) {
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser.");
      setTracking(false);
      return;
    }

    setMessage("Requesting GPS location...");

    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLatitude = position.coords.latitude;
        const newLongitude = position.coords.longitude;
        const newAccuracy = position.coords.accuracy;

        console.log("GPS position:", {
          latitude: newLatitude,
          longitude: newLongitude,
          accuracy: newAccuracy,
        });

        setLatitude(newLatitude);
        setLongitude(newLongitude);
        setAccuracy(newAccuracy);

        const { error } = await supabase
          .from("sos_alerts")
          .update({
            latitude: newLatitude,
            longitude: newLongitude,
            location_accuracy: newAccuracy,
            location_updated_at: new Date().toISOString(),
          })
          .eq("id", alertId);

        if (error) {
          console.error("Failed to save GPS location:", error);

          setMessage(`Failed to save location: ${error.message}`);

          return;
        }

        setMessage("Live location updated.");
      },
      (error) => {
        console.error("GPS error:", error);

        setMessage(`GPS error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log("GPS watch stopped.");
      }
    };
  }, [tracking, alertId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">GPS Tracking Test</h1>

        <p className="mt-2 text-sm text-gray-600 break-all">SOS ID: {alertId}</p>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">Emergency Status</p>

          <p className="mt-2 text-sm text-gray-600">{status ?? "Loading..."}</p>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">Current GPS Location</p>

          {latitude !== null && longitude !== null ? (
            <>
              <p className="mt-2 text-sm text-gray-600">Latitude: {latitude}</p>

              <p className="text-sm text-gray-600">Longitude: {longitude}</p>

              {accuracy !== null && (
                <p className="mt-2 text-xs text-gray-500">Accuracy: ±{accuracy.toFixed(2)} m</p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Waiting for GPS location...</p>
          )}
        </div>

        <div className="mt-6 rounded-lg bg-gray-100 p-4 text-center">
          <p className="text-sm font-medium text-gray-700">GPS Tracking</p>

          <p className="mt-1 text-sm text-gray-600">{tracking ? "Active" : "Stopped"}</p>
        </div>

        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
