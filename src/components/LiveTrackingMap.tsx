/* eslint-disable prettier/prettier */
import { useEffect, useState, type ComponentType } from "react";

type LiveTrackingMapProps = {
  latitude: number;
  longitude: number;
};

type LeafletMapProps = {
  latitude: number;
  longitude: number;
};

export default function LiveTrackingMap({
  latitude,
  longitude,
}: LiveTrackingMapProps) {
  const [MapComponent, setMapComponent] =
    useState<ComponentType<LeafletMapProps> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMap() {
      // These packages are loaded only in the browser.
      const [{ MapContainer, Marker, Popup, TileLayer, useMap }, L] =
        await Promise.all([
          import("react-leaflet"),
          import("leaflet"),
          import("leaflet/dist/leaflet.css"),
        ]);

      if (!mounted) {
        return;
      }

      const markerIcon = L.icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      function MapUpdater({
        latitude,
        longitude,
      }: LeafletMapProps) {
        const map = useMap();

        useEffect(() => {
          map.setView([latitude, longitude], map.getZoom());
        }, [latitude, longitude, map]);

        return null;
      }

      function Map({
        latitude,
        longitude,
      }: LeafletMapProps) {
        return (
          <MapContainer
            center={[latitude, longitude]}
            zoom={16}
            scrollWheelZoom={true}
            className="h-[400px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[latitude, longitude]}
              icon={markerIcon}
            >
              <Popup>Emergency location</Popup>
            </Marker>

            <MapUpdater
              latitude={latitude}
              longitude={longitude}
            />
          </MapContainer>
        );
      }

      if (mounted) {
        setMapComponent(() => Map);
      }
    }

    loadMap().catch((error) => {
      console.error("Failed to load Leaflet map:", error);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!MapComponent) {
    return (
      <div className="mt-6 flex h-[400px] w-full items-center justify-center rounded-xl bg-gray-100">
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl">
      <MapComponent
        latitude={latitude}
        longitude={longitude}
      />
    </div>
  );
}