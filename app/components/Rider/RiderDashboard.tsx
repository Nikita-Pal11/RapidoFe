"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CurrentLocation from "../Location/CurrentLocation";
import { useSocket } from "@/app/context/socketcontext";
import { RiderHeader } from "./RiderHeader";
import { RiderSidebar } from "./RiderSidebar";
import { LocationSearch } from "./LocationSearch";
import { RideSelector, RIDE_TYPES } from "./RideSelector";
import DriverSearching from "./DriverSearching";
import RideAccepted from "./RideAccepted";
import CheckoutPage from "../payment/CheckoutPage";
const LazyMap = dynamic(() => import("../Location/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] gap-3">
      <div className="w-9 h-9 border-3 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
      <p className="text-[#FFD700] text-sm font-semibold">Locating you…</p>
    </div>
  ),
});

export default function RiderDashboard() {
  // ── State ────────────────────────────────────────────────────────────────────
  const currentPosition = CurrentLocation();
  const [origin, setOrigin] = useState<string>("");
  const [ride, setRide] = useState<any[]>([]);
  const [pickupLatLong, setPickupLatLong] = useState<
    [number, number] | undefined
  >(currentPosition);
  const [dropoffLatLong, setDropoffLatLong] = useState<
    [number, number] | undefined
  >(undefined);
  const [dropoff, setDropoff] = useState<string>("");
  const [activetrip,setactivetrip]=useState<boolean>(false);
  const [ridestatus, setridestatus] = useState("");
  const [selectedRide, setSelectedRide] = useState("bike");
  const [showMenu, setShowMenu] = useState(false);
  const [currentride, setcurrentride] = useState({});
  const [showneardriver, setshowneardriver] = useState(false);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const { connectRideSocket, rideEvent, connectLocationSocket,driverLocation } = useSocket();

  // ── Nearest driver fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    async function NearestDriver() {
      try {
        if (!pickupLatLong || !dropoffLatLong) return;
        const [plng, plat] = pickupLatLong;
        const [dlng, dlat] = dropoffLatLong;
        const resp = await fetch(
          `http://localhost:3000/api/users/driver/nearestdriver?pickup_long=${plng}&pickup_lat=${plat}&dropoff_long=${dlng}&dropoff_lat=${dlat}`,
          { method: "GET", headers: { "Content-Type": "application/json" } },
        );
        if (!resp.ok) return;
        const data = await resp.json();
        setRide(data);
        setshowneardriver(true)
      } catch (error) {
        console.log("error", error);
      }
    }
    NearestDriver();
  }, [pickupLatLong, dropoffLatLong]);

  async function fetchActiveRide() {
    try {
      const resp = await fetch(`/api/ride/ridebooking`);
      if (!resp.ok) {
        console.error("Failed to fetch ride details:", resp.status);
        return;
      }
      const data = await resp.json();
      setactivetrip(data.active);
      if (data.active && data.ride) {
        setcurrentride(data.ride);
        const status = data.ride.status;
        if (status === "searching" || status === "requested") {
          setridestatus("searching");
        } else if (["accepted", "driver_arrived", "started"].includes(status)) {
          setridestatus(status);
        } else if (status === "payment_pending") {
          setridestatus("payment_pending");
        } else if (status === "completed") {
          setridestatus("completed");
        } else if (status === "canceled") {
          setridestatus("canceled");
        }
        connectRideSocket(data.ride.id);
        connectLocationSocket(data.ride.id);
      } else {
        setcurrentride({});
        setridestatus("");
      }
    } catch (err) {
      console.error("Error fetching ride details:", err);
    }
  }

  // ── Ride status socket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!rideEvent?.status) return;
    setridestatus(rideEvent.status);

    if (rideEvent.status === "accepted") {
      fetchActiveRide();
    }
  }, [rideEvent]);

  // ── Actions ───────────────────────────────────────────────────────────────────
  async function ridebooking() {
    if (!pickupLatLong || !dropoffLatLong) return;
    const [pickup_long, pickup_lat] = pickupLatLong; // stored as [lng, lat] by selectPlace
    const [drop_long, drop_lat] = dropoffLatLong;
    try {
      const resp = await fetch("/api/ride/ridebooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_lat,
          pickup_long,
          drop_lat,
          drop_long,
          vehicle_type: selectedRide,
          pickup_location: origin,
          drop_location: dropoff,
        }),
      });
      if (!resp.ok) return;
      setridestatus("searching");
      const data = await resp.json();
      connectRideSocket(data.id);
      setcurrentride(data);
      connectLocationSocket(data.id);
    } catch (e) {
      console.log("error", e);
    }
  }

  function selectPlace(
    formatted: string,
    lng: number,
    lat: number,
    type: "origin" | "dropoff",
  ) {
    if (type === "origin") {
      setOrigin(formatted);
      setPickupLatLong([lng, lat]);
    }
    if (type === "dropoff") {
      setDropoff(formatted);
      setDropoffLatLong([lng, lat]);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────────
  const bothFilled = origin.trim() && dropoff.trim();

  const bookLabel = (() => {
    const list = ride && ride.length > 0 ? ride : RIDE_TYPES;
    const item =
      list.find(
        (r: any, idx: number) =>
          (r.driver_id ?? r.id ?? `ride-${idx}`) === selectedRide,
      ) || list[0];
    const raw = item?.vehicletype || item?.label || "Ride";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  // Check for active ride on mount
  useEffect(() => {
    fetchActiveRide();
  }, []);

  // ── Main UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-screen font-[Inter,system-ui,sans-serif] overflow-hidden bg-[#0a0a0f] text-white">
      {/* Header */}
      <RiderHeader onMenuToggle={() => setShowMenu(!showMenu)} />

      {/* Sidebar */}
      <RiderSidebar isOpen={showMenu} onClose={() => setShowMenu(false)} />

      {/* Full-screen map — takes up the whole viewport */}
      <div className="absolute inset-0 z-0">
        <LazyMap driverlocation={[driverLocation?.lat, driverLocation?.lng]} />
      </div>

      {/* Booking panel — collapsible bottom sheet so map is clearly visible */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 bg-[#111118]/95 backdrop-blur-2xl rounded-t-[28px] px-5 pt-3 shadow-2xl border-t border-white/10 transition-all duration-300 ease-in-out ${
          isSheetCollapsed
            ? "max-h-[76px] pb-3 overflow-hidden cursor-pointer"
            : "max-h-[54vh] pb-6 overflow-y-auto"
        }`}
        onClick={() => {
          if (isSheetCollapsed) setIsSheetCollapsed(false);
        }}
      >
        {/* Drag handle & toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSheetCollapsed(!isSheetCollapsed);
          }}
          className="w-full flex flex-col items-center justify-center py-1 -mt-1 mb-2.5 cursor-pointer group focus:outline-none"
          aria-label={isSheetCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          <div className="w-10 h-1.5 rounded-full bg-white/20 group-hover:bg-[#FFD700] transition-colors" />
          <span className="text-[10px] font-bold text-white/40 group-hover:text-[#FFD700] transition-colors mt-0.5 flex items-center gap-1">
            {isSheetCollapsed ? "▲ Expand Booking Panel" : "▼ Peek at Map"}
          </span>
        </button>

        {ridestatus === "searching" ? (
          <DriverSearching ride_id={(currentride as any)?.id} />
        ) : ["accepted", "driver_arrived", "started", "canceled"].includes(
            ridestatus,
          ) ? (
          <RideAccepted
            rideinfo={currentride}
            ridestatus={ridestatus}
            onReset={() => {
              setridestatus("");
              setactivetrip(false);
              setcurrentride({});
            }}
          />
        ) : ridestatus === "payment_pending" ? (
          <div className="flex justify-center py-2 animate-[cardPop_0.4s_ease_both]">
            <CheckoutPage
              ride_id={(currentride as any).id}
              driver_id={(currentride as any).driver?.id}
              driver_name={
                (currentride as any).driver?.user?.username || "Driver"
              }
            />
          </div>
        ) : ridestatus === "completed" ? (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-4 animate-[cardPop_0.4s_ease_both]">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/5">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-black text-white m-0">
                Ride Completed
              </h2>
              <p className="text-xs text-white/50 mt-1 mb-0">
                Your payment has been processed successfully. Thank you for
                riding with Rapido!
              </p>
            </div>
            <button
              onClick={() => {
                setridestatus("");
                setactivetrip(false);
                setcurrentride({});
              }}
              className="w-full py-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-2xl text-sm font-black text-white cursor-pointer transition-all active:scale-[0.99]"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-3" />

            {/* Header */}
            <div className="mb-3">
              <p className="text-xs font-medium text-white/45 m-0">
                Good evening 👋
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-white m-0">
                Where to?
              </h1>
            </div>

            {/* Search: inputs + shortcuts + autocomplete */}
            <LocationSearch
              origin={origin}
              dropoff={dropoff}
              onOriginClear={() => setOrigin("")}
              onDropoffClear={() => setDropoff("")}
              onCurrentLocationShortcut={() => setOrigin("Current Location")}
              onHomeShortcut={() => setDropoff("Koramangala 5th Block")}
              onOfficeShortcut={() => setDropoff("Indiranagar 100ft Road")}
              onSelectPlace={selectPlace}
            />

            {/* Ride type selector */}
            {showneardriver && (
              <RideSelector
                ride={ride}
                selectedRide={selectedRide}
                onSelectRide={setSelectedRide}
              />
            )}

            {/* Book CTA */}
            <button
              id="book-ride-btn"
              className={`w-full py-4 rounded-2xl font-extrabold text-base tracking-tight transition-all border-0 ${
                bothFilled && showneardriver
                  ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] shadow-xl shadow-[#FFD700]/30 hover:brightness-105 active:scale-[0.99] cursor-pointer"
                  : "bg-white/[0.06] text-white/25 border border-white/5 cursor-not-allowed"
              }`}
              disabled={!bothFilled || !showneardriver}
              onClick={ridebooking}
            >
              {bothFilled && showneardriver
                ? `Book ${bookLabel} →`
                : "Enter pickup & drop-off to continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
