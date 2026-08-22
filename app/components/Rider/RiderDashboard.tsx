"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CurrentLocation from "../Location/CurrentLocation";
import {
  BikeIcon,
  CarIcon,
  TaxiIcon,
  MenuIcon,
  BellIcon,
  StarIcon,
  LocationIcon,
  XIcon,
  ClockIcon,
} from "../Driver/icons";

const LazyMap = dynamic(() => import("../Location/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] gap-3">
      <div className="w-9 h-9 border-3 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
      <p className="text-[#FFD700] text-sm font-semibold">Locating you…</p>
    </div>
  ),
});

const RIDE_TYPES = [
  {
    id: "bike",
    icon: <BikeIcon size={24} />,
    label: "Bike",
    eta: "2 min away",
    price: "₹25",
    tag: "Fastest",
  },
  {
    id: "auto",
    icon: <TaxiIcon size={24} />,
    label: "Auto",
    eta: "4 min away",
    price: "₹45",
    tag: "Popular",
  },
  {
    id: "cab",
    icon: <CarIcon size={24} />,
    label: "Cab",
    eta: "6 min away",
    price: "₹85",
    tag: "Comfort",
  },
];

export default function RiderDashboard() {
  const currentPosition = CurrentLocation();
  const [origin, setOrigin] = useState<string>(""); 
  const [ride, setRide] = useState<any>([]);
  const [pickupLatLong, setPickupLatLong] = useState<[number, number] | undefined>(
    currentPosition,
  );
  const [dropoffLatLong, setDropoffLatLong] = useState<[number, number] | undefined>(
    undefined,
  );
  const [dropoff, setDropoff] = useState<string>("");
  const [query, setQuery] = useState("");
  const [activeInput, setActiveInput] = useState<"origin" | "dropoff" | "">("");
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState("bike");
  const [isSearching, setIsSearching] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    async function fetchPlaces() {
      if (!query.trim()) {
        setPlaces([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=a0121d6c1eb34c91bc42b8698129a390`,
          { method: "GET" },
        );
        const data = await res.json();
        setPlaces(data.features ?? []);
      } finally {
        setIsSearching(false);
      }
    }
    const timer = setTimeout(fetchPlaces, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function NearestDriver() {
      try {
        if (!pickupLatLong) return;
        const [plng, plat] = pickupLatLong;
        if (!dropoffLatLong) return;
        const [dlng, dlat] = dropoffLatLong;
        console.log("lng==", plng, "lat==", plat);
        const resp = await fetch(
          `http://localhost:3000/api/users/driver/nearestdriver?pickup_long=${plng}&pickup_lat=${plat}&dropoff_long=${dlng}&dropoff_lat=${dlat}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!resp.ok) {
          console.log("resp==", resp);
          return;
        }
        const data = await resp.json();
        setRide(data);
        console.log("data==", data);
      } catch (error) {
        console.log("error", error);
      }
    }
    NearestDriver();
  }, [pickupLatLong, dropoffLatLong]);

  function selectPlace(formatted: string, lng: number, lat: number) {
    if (activeInput === "origin") {
      setOrigin(formatted);
      setPickupLatLong([lng, lat]);
    }
    if (activeInput === "dropoff") {
      setDropoff(formatted);
      setDropoffLatLong([lng, lat]);
    }
    setPlaces([]);
    setQuery("");
    setActiveInput("");
  }

  const bothFilled = origin.trim() && dropoff.trim();

  return (
    <div className="relative w-full h-screen font-[Inter,system-ui,sans-serif] overflow-hidden bg-[#0a0a0f] text-white">
      {/* ── Top Header Navigation ───────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg bg-transparent border-0 cursor-pointer"
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFD700] text-[#0a0a0f] flex items-center justify-center font-black">
              <BikeIcon size={18} />
            </div>
            <div className="leading-none">
              <span className="text-lg font-black tracking-tight text-white block">
                raahi
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/35 block">
                rider
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative p-1.5 text-white/70 hover:text-white transition-colors rounded-lg bg-transparent border-0 cursor-pointer"
            aria-label="Notifications"
          >
            <BellIcon />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#FFD700] text-[#0a0a0f] font-extrabold text-sm flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
            R
          </div>
        </div>
      </header>

      {/* ── Side Navigation Drawer ───────────────────────── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <nav
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col p-6 bg-[#111118] border-r border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700] text-[#0a0a0f] font-black text-xl flex items-center justify-center">
                R
              </div>
              <div>
                <p className="text-white font-extrabold text-base m-0">Rider</p>
                <p className="text-xs font-medium text-white/45 m-0">
                  Premium Member
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} filled size={12} />
                  ))}
                  <span className="text-xs font-bold text-[#FFD700] ml-0.5">
                    4.9
                  </span>
                </div>
              </div>
            </div>

            {[
              "Book a Ride",
              "Your Rides",
              "Saved Places",
              "Payments",
              "Safety Center",
              "Support",
              "Settings",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setShowMenu(false)}
                className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-left text-sm font-semibold transition-colors border-0 bg-transparent cursor-pointer mb-1 ${
                  item === "Book a Ride"
                    ? "text-[#FFD700] bg-white/[0.04]"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {item === "Book a Ride" && (
                  <span className="w-1.5 h-4 rounded-full bg-[#FFD700] -mr-1" />
                )}
                {item}
              </button>
            ))}

            <div className="mt-auto">
              <button className="w-full rounded-xl py-3 text-xs font-bold transition-colors bg-red-500/15 text-red-500 border border-red-500/25 cursor-pointer hover:bg-red-500/25">
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ── Full-screen Map Background ───────────────────── */}
      <div className="absolute inset-0 z-0">
        <LazyMap />
      </div>

      {/* ── Minimal Glass Booking Panel ──────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#111118]/90 backdrop-blur-2xl rounded-t-[28px] px-5 pt-4 pb-7 shadow-2xl border-t border-white/10 max-h-[78vh] overflow-y-auto">
        {/* Panel drag handle line */}
        <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-4" />

        {/* Panel Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-white/45 m-0">Good evening 👋</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white m-0">
              Where to?
            </h1>
          </div>
        </div>

        {/* Location Inputs Card */}
        <div className="flex items-stretch gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 mb-2.5">
          <div className="flex flex-col items-center justify-center pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] flex-shrink-0" />
            <div className="w-0.5 flex-1 min-h-[20px] my-1 bg-[repeating-linear-gradient(to_bottom,rgba(255,215,0,0.4)_0,rgba(255,215,0,0.4)_4px,transparent_4px,transparent_8px)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] flex-shrink-0" />
          </div>

          <div className="flex-1 flex flex-col gap-1">
            {/* Pickup Input */}
            <div className="relative">
              <input
                id="origin"
                type="text"
                placeholder="Pickup location"
                value={origin}
                className={`w-full bg-transparent border-0 text-sm font-medium text-white pr-7 py-1.5 rounded-lg focus:outline-none focus:bg-[#FFD700]/[0.06] transition-colors placeholder:text-white/35 font-inherit ${
                  activeInput === "origin" ? "bg-[#FFD700]/[0.06]" : ""
                }`}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOrigin(e.target.value);
                }}
                onFocus={() => {
                  setActiveInput("origin");
                  setQuery(origin);
                }}
              />
              {origin && (
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 hover:text-white p-1 cursor-pointer"
                  onClick={() => {
                    setOrigin("");
                    setQuery("");
                  }}
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>

            <div className="h-px bg-white/10 my-0.5" />

            {/* Dropoff Input */}
            <div className="relative">
              <input
                id="dropoff"
                type="text"
                placeholder="Where to? (Drop-off)"
                value={dropoff}
                className={`w-full bg-transparent border-0 text-sm font-medium text-white pr-7 py-1.5 rounded-lg focus:outline-none focus:bg-[#FFD700]/[0.06] transition-colors placeholder:text-white/35 font-inherit ${
                  activeInput === "dropoff" ? "bg-[#FFD700]/[0.06]" : ""
                }`}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDropoff(e.target.value);
                }}
                onFocus={() => {
                  setActiveInput("dropoff");
                  setQuery(dropoff);
                }}
              />
              {dropoff && (
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 hover:text-white p-1 cursor-pointer"
                  onClick={() => {
                    setDropoff("");
                    setQuery("");
                  }}
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick shortcut chips */}
        {!origin && !dropoff && (
          <div className="flex gap-2 mb-3.5 overflow-x-auto pb-1">
            <button
              className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
              onClick={() => {
                setActiveInput("origin");
                setOrigin("Current Location");
              }}
            >
              <LocationIcon size={13} />
              <span>Current Location</span>
            </button>
            <button
              className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
              onClick={() => {
                setActiveInput("dropoff");
                setDropoff("Koramangala 5th Block");
              }}
            >
              <span>🏠 Home</span>
            </button>
            <button
              className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
              onClick={() => {
                setActiveInput("dropoff");
                setDropoff("Indiranagar 100ft Road");
              }}
            >
              <span>💼 Office</span>
            </button>
          </div>
        )}

        {/* Autocomplete Suggestions */}
        {(places.length > 0 || isSearching) && (
          <div className="bg-[#161622] border border-white/10 rounded-2xl overflow-hidden mb-3.5 shadow-xl">
            {isSearching ? (
              <div className="flex items-center gap-2.5 p-3.5 text-[#FFD700] text-xs font-semibold">
                <div className="w-4 h-4 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
                <span>Searching locations…</span>
              </div>
            ) : (
              places.slice(0, 5).map((val: any, ind: number) => (
                <button
                  key={ind}
                  className="flex items-center gap-3 w-full text-left p-3 bg-transparent hover:bg-[#FFD700]/[0.08] transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                  onClick={() =>
                    selectPlace(
                      val?.properties?.formatted,
                      val?.properties?.lon,
                      val?.properties?.lat,
                    )
                  }
                >
                  <div className="text-[#FFD700] flex-shrink-0">
                    <LocationIcon size={15} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-white truncate block">
                      {val?.properties?.name || val?.properties?.street || val?.properties?.formatted}
                    </span>
                    <span className="text-xs text-white/45 font-normal truncate block">
                      {val?.properties?.formatted}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Ride Type Selector */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white/45 m-0">
              Choose a ride
            </p>
            <span className="text-[11px] font-semibold text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded-full">
              {ride && ride.length > 0 ? `${ride.length} available` : "Select route"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {(ride && ride.length > 0 ? ride : RIDE_TYPES).map((r: any, index: number) => {
              const rideId = r.driver_id ?? r.id ?? `ride-${index}`;
              const isSelected = selectedRide === rideId || (selectedRide === "bike" && index === 0);
              
              // Helper formatting
              const vehicleTypeRaw = r.vehicletype || r.label || "Bike";
              const vehicleLabel = vehicleTypeRaw.charAt(0).toUpperCase() + vehicleTypeRaw.slice(1);
              
              const icon = r.icon || (
                vehicleTypeRaw.toLowerCase().includes("auto") ? (
                  <TaxiIcon size={24} />
                ) : vehicleTypeRaw.toLowerCase().includes("cab") || vehicleTypeRaw.toLowerCase().includes("car") ? (
                  <CarIcon size={24} />
                ) : (
                  <BikeIcon size={24} />
                )
              );

              const formattedEta = typeof r.driver_eta_sec === "number"
                ? `${Math.ceil(r.driver_eta_sec / 60)} min away`
                : (r.eta || "3 min away");

              const formattedPrice = r.price
                ? (String(r.price).startsWith("₹") ? r.price : `₹${r.price}`)
                : "₹45";

              const tagText = r.tag || (index === 0 ? "Fastest" : index === 1 ? "Popular" : "Standard");

              return (
                <button
                  key={rideId}
                  id={`ride-${rideId}`}
                  className={`relative flex flex-col items-center p-3.5 pb-3 rounded-2xl transition-all duration-200 gap-1 border cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-[#FFD700] shadow-lg shadow-[#FFD700]/30 -translate-y-0.5 text-[#0a0a0f]"
                      : "bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.07]"
                  }`}
                  onClick={() => setSelectedRide(rideId)}
                >
                  <span
                    className={`absolute top-1.5 right-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-black/15 text-[#0a0a0f]"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {tagText}
                  </span>
                  <div className="my-1">{icon}</div>
                  <span
                    className={`text-sm font-extrabold ${
                      isSelected ? "text-[#0a0a0f]" : "text-white"
                    }`}
                  >
                    {vehicleLabel}
                  </span>
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      isSelected ? "text-[#0a0a0f]/75" : "text-white/45"
                    }`}
                  >
                    <ClockIcon size={11} /> {formattedEta}
                  </span>
                  <span
                    className={`text-base font-black mt-0.5 ${
                      isSelected ? "text-[#0a0a0f]" : "text-[#FFD700]"
                    }`}
                  >
                    {formattedPrice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Book CTA Button */}
        <button
          id="book-ride-btn"
          className={`w-full py-4 rounded-2xl font-extrabold text-base tracking-tight transition-all border-0 ${
            bothFilled
              ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] shadow-xl shadow-[#FFD700]/30 hover:brightness-105 active:scale-[0.99] cursor-pointer"
              : "bg-white/[0.06] text-white/25 border border-white/5 cursor-not-allowed"
          }`}
          disabled={!bothFilled}
        >
          {bothFilled
            ? `Book ${
                (() => {
                  const activeList = ride && ride.length > 0 ? ride : RIDE_TYPES;
                  const item = activeList.find((r: any, idx: number) => (r.driver_id ?? r.id ?? `ride-${idx}`) === selectedRide) || activeList[0];
                  const raw = item?.vehicletype || item?.label || "Ride";
                  return raw.charAt(0).toUpperCase() + raw.slice(1);
                })()
              } →`
            : "Enter pickup & drop-off to continue"}
        </button>
      </div>
    </div>
  );
}
