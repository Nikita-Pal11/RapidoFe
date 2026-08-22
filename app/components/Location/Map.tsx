
"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import CurrentLocation from "./CurrentLocation";
export default function Map() {
  const currentPosition: [number, number] | undefined = CurrentLocation()

  // Wait for geolocation before rendering the map — Leaflet ignores center changes after mount
  if (!currentPosition) return <p>Loading map…</p>

  // IMPORTANT: the map container needs a defined size, otherwise nothing will be visible
  return (
      <MapContainer
        center={currentPosition}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={currentPosition}>
          <Popup>
            This Marker icon is displayed correctly with <i>leaflet-defaulticon-compatibility</i>.
          </Popup>
        </Marker>
      </MapContainer>
  );
}
