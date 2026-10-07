/* eslint-disable prettier/prettier */
import { supabase } from "@/lib/supabase";

export type TrackingStatus =
  | "inactive"
  | "starting"
  | "active"
  | "gps-error"
  | "supabase-error"
  | "stopped";

export type TrackingState = {
  status: TrackingStatus;
  alertId: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  lastUpdate: string | null;
  updateCount: number;
  message: string;
};

type TrackingListener = (state: TrackingState) => void;

let watchId: number | null = null;

let trackingState: TrackingState = {
  status: "inactive",
  alertId: null,
  latitude: null,
  longitude: null,
  accuracy: null,
  lastUpdate: null,
  updateCount: 0,
  message: "Live tracking is inactive.",
};

const listeners = new Set<TrackingListener>();

function emit(updates: Partial<TrackingState>) {
  trackingState = {
    ...trackingState,
    ...updates,
  };

  listeners.forEach((listener) => {
    listener(trackingState);
  });
}

/**
 * Subscribe to live tracking state changes.
 *
 * Returns an unsubscribe function.
 */
export function subscribeToTracking(
  listener: TrackingListener,
) {
  listeners.add(listener);

  // Immediately give the new subscriber the current state.
  listener(trackingState);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get the current tracking state.
 */
export function getTrackingState(): TrackingState {
  return trackingState;
}

/**
 * Start watching the victim's GPS location.
 */
export function startEmergencyTracking(alertId: string) {
  if (!navigator.geolocation) {
    console.error(
      "Geolocation is not supported by this browser.",
    );

    emit({
      status: "gps-error",
      alertId,
      message:
        "Geolocation is not supported by this device.",
    });

    return;
  }

  // Prevent duplicate watchers.
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  console.log(
    "STARTING LIVE TRACKING:",
    alertId,
  );

  emit({
    status: "starting",
    alertId,
    latitude: null,
    longitude: null,
    accuracy: null,
    lastUpdate: null,
    updateCount: 0,
    message: "Waiting for GPS location...",
  });

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      const timestamp = new Date().toISOString();

      console.log("LIVE LOCATION UPDATE:", {
        latitude,
        longitude,
        accuracy,
      });

      // Update the React-visible state immediately.
      emit({
        status: "active",
        alertId,
        latitude,
        longitude,
        accuracy,
        lastUpdate: timestamp,
        updateCount: trackingState.updateCount + 1,
        message: "GPS location received.",
      });

      // Save the location to Supabase.
      const { error } = await supabase
        .from("sos_alerts")
        .update({
          latitude,
          longitude,
          location_accuracy: accuracy,
          location_updated_at: timestamp,
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

        emit({
          status: "supabase-error",
          message:
            "GPS location received, but it could not be saved to the server.",
        });

        return;
      }

      console.log(
        "LOCATION SAVED TO SUPABASE:",
        {
          latitude,
          longitude,
          accuracy,
        },
      );

      emit({
        status: "active",
        message: "GPS location saved successfully.",
      });
    },
    (error) => {
      console.error(
        "LIVE TRACKING GPS ERROR:",
        error,
      );

      let message =
        "Unable to get the device location.";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          message =
            "Location permission was denied.";
          break;

        case error.POSITION_UNAVAILABLE:
          message =
            "The device location is currently unavailable.";
          break;

        case error.TIMEOUT:
          message =
            "GPS location request timed out.";
          break;
      }

      emit({
        status: "gps-error",
        alertId,
        message,
      });
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    },
  );
}

/**
 * Stop watching the victim's GPS location.
 */
export function stopEmergencyTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  console.log("LIVE TRACKING STOPPED");

  emit({
    status: "stopped",
    message: "Live tracking has stopped.",
  });
}