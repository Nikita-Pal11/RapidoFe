
"use client";
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import CurrentLocation from "./CurrentLocation";

// ── Custom SVG DivIcons ───────────────────────────────────────────────────────
const createRiderIcon = () =>
  L.divIcon({
    className: "custom-rider-pin",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
    html: `
      <div class="relative flex items-center justify-center w-9 h-9">
        <span class="absolute inline-flex w-full h-full rounded-full bg-[#FFD700]/30 animate-ping"></span>
        <div class="relative w-7 h-7 rounded-full bg-[#FFD700] border-2 border-[#0a0a0f] shadow-xl shadow-[#FFD700]/50 flex items-center justify-center">
          <div class="w-2.5 h-2.5 rounded-full bg-[#0a0a0f]"></div>
        </div>
      </div>
    `,
  });

const createDriverIcon = () =>
  L.divIcon({
    className: "custom-driver-pin",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21],
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute inline-flex w-full h-full rounded-full bg-[#FFD700]/25 animate-pulse"></span>
        <div class="relative w-8 h-8 rounded-2xl bg-[#111118] border-2 border-[#FFD700] shadow-xl shadow-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5.5" cy="17.5" r="3.5"/>
            <circle cx="18.5" cy="17.5" r="3.5"/>
            <path d="M5.5 17.5 9 6l4 4 4-3.5M9 6h7"/>
            <circle cx="16" cy="6" r="1"/>
          </svg>
        </div>
      </div>
    `,
  });

// ── Map Controller for automatic smooth panning & zoom ────────────────────────
function MapController({
  riderPos,
  driverPos,
}: {
  riderPos?: [number, number];
  driverPos?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (riderPos && driverPos) {
      const bounds = L.latLngBounds([riderPos, driverPos]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (driverPos) {
      map.flyTo(driverPos, 15, { duration: 1.2 });
    } else if (riderPos) {
      map.flyTo(riderPos, 14, { duration: 1.2 });
    }
  }, [riderPos, driverPos, map]);

  return null;
}

// ── Leaflet Draw Toolbar Handler ──────────────────────────────────────────────
function DrawToolbar() {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    let drawControl: any = null;

    import("leaflet-draw").then(() => {
      if (!featureGroupRef.current) {
        featureGroupRef.current = new L.FeatureGroup();
        map.addLayer(featureGroupRef.current);
      }

      drawControl = new (L.Control as any).Draw({
        position: "topright",
        edit: {
          featureGroup: featureGroupRef.current,
        },
        draw: {
          polyline: {
            shapeOptions: {
              color: "#FFD700",
              weight: 5,
              opacity: 0.9,
            },
          },
          polygon: false,
          circle: false,
          rectangle: false,
          circlemarker: false,
          marker: {
            icon: createRiderIcon(),
          },
        },
      });

      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        featureGroupRef.current?.addLayer(layer);
        if (e.layerType === "polyline") {
          console.log("Route Path Coordinates:", layer.getLatLngs());
        }
      });
    });

    return () => {
      if (drawControl) {
        try {
          map.removeControl(drawControl);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [map]);

  return null;
}

// ── Main Map Component ────────────────────────────────────────────────────────
export default function Map({
  driverlocation,
}: {
  driverlocation: [number | undefined, number | undefined];
}) {
  const currentPosition: [number, number] | undefined = CurrentLocation();
  const lat = driverlocation?.[0];
  const lng = driverlocation?.[1];
  const driverPos: [number, number] | undefined =
    lat !== undefined && lng !== undefined ? [lat, lng] : undefined;

  // Custom icons instantiated on client
  const [icons, setIcons] = useState<{
    rider?: L.DivIcon;
    driver?: L.DivIcon;
  }>({});

  useEffect(() => {
    setIcons({
      rider: createRiderIcon(),
      driver: createDriverIcon(),
    });
  }, []);

  // Loading state with Rapido design
  if (!currentPosition) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] gap-3 min-h-[300px]">
        <div className="w-10 h-10 border-3 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
        <p className="text-[#FFD700] text-xs font-bold tracking-wider uppercase m-0">
          Locating your position…
        </p>  
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden">
      {/* Dark map style filter: inverts only the tile images, keeping pins and popups crystal clear */}
      <style jsx global>{`
        .leaflet-tile-pane {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7) !important;
        }
        .leaflet-container {
          background: #0a0a0f !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(17, 17, 24, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          color: white !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: rgba(17, 17, 24, 0.95) !important;
        }
      `}</style>

      <MapContainer
        center={driverPos || currentPosition}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: "100%", height: "100%", background: "#0a0a0f" }}
      >
        {/* OpenStreetMap Standard (100% Free, No Watermark, No API Key) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Dynamic map viewport controller */}
        <MapController riderPos={currentPosition} driverPos={driverPos} />

        {/* Leaflet Draw tool toolbar */}
        <DrawToolbar />

        {/* Rider / Pickup Location Marker */}
        {icons.rider && (
          <Marker position={currentPosition} icon={icons.rider}>
            <Popup className="custom-map-popup">
              <div className="p-1 text-center">
                <p className="text-xs font-black text-white m-0">Your Location</p>
                <p className="text-[10px] text-white/50 m-0">Pickup Point</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Location Marker */}
        {driverPos && icons.driver && (
          <Marker position={driverPos} icon={icons.driver}>
            <Popup className="custom-map-popup">
              <div className="p-1 text-center">
                <p className="text-xs font-black text-[#FFD700] m-0">Captain Nearby</p>
                <p className="text-[10px] text-white/50 m-0">Moving to pickup</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
