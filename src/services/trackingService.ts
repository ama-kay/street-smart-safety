/* eslint-disable prettier/prettier */
import { supabase } from "@/lib/supabase";

let watchId: number | null = null;

export function startEmergencyTracking(alertId: string) {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return;
  }

  // Prevent duplicate watchers.
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  console.log("STARTING LIVE TRACKING:", alertId);

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      console.log("LIVE LOCATION UPDATE:", {
        latitude,
        longitude,
        accuracy,
      });

      const { error } = await supabase
        .from("sos_alerts")
        .update({
          latitude,
          longitude,
          location_accuracy: accuracy,
          location_updated_at: new Date().toISOString(),
          location: JSON.stringify({
            latitude,
            longitude,
          }),
        })
        .eq("id", alertId);

      if (error) {
        console.error(
          "Failed to update emergency location:",
          error,
        );
      }
    },
    (error) => {
      console.error("LIVE TRACKING GPS ERROR:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    },
  );
}

export function stopEmergencyTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;

    console.log("LIVE TRACKING STOPPED");
  }
}