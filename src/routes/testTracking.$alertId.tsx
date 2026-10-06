import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/testTracking/$alertId")({
  component: TestTrackingPage,
});

const testLocations = [
  {
    latitude: 5.6037,
    longitude: -0.187,
  },
  {
    latitude: 5.6041,
    longitude: -0.1865,
  },
  {
    latitude: 5.6048,
    longitude: -0.1859,
  },
  {
    latitude: 5.6054,
    longitude: -0.1852,
  },
  {
    latitude: 5.606,
    longitude: -0.1846,
  },
];

function TestTrackingPage() {
  const { alertId } = Route.useParams();

  const [locationIndex, setLocationIndex] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // async function sendNextLocation() {
  //   const location = testLocations[locationIndex];

  //   if (!location) return;

  //   setUpdating(true);
  //   setMessage("");

  //   const { error } = await supabase
  //     .from("sos_alerts")
  //     .update({
  //       latitude: location.latitude,
  //       longitude: location.longitude,
  //       location_accuracy: 10,
  //       location_updated_at: new Date().toISOString(),
  //     })
  //     .eq("id", alertId);

  //   if (error) {
  //     console.error("Failed to update location:", error);
  //     setMessage(`Error: ${error.message}`);
  //   } else {
  //     setMessage(`Location ${locationIndex + 1} sent successfully.`);

  //     setLocationIndex((current) => (current + 1 < testLocations.length ? current + 1 : 0));
  //   }

  //   setUpdating(false);
  // }

  // async function sendNextLocation() {
  //   const location = testLocations[locationIndex];

  //   if (!location) return;

  //   setUpdating(true);
  //   setMessage("");

  //   console.log("Attempting update:", {
  //     alertId,
  //     location,
  //   });

  //   const { data: userData, error: userError } = await supabase.auth.getUser();

  //   console.log("Current user:", userData.user);
  //   console.log("User error:", userError);

  //   const { error } = await supabase
  //     .from("sos_alerts")
  //     .update({
  //       latitude: location.latitude,
  //       longitude: location.longitude,
  //       location_accuracy: 10,
  //       location_updated_at: new Date().toISOString(),
  //     })
  //     .eq("id", alertId);

  //   if (error) {
  //     console.error("Failed to update location:", error);
  //     setMessage(`Error: ${error.message}`);
  //   } else {
  //     setMessage(`Location ${locationIndex + 1} sent successfully.`);

  //     setLocationIndex((current) => (current + 1 < testLocations.length ? current + 1 : 0));
  //   }
  // }

  async function sendNextLocation() {
    const location = testLocations[locationIndex];

    if (!location) return;

    setUpdating(true);
    setMessage("");

    console.log("Attempting update:", {
      alertId,
      location,
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();

    console.log("Current user:", userData.user);
    console.log("User error:", userError);

    const { error } = await supabase
      .from("sos_alerts")
      .update({
        latitude: location.latitude,
        longitude: location.longitude,
        location_accuracy: 10,
        location_updated_at: new Date().toISOString(),
      })
      .eq("id", alertId);

    if (error) {
      console.error("Failed to update location:", error);
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`Location ${locationIndex + 1} sent successfully.`);

      setLocationIndex((current) => (current + 1 < testLocations.length ? current + 1 : 0));
    }

    // Reset the button after the request finishes
    setUpdating(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Tracking Test</h1>

        <p className="mt-2 text-sm text-gray-600 break-all">SOS ID: {alertId}</p>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">Next Test Location</p>

          <p className="mt-2 text-sm text-gray-600">
            Latitude: {testLocations[locationIndex].latitude}
          </p>

          <p className="text-sm text-gray-600">
            Longitude: {testLocations[locationIndex].longitude}
          </p>
        </div>

        <button
          type="button"
          onClick={sendNextLocation}
          disabled={updating}
          className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {updating ? "Updating..." : "Send Next Location"}
        </button>

        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
