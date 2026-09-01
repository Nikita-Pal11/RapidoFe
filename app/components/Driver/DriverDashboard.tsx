"use client";
import { useState, useEffect } from "react";
import { Card, Button } from "@heroui/react";
import dynamic from "next/dynamic";
import { useSocket } from "@/app/context/socketcontext";
import CurrentLocation from "@/app/components/Location/CurrentLocation";

import { DriverTopNav } from "./DriverTopNav";
import { DriverSideMenu } from "./DriverSideMenu";
import { RideRequestSheet } from "./RideRequestSheet";
import { StatCard } from "./StatCard";
import { BikeIcon, RupeeIcon, StarIcon } from "./icons";

const Map = dynamic(() => import("@/app/components/Location/Map"), {
  ssr: false,
});

// Trip history data
const MOCK_TRIPS = [
  { id: 1, from: "Koramangala 5th Block", to: "HSR Layout Sector 1", fare: 82, km: 4.2, time: "09:14 AM" },
  { id: 2, from: "Indiranagar 12th Main", to: "MG Road Metro Station", fare: 55, km: 2.8, time: "10:33 AM" },
  { id: 3, from: "Whitefield Gate", to: "Marathahalli Bridge", fare: 110, km: 5.7, time: "12:05 PM" },
  { id: 4, from: "BTM 2nd Stage", to: "Electronic City Phase 1", fare: 145, km: 7.4, time: "02:20 PM" },
];

type Tab = "map" | "trips" | "earnings";

export default function DriverDashboard() {
  // ── UI state ────────────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(false);
  const [profile, setprofile] = useState({});
  const [showRideReq, setShowRideReq] = useState(false);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [rideTimer, setRideTimer] = useState(15);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [activeRideId, setActiveRideId] = useState<number | null>(null);
  const [currlocation, setCurrlocation] = useState<[number, number] | undefined>(undefined);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  
  // ── Hooks ───────────────────────────────────────────────────────────────────
  const rawLocation = CurrentLocation();
  const {
    connectDriverSocket,
    disconnectDriverSocket,
    incomingRideRequest,
    setIncomingRideRequest,
    clearIncomingRide,
    sendDriverLocation,
    connectLocationSocket,
    connectRideSocket,
    disconnectRideSocket,
    rideEvent,
  } = useSocket();

  // Sync geo location
  useEffect(() => {
    if (rawLocation) setCurrlocation(rawLocation);
  }, [rawLocation]);

  // Connect / disconnect driver WS on online toggle
  useEffect(() => {
    if (isOnline) {
      connectDriverSocket();
    } else {
      disconnectDriverSocket();
      setShowRideReq(false);
      setRideAccepted(false);
      setActiveRideId(null);
    }
    return () => disconnectDriverSocket();
  }, [isOnline]);

  // Show ride sheet when socket fires
  useEffect(() => {
    if (!incomingRideRequest) return;
    setActiveRideId(incomingRideRequest.ride_id);
    setRideTimer(incomingRideRequest.timeout_seconds ?? 15);
    setShowRideReq(true);
    setRideAccepted(false);
  }, [incomingRideRequest]);

  // Connect / disconnect ride status socket for driver
  useEffect(() => {
    if (activeRideId) {
      connectRideSocket(activeRideId);
    } else {
      disconnectRideSocket();
    }
  }, [activeRideId, connectRideSocket, disconnectRideSocket]);

  // Clear ride when payment is completed or ride is cancelled
  useEffect(() => {
    if (rideEvent?.status === "completed") {
      setActiveRideId(null);
      setRideAccepted(false);
      setShowRideReq(false);
      clearIncomingRide();
    }
    if (rideEvent?.status === "canceled") {
      if (rideAccepted) {
        setShowCancellationModal(true);
      }
      setActiveRideId(null);
      setRideAccepted(false);
      setShowRideReq(false);
      clearIncomingRide();
    }
  }, [rideEvent, rideAccepted, clearIncomingRide]);

  // Countdown — auto-dismiss on timeout
  useEffect(() => {
    if (!showRideReq || rideAccepted) return;
    if (rideTimer <= 0) {
      setShowRideReq(false);
      setRideTimer(15);
      clearIncomingRide();
      return;
    }
    const t = setInterval(() => setRideTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [showRideReq, rideTimer, rideAccepted]);

  // Stream GPS via LocationConsumer while on a ride
  useEffect(() => {
    if (!currlocation || !isOnline || !activeRideId || !profile) return;
    const driverId = (profile as any).id;
    if (!driverId) return; // Wait until profile.id is fetched and valid
    const [lat, lng] = currlocation;
    const vehicleType = (profile as any).vehicle?.vehicle_type || "bike";
    sendDriverLocation(activeRideId, lat, lng, driverId, vehicleType);
  }, [currlocation, isOnline, activeRideId, profile]);

  // current-location sync endpoint (periodic + on coordinate update)
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
            vehicletype: (profile as any)?.vehicle?.vehicle_type || "bike",
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

    // Call immediately on mount / coordinate update
    updateDriverLocation();

    // Call periodically every 5 seconds while online
    const interval = setInterval(updateDriverLocation, 5000);

    return () => clearInterval(interval);
  }, [currlocation, isOnline, profile]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleRideAction(action: "accepted" | "reject") {
    if (!activeRideId) return;
    setRideAccepted(action === "accepted");
    try {
      const resp = await fetch("/api/ride/RideReq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: activeRideId, action }),
      });
      if (!resp.ok) {
        console.error("RideReq failed", await resp.json());
        return;
      }
      if (action === "accepted") connectLocationSocket(activeRideId);
    } catch (err) {
      console.error("RideReq error", err);
    } finally {
      if (action === "reject") {
        setShowRideReq(false);
        setRideTimer(15);
        setActiveRideId(null);
        clearIncomingRide();
      }
    }
  }

  async function handleGoOnline() {
    const next = !isOnline;
    setIsOnline(next);
    setRideTimer(15);
    setRideAccepted(false);
    try {
      await fetch("/api/users/driver/driverstatusupdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next ? "online" : "offline" }),
      });
    } catch (err) {
      console.error("Status update error", err);
    }
  }

  useEffect(() => {
    async function getprofile() {
      const resp = await fetch("api/users/profile");
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        console.error("Error fetching profile:", resp.status, errData);
        return;
      }
      const data = await resp.json();
      console.log("data", data);
      if (data.status === "online") setIsOnline(true);
      setprofile(data);
    }
    getprofile();
  }, []);

  const todayEarnings = MOCK_TRIPS.reduce((s, t) => s + t.fare, 0);

  //active ride
  useEffect(() => {
    async function getRideDetails() {
      try {
        const resp = await fetch(`/api/ride/ridebooking`);
        if (!resp.ok) {
          console.error("Failed to fetch ride details:", resp.status);
          return;
        }
        const data = await resp.json();
        if (data.active && data.ride) {
          setActiveRideId(data.ride.id);
          setRideAccepted(true);
          setShowRideReq(true);
          setIsOnline(true);
          connectLocationSocket(data.ride.id);
        }
      } catch (err) {
        console.error("Error fetching ride details:", err);
      } 
    }
    getRideDetails();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-[Inter,system-ui,sans-serif] bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ── Top Nav ── */}
      <DriverTopNav
        isOnline={isOnline}
        onMenuToggle={() => setShowMenu((v) => !v)}
        onGoOnline={handleGoOnline}
      />

      {/* ── Side Menu ── */}
      {showMenu && <DriverSideMenu onClose={() => setShowMenu(false)} />}

      {/* ── Offline Banner Card ── */}
      {!isOnline && (
        <div className="mx-4 mt-4 animate-[fadeSlideDown_0.6s_ease_both]">
          <Card className="bg-amber-500/[0.04] border border-amber-500/15 p-4 text-center rounded-2xl shadow-xl shadow-amber-500/[0.02]">
            <p className="text-sm font-extrabold text-[#FFD700] uppercase tracking-wider m-0">
              You are offline
            </p>
            <p className="text-xs text-white/45 font-medium mt-1 mb-0">
              Go online using the toggle switch at the top to start accepting rider requests.
            </p>
          </Card>
        </div>
      )}

      {/* ── Stats Row ── */}
      <section className="grid grid-cols-3 gap-3 px-4 mt-4">
        <StatCard
          label="Earnings"
          value={`₹${todayEarnings}`}
          sub="+12% today"
          icon={<RupeeIcon />}
          accent="#FFD700"
        />
        <StatCard
          label="Trips"
          value="4"
          sub="2 avg"
          icon={<BikeIcon size={20} />}
          accent="#a78bfa"
        />
        <StatCard
          label="Rating"
          value="4.8"
          icon={<StarIcon filled />}
          accent="#f59e0b"
        />
      </section>

      {/* ── Tabs Selector ── */}
      <div className="flex mx-4 mt-5 rounded-2xl p-1 gap-1 bg-white/[0.04] border border-white/5 shadow-inner">
        {(["map", "trips", "earnings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-black capitalize transition-all duration-200 cursor-pointer border-0 ${
              activeTab === tab 
                ? "bg-[#FFD700] text-[#0a0a0f] shadow-lg shadow-[#FFD700]/15" 
                : "bg-transparent text-white/40 hover:text-white"
            }`}
          >
            {tab === "map" ? "🗺️ Live Map" : tab === "trips" ? "🏍️ Today's Trips" : "💰 Earnings"}
          </button>
        ))}
      </div>

      {/* ── Tab Content: Map ── */}
      {activeTab === "map" && (
        <div className="mx-4 mt-4 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 h-[300px] animate-[cardPop_0.5s_ease_both]">
          <Map driverlocation={[incomingRideRequest?.pickup_lat, incomingRideRequest?.pickup_long]} />
        </div>
      )}

      {/* ── Tab Content: Trips ── */}
      {activeTab === "trips" && (
        <div className="px-4 mt-4 flex flex-col gap-3 animate-[fadeSlideUp_0.4s_ease_both]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 m-0 mb-1">
            Trip History Log
          </p>
          {MOCK_TRIPS.map((trip, i) => (
            <Card
              key={trip.id}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.04] shadow-md flex flex-col gap-3"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black bg-[#FFD700] text-black shadow-md shadow-[#FFD700]/10">
                    #{trip.id}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white m-0">{trip.time}</p>
                    <p className="text-[10px] font-semibold text-white/40 m-0">{trip.km} km distance</p>
                  </div>
                </div>
                <span className="text-base font-black text-[#FFD700]">
                  ₹{trip.fare}
                </span>
              </div>

              {/* Route addresses */}
              <div className="flex flex-col gap-2 relative pl-4 border-l border-white/10 ml-4 py-0.5">
                <div className="absolute -left-1 top-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                <div className="absolute -left-1 bottom-0.5 w-2 h-2 rounded-full bg-amber-500" />
                <p className="text-xs font-semibold text-white/70 truncate m-0">{trip.from}</p>
                <p className="text-xs font-semibold text-white/70 truncate m-0">{trip.to}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Tab Content: Earnings ── */}
      {activeTab === "earnings" && (
        <div className="px-4 mt-4 animate-[fadeSlideUp_0.4s_ease_both] flex flex-col gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border border-yellow-500/20 p-6 rounded-3xl relative overflow-hidden shadow-xl shadow-yellow-500/5">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#FFD700]/10 opacity-15 blur-3xl translate-x-12 -translate-y-12" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200/60 mb-2">
              Today&apos;s Gross Earnings
            </p>
            <p className="text-5xl font-black text-[#FFD700] leading-none m-0">
              ₹{todayEarnings}
            </p>
            <div className="mt-5 pt-4 grid grid-cols-3 gap-3 border-t border-yellow-500/10">
              {[
                { label: "Trips Done", val: "4" },
                { label: "Distance", val: "20.1 km" },
                { label: "Bonus Pay", val: "₹50" },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold text-white/40 m-0">{label}</p>
                  <p className="text-sm font-black text-white m-0">{val}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly bar chart visualization */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 m-0">
              Weekly Performance Graph
            </p>
            <Card className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-md">
              <div className="flex items-end justify-between gap-2.5 h-28 pt-2">
                {[
                  { d: "Mon", v: 380 },
                  { d: "Tue", v: 520 },
                  { d: "Wed", v: 290 },
                  { d: "Thu", v: 640 },
                  { d: "Fri", v: 480 },
                  { d: "Sat", v: 710 },
                  { d: "Sun", v: todayEarnings },
                ].map(({ d, v }) => {
                  const pct = (v / 710) * 100;
                  const isToday = d === "Sun";
                  return (
                    <div key={d} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                      <div
                        className="w-full rounded-t-md transition-all duration-500 min-h-[4px]"
                        style={{
                          height: `${pct}%`,
                          background: isToday ? "#FFD700" : "rgba(255,215,0,0.15)",
                          boxShadow: isToday ? "0 0 12px rgba(255,215,0,0.25)" : "none",
                        }}
                      />
                      <p className={`text-[10px] font-extrabold m-0 ${isToday ? "text-[#FFD700]" : "text-white/30"}`}>
                        {d}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div className="h-28" />

      {/* ── Ride Request Bottom Sheet ── */}
      {showRideReq && (
        <RideRequestSheet
          incomingRideRequest={incomingRideRequest}
          activeRideId={activeRideId}
          rideTimer={rideTimer}
          rideAccepted={rideAccepted}
          onAction={handleRideAction}
        />
      )}

      {/* ── Ride Cancellation Modal ── */}
      {showCancellationModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease_both]">
          <div className="w-full max-w-sm bg-[#111118] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-5 animate-[cardPop_0.3s_ease_both]">
            {/* Visual pulsing cross badge */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-xl shadow-rose-500/10">
              <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-ping opacity-25" />
              <svg
                className="w-9 h-9 text-rose-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-black text-white m-0">
                Ride Cancelled by Rider
              </h3>
              <p className="text-xs text-white/50 font-medium leading-relaxed m-0">
                The rider cancelled this ride request. You are online and ready to receive new ride requests.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full font-extrabold text-sm bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] shadow-lg shadow-[#FFD700]/25 hover:brightness-105 rounded-2xl py-4 transition-all active:scale-[0.99] cursor-pointer"
              onPress={() => setShowCancellationModal(false)}
            >
              Back to Map
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
