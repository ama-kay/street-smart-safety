/* eslint-disable prettier/prettier */
import { supabase } from "@/lib/supabase";

export interface SOSAlert {
  id: string;
  user_id: string;
  message: string;
  location: string;
  created_at: string;
  trigger_source: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
}

interface CurrentLocation {
  latitude: number | null;
  longitude: number | null;
  formatted: string;
}

/*
 * Send an emergency alert triggered from inside the app.
 *
 * The app does NOT create the SOS alert directly.
 * Instead, it calls the Emergency Edge Function.
 *
 * The Edge Function is responsible for:
 * - authenticating the user
 * - creating the SOS alert
 * - creating the notification
 * - getting emergency contacts
 * - checking sharing permissions
 * - creating alert_deliveries
 * - sending SMS
 */
export async function sendSOSAlert(): Promise<SOSAlert> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error(
      "You must be logged in to trigger an emergency alert.",
    );
  }

  const currentLocation = await getCurrentLocation();

  /*
   * Call the Emergency Edge Function.
   *
   * supabase.functions.invoke automatically sends
   * the user's Supabase authentication session.
   */
  console.log("CALLING EMERGENCY FUNCTION", {
    trigger_source: "app",
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    address: currentLocation.formatted,
  });

  const { data, error } =
    

    await supabase.functions.invoke(
      "emergency-trigger",
      {
        body: {
          trigger_source: "app",
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: currentLocation.formatted,
        },
      },
    );

  if (error) {
    console.error(
      "Emergency Edge Function error:",
      error,
    );

    throw new Error(
      error.message ||
        "Failed to activate emergency alert.",
    );
  }

  if (!data?.success || !data?.alert) {
    throw new Error(
      data?.error ||
        "Emergency alert could not be activated.",
    );
  }

  console.log(
    "APP EMERGENCY RESPONSE:",
    data,
  );

  return data.alert as SOSAlert;
}

export async function getSOSAlerts(): Promise<SOSAlert[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to view emergency history.");
  }

  const { data, error } = await supabase
    .from("sos_alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as SOSAlert[];
}

// function getCurrentLocation(): Promise<CurrentLocation> {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       resolve({
//         latitude: null,
//         longitude: null,
//         formatted: "Location unavailable",
//       });
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const latitude = position.coords.latitude;
//         const longitude = position.coords.longitude;

//         resolve({
//           latitude,
//           longitude,
//           formatted: `${latitude}, ${longitude}`,
//         });
//       },
//       () => {
//         resolve({
//           latitude: null,
//           longitude: null,
//           formatted: "Location unavailable",
//         });
//       },
//     );
//   });
// }

function getCurrentLocation(): Promise<CurrentLocation> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported.");
      resolve({
        latitude: null,
        longitude: null,
        formatted: "Location unavailable",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("LOCATION SUCCESS:", {
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        });

        resolve({
          latitude,
          longitude,
          formatted: `${latitude}, ${longitude}`,
        });
      },
      (error) => {
        console.error("LOCATION ERROR:", {
          code: error.code,
          message: error.message,
        });

        resolve({
          latitude: null,
          longitude: null,
          formatted: `Location unavailable (${error.message})`,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}