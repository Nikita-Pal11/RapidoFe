"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  BikeIcon,
  RupeeIcon,
  StarIcon,
  ClockIcon,
  NavIcon,
  PhoneIcon,
  CheckIcon,
  XIcon,
  TrendUpIcon,
  MenuIcon,
  BellIcon,
  LocationIcon,
} from "./icons";
import CurrentLocation from "@/app/components/Location/CurrentLocation";
// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/app/components/Location/Map"), {
  ssr: false,
});

/* ── Fake data ───────────────────────────────────────────── */
const MOCK_TRIPS = [
  {
    id: 1,
    from: "Koramangala 5th Block",
    to: "HSR Layout Sector 1",
    fare: 82,
    km: 4.2,
    time: "09:14 AM",
    status: "completed",
  },
  {
    id: 2,
    from: "Indiranagar 12th Main",
    to: "MG Road Metro Station",
    fare: 55,
    km: 2.8,
    time: "10:33 AM",
    status: "completed",
  },
  {
    id: 3,
    from: "Whitefield Gate",
    to: "Marathahalli Bridge",
    fare: 110,
    km: 5.7,
    time: "12:05 PM",
    status: "completed",
  },
  {
    id: 4,
    from: "BTM 2nd Stage",
    to: "Electronic City Phase 1",
    fare: 145,
    km: 7.4,
    time: "02:20 PM",
    status: "completed",
  },
];

const MOCK_RIDE_REQUEST = {
  rider: "Arjun S.",
  pickup: "Koramangala 4th Block",
  drop: "Silk Board Junction",
  distance: "3.2 km",
  eta: "4 min away",
  fare: 76,
  rating: 4.8,
};

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      className="rounded-2xl p-4 flex items-start gap-3 transition-all duration-200 hover:bg-white/[0.07]"
    >
      <div
        className="rounded-xl p-2.5 flex-shrink-0"
        style={{ background: `${accent}22` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p
          className="text-xs font-medium"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {label}
        </p>
        <p className="text-xl font-black text-white leading-tight tracking-tight">
          {value}
        </p>
        {sub && (
          <p
            className="text-xs mt-0.5 flex items-center gap-1"
            style={{ color: "#22c55e" }}
          >
            <TrendUpIcon />
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────── */
export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [rideTimer, setRideTimer] = useState(15);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "trips" | "earnings">(
    "map",
  );
  const currentlocation = CurrentLocation();
  const [currlocation, setcurrlocation] = useState<[number, number] | undefined>(undefined);

  // Sync currentlocation from geolocation hook
  useEffect(() => {
    if (currentlocation) {
      setcurrlocation(currentlocation);
    }
  }, [currentlocation]);

  // Simulate an incoming ride request when online
  useEffect(() => {
    if (!isOnline) {
      setShowRideRequest(false);
      setRideAccepted(false);
      return;
    }
    const t = setTimeout(() => setShowRideRequest(true), 4000);
    return () => clearTimeout(t);
  }, [isOnline]);

  // Countdown timer for ride request
  useEffect(() => {
    if (!showRideRequest || rideAccepted) return;
    if (rideTimer <= 0) {
      setShowRideRequest(false);
      setRideTimer(15);
      return;
    }
    const t = setInterval(() => setRideTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [showRideRequest, rideTimer, rideAccepted]);

  // Updated location send to backend when driver is online and location is available
  useEffect(() => {
    if (!currlocation || !isOnline) return;

    async function updateDriverLocation() {
      try {
        const resp = await fetch("/api/users/driver/currentlocationupdate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            curr_latitude: currlocation![0],
            curr_longitude: currlocation![1],
          }),
        });
        if (!resp.ok) {
          console.log("Location update resp==", resp);
          return;
        }
        const data = await resp.json();
        console.log("Location data==", data);
      } catch (error) {
        console.log("Location update error", error);
      }
    }
    updateDriverLocation();
  }, [currlocation, isOnline]);

  async function handleAccept() {
    setRideAccepted(true);
    try {
      const resp = await fetch("/api/users/driver/driverstatusupdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "on_ride",
        }),
      });
      const data = await resp.json();
      console.log("Status update (on_ride) data==", data);
    } catch (error) {
      console.log("Status update error", error);
    }
  }

  function handleDecline() {
    setShowRideRequest(false);
    setRideTimer(15);
  }
  async function handleGoOnline() {
    const nextOnlineState = !isOnline;
    const nextStatus = nextOnlineState ? "online" : "offline";
    setIsOnline(nextOnlineState);
    setRideTimer(15);
    setRideAccepted(false);

    try {
      const resp = await fetch("/api/users/driver/driverstatusupdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
      if (!resp.ok) {
        console.log("Status update resp==", resp);
        return;
      }
      const data = await resp.json();
      console.log("Status update data==", data);
    } catch (error) {
      console.log("Status update error", error);
    }
  }

  const todayEarnings = MOCK_TRIPS.reduce((s, t) => s + t.fare, 0);
  const circumference = 2 * Math.PI * 24;

  return (
    <div
      className="flex flex-col min-h-screen font-[Inter,system-ui,sans-serif]"
      style={{ background: "#0a0a0f" }}
    >
      {/* ── Top Nav ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(10,10,15,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#FFD700" }}
            >
              <BikeIcon />
            </div>
            <div className="leading-none">
              <span className="text-white font-black text-lg tracking-tight">
                raahi
              </span>
              <span
                className="block text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                captain
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Online/Offline pill toggle */}
          <button
            id="online-toggle"
            onClick={handleGoOnline}
            className="flex items-center gap-2 rounded-full px-4 py-2 font-bold text-sm transition-all duration-300"
            style={{
              background: isOnline
                ? "linear-gradient(135deg, #16a34a, #22c55e)"
                : "rgba(255,255,255,0.08)",
              color: isOnline ? "#fff" : "rgba(255,255,255,0.5)",
              boxShadow: isOnline ? "0 0 20px rgba(34,197,94,0.4)" : "none",
            }}
          >
            <span
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                background: isOnline ? "#fff" : "rgba(255,255,255,0.3)",
                boxShadow: isOnline ? "0 0 6px #fff" : "none",
              }}
            />
            {isOnline ? "Online" : "Offline"}
          </button>
          <button className="relative text-white/60 hover:text-white transition-colors">
            <BellIcon />
            {isOnline && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* ── Drawer Menu ─────────────────────────────────── */}
      {showMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)}>
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)" }}
          />
          <nav
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col p-6"
            style={{
              background: "#111118",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Driver profile */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
                style={{ background: "#FFD700", color: "#000" }}
              >
                R
              </div>
              <div>
                <p className="text-white font-bold text-base">Rahul M.</p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  MH12AB1234 · Bike
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} filled />
                  ))}
                  <StarIcon />
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#FFD700" }}
                  >
                    4.8
                  </span>
                </div>
              </div>
            </div>
            {[
              "Dashboard",
              "Earnings",
              "Trips",
              "Documents",
              "Support",
              "Settings",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-white/[0.06] mb-1"
                style={{
                  color:
                    item === "Dashboard" ? "#FFD700" : "rgba(255,255,255,0.6)",
                }}
              >
                {item === "Dashboard" && (
                  <span
                    className="w-1.5 h-5 rounded-full mr-1"
                    style={{ background: "#FFD700" }}
                  />
                )}
                {item}
              </button>
            ))}
            <div className="mt-auto">
              <button
                className="w-full rounded-xl py-3 text-sm font-bold transition-colors"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ── Status banner when offline ───────────────────── */}
      {!isOnline && (
        <div
          className="mx-4 mt-4 rounded-2xl p-4 text-center animate-[fadeSlideDown_0.6s_ease_both]"
          style={{
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          <p className="text-base font-black" style={{ color: "#FFD700" }}>
            You&apos;re offline
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Go online to start receiving ride requests
          </p>
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-3 px-4 mt-4">
        <StatCard
          label="Today's Earnings"
          value={`₹${todayEarnings}`}
          sub="+12% vs yesterday"
          icon={<RupeeIcon />}
          accent="#FFD700"
        />
        <StatCard
          label="Trips Done"
          value="4"
          sub="2 more than avg"
          icon={<BikeIcon />}
          accent="#a78bfa"
        />
        <StatCard
          label="Rating"
          value="4.8"
          icon={<StarIcon filled />}
          accent="#f59e0b"
        />
      </section>

      {/* ── Tab Bar ─────────────────────────────────────── */}
      <div
        className="flex mx-4 mt-5 rounded-2xl p-1 gap-1"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {(["map", "trips", "earnings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-xl py-2 text-sm font-bold capitalize transition-all duration-200"
            style={{
              background: activeTab === tab ? "#FFD700" : "transparent",
              color: activeTab === tab ? "#000" : "rgba(255,255,255,0.4)",
            }}
          >
            {tab === "map"
              ? "🗺 Map"
              : tab === "trips"
                ? "🏍 Trips"
                : "💰 Earnings"}
          </button>
        ))}
      </div>

      {/* ── Map Tab ─────────────────────────────────────── */}
      {activeTab === "map" && (
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden animate-[cardPop_0.5s_ease_both]"
          style={{ border: "1px solid rgba(255,215,0,0.15)", height: "280px" }}
        >
          <Map />
        </div>
      )}

      {/* ── Trips Tab ───────────────────────────────────── */}
      {activeTab === "trips" && (
        <div className="px-4 mt-4 flex flex-col gap-3 animate-[fadeSlideUp_0.7s_ease_both]">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Today&apos;s Trips
          </p>
          {MOCK_TRIPS.map((trip, i) => (
            <div
              key={trip.id}
              className="rounded-2xl p-4 transition-all hover:bg-white/[0.06]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "#FFD700", color: "#000" }}
                  >
                    {trip.id}
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      <ClockIcon /> {trip.time}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                      {trip.km} km
                    </p>
                  </div>
                </div>
                <span
                  className="text-base font-black"
                  style={{ color: "#FFD700" }}
                >
                  ₹{trip.fare}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-green-400" />
                  <span className="truncate">{trip.from}</span>
                </div>
                <div
                  className="w-px h-3 ml-1"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                />
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "#FFD700" }}
                  />
                  <span className="truncate">{trip.to}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Earnings Tab ────────────────────────────────── */}
      {activeTab === "earnings" && (
        <div className="px-4 mt-4 animate-[fadeSlideUp_0.7s_ease_both]">
          {/* Big earnings card */}
          <div
            className="rounded-3xl p-6 mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a1605 0%, #2d2408 100%)",
              border: "1px solid rgba(255,215,0,0.25)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl"
              style={{
                background: "#FFD700",
                transform: "translate(30%,-30%)",
              }}
            />
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(255,215,0,0.6)" }}
            >
              Today&apos;s Total
            </p>
            <p className="text-5xl font-black" style={{ color: "#FFD700" }}>
              ₹{todayEarnings}
            </p>
            <div
              className="mt-4 pt-4 grid grid-cols-3 gap-3"
              style={{ borderTop: "1px solid rgba(255,215,0,0.15)" }}
            >
              {[
                { l: "Trips", v: "4" },
                { l: "Distance", v: "20.1 km" },
                { l: "Incentive", v: "₹50" },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {l}
                  </p>
                  <p className="text-base font-black text-white">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly bar chart (CSS only) */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            This Week
          </p>
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-end justify-between gap-2 h-24">
              {[
                { d: "Mon", v: 380 },
                { d: "Tue", v: 520 },
                { d: "Wed", v: 290 },
                { d: "Thu", v: 640 },
                { d: "Fri", v: 480 },
                { d: "Sat", v: 710 },
                { d: "Sun", v: todayEarnings },
              ].map(({ d, v }) => {
                const maxV = 710;
                const pct = (v / maxV) * 100;
                const isToday = d === "Sun";
                return (
                  <div
                    key={d}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <div
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${pct}%`,
                        background: isToday
                          ? "#FFD700"
                          : "rgba(255,215,0,0.25)",
                        minHeight: "4px",
                      }}
                    />
                    <p
                      className="text-[10px] font-semibold"
                      style={{
                        color: isToday ? "#FFD700" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {d}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Spacer for bottom nav ───────────────────────── */}
      <div className="h-28" />

      {/* ── Ride Request Bottom Sheet ────────────────────── */}
      {showRideRequest && (
        <div
          className="fixed inset-0 z-40 flex items-end"
          style={{ pointerEvents: rideAccepted ? "none" : "auto" }}
        >
          {/* Scrim */}
          {!rideAccepted && (
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
            />
          )}

          <div
            className="relative w-full rounded-t-3xl p-5 pb-8 animate-[fadeSlideUp_0.4s_ease_both]"
            style={{
              background: "#111118",
              border: "1px solid rgba(255,215,0,0.2)",
              borderBottom: "none",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.7)",
            }}
          >
            {!rideAccepted ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "rgba(255,215,0,0.6)" }}
                    >
                      New Ride Request
                    </p>
                    <p className="text-xl font-black text-white">
                      {MOCK_RIDE_REQUEST.rider}
                    </p>
                  </div>
                  {/* Circular countdown timer */}
                  <div className="relative flex items-center justify-center">
                    <svg
                      width="56"
                      height="56"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="3"
                        strokeDasharray={`${(rideTimer / 15) * circumference} ${circumference}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1s linear" }}
                      />
                    </svg>
                    <span
                      className="absolute text-base font-black"
                      style={{ color: "#FFD700" }}
                    >
                      {rideTimer}
                    </span>
                  </div>
                </div>

                {/* Rider rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} filled />
                  ))}
                  <span
                    className="text-xs font-bold ml-1"
                    style={{ color: "#FFD700" }}
                  >
                    {MOCK_RIDE_REQUEST.rating}
                  </span>
                  <span
                    className="text-xs ml-1"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    · {MOCK_RIDE_REQUEST.eta}
                  </span>
                </div>

                {/* Route */}
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: "rgba(255,215,0,0.06)",
                    border: "1px solid rgba(255,215,0,0.15)",
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                      <span
                        className="w-3 h-3 rounded-full border-2"
                        style={{
                          borderColor: "#22c55e",
                          background: "#22c55e33",
                        }}
                      />
                      <span
                        className="flex-1 w-px min-h-[20px]"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: "#FFD700" }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div>
                        <p
                          className="text-[11px] font-semibold uppercase"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          Pickup
                        </p>
                        <p className="text-sm font-bold text-white truncate">
                          {MOCK_RIDE_REQUEST.pickup}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[11px] font-semibold uppercase"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          Drop
                        </p>
                        <p className="text-sm font-bold text-white truncate">
                          {MOCK_RIDE_REQUEST.drop}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-2xl font-black"
                        style={{ color: "#FFD700" }}
                      >
                        ₹{MOCK_RIDE_REQUEST.fare}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {MOCK_RIDE_REQUEST.distance}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    id="decline-ride"
                    onClick={handleDecline}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-200 hover:scale-[0.98]"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    <XIcon /> Decline
                  </button>
                  <button
                    id="accept-ride"
                    onClick={handleAccept}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-200 hover:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #d97706, #FFD700)",
                      color: "#000",
                      boxShadow: "0 8px 24px rgba(255,215,0,0.35)",
                    }}
                  >
                    <CheckIcon /> Accept Ride
                  </button>
                </div>
              </>
            ) : (
              /* Accepted State */
              <div className="text-center py-2 animate-[cardPop_0.5s_ease_both]">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    border: "2px solid #22c55e",
                  }}
                >
                  <CheckIcon />
                </div>
                <p className="text-xl font-black text-white mb-1">
                  Ride Accepted!
                </p>
                <p
                  className="text-sm mb-4"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Head to pickup point now
                </p>

                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Pickup
                  </p>
                  <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    <LocationIcon /> {MOCK_RIDE_REQUEST.pickup}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <PhoneIcon /> Call Rider
                  </button>
                  <button
                    className="flex-[2] flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, #d97706, #FFD700)",
                      color: "#000",
                    }}
                  >
                    <NavIcon /> Navigate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom Nav ──────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-3"
        style={{
          background: "rgba(10,10,15,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {[
          { icon: "🗺", label: "Map", tab: "map" as const },
          { icon: "🏍", label: "Trips", tab: "trips" as const },
          { icon: "💰", label: "Earnings", tab: "earnings" as const },
        ].map(({ icon, label, tab }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-all duration-200"
            style={{
              color: activeTab === tab ? "#FFD700" : "rgba(255,255,255,0.35)",
            }}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-bold">{label}</span>
            {activeTab === tab && (
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "#FFD700" }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
