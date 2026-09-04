"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, Button } from "@heroui/react";
import dynamic from "next/dynamic";
import { useSocket } from "@/app/context/socketcontext";
import CurrentLocation from "@/app/components/Location/CurrentLocation";

import { DriverTopNav } from "./DriverTopNav";
import { DriverSideMenu } from "./DriverSideMenu";
import { RideRequestSheet } from "./RideRequestSheet";
import { StatCard } from "./StatCard";
import { WeeklyEarningsGraph } from "./WeeklyEarningsGraph";
import { BikeIcon, RupeeIcon, StarIcon } from "./icons";
import { calculateDistanceKm } from "@/app/helper/distance";

const Map = dynamic(() => import("@/app/components/Location/Map"), {
  ssr: false,
});

interface TripItem {
  id: number;
  pickup_location?: string;
  drop_location?: string;
  pickup_lat?: number;
  pickup_long?: number;
  drop_lat?: number;
  drop_long?: number;
  fare?: number | string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

type Tab = "map" | "trips" | "earnings";

export default function DriverDashboard() {
  // ── UI state ────────────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(false);
  const [currlocation, setCurrlocation] = useState<[number, number] | undefined>(undefined);
  const [profile, setProfile] = useState<any>({});
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [showRideReq, setShowRideReq] = useState(false);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [rideTimer, setRideTimer] = useState(15);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [activeRideId, setActiveRideId] = useState<number | null>(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [rideAlertMessage, setRideAlertMessage] = useState<string | null>(null);
  
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

  // Fetch driver trips and profile
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingTrips(true);
      const [profileRes, tripsRes] = await Promise.all([
        fetch("/api/users/profile/"),
        fetch("/api/ride/alltrips"),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData);
        if (pData.status === "online") setIsOnline(true);
      }

      if (tripsRes.ok) {
        const tData = await tripsRes.json();
        setTrips(Array.isArray(tData) ? tData : []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Clear ride when payment is completed or ride is cancelled
  useEffect(() => {
    if (rideEvent?.status === "completed") {
      setActiveRideId(null);
      setRideAccepted(false);
      setShowRideReq(false);
      clearIncomingRide();
      fetchDashboardData();
    }
    if (rideEvent?.status === "canceled") {
      if (rideAccepted) {
        setShowCancellationModal(true);
      }
      setActiveRideId(null);
      setRideAccepted(false);
      setShowRideReq(false);
      clearIncomingRide();
      fetchDashboardData();
    }
  }, [rideEvent, rideAccepted, clearIncomingRide, fetchDashboardData]);

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
    const driverId = profile?.id;
    if (!driverId) return;
    const [lat, lng] = currlocation;
    const vehicleType = profile?.vehicle?.vehicle_type || "bike";
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
            vehicletype: profile?.vehicle?.vehicle_type || "bike",
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
    try {
      const resp = await fetch("/api/ride/RideReq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: activeRideId, action }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error("RideReq failed", data);
        setRideAlertMessage(
          data?.message || "This ride has already been accepted by another driver."
        );
        setRideAccepted(false);
        setShowRideReq(false);
        setRideTimer(15);
        setActiveRideId(null);
        clearIncomingRide();
        return;
      }
      if (action === "accepted") {
        setRideAccepted(true);
        connectLocationSocket(activeRideId);
      }
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

  // Active ride check on load
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

  // ── Calculated Real Metrics ─────────────────────────────────────────────────
  const today = new Date();
  const todayTrips = trips.filter((t) => {
    if (!t.created_at) return false;
    const d = new Date(t.created_at);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  const todayCompletedTrips = todayTrips.filter((t) => t.status === "completed");
  const totalCompletedTrips = trips.filter((t) => t.status === "completed").length;

  const todayEarnings = todayCompletedTrips.reduce((s, t) => s + (Number(t.fare) || 0), 0);
  const todayDistance = todayCompletedTrips.reduce((s, t) => {
    return s + calculateDistanceKm(t.pickup_lat, t.pickup_long, t.drop_lat, t.drop_long);
  }, 0);

  const driverRating = profile?.rating ? Number(profile.rating).toFixed(1) : "5.0";

  // Weekly performance graph from real data
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dayName = daysOfWeek[d.getDay()];
    const isToday = i === 6;

    const dayCompletedTrips = trips.filter((t) => {
      if (!t.created_at || t.status !== "completed") return false;
      const tDate = new Date(t.created_at);
      return (
        tDate.getDate() === d.getDate() &&
        tDate.getMonth() === d.getMonth() &&
        tDate.getFullYear() === d.getFullYear()
      );
    });

    const dayEarnings = dayCompletedTrips.reduce((s, t) => s + (Number(t.fare) || 0), 0);
    return { d: dayName, v: dayEarnings, isToday };
  });

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

      {/* ── Ride Already Taken Alert Banner ── */}
      {rideAlertMessage && (
        <div className="mx-4 mt-3 animate-[fadeSlideDown_0.4s_ease_both]">
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg">
            <span>⚠️ {rideAlertMessage}</span>
            <button
              onClick={() => setRideAlertMessage(null)}
              className="text-white/60 hover:text-white font-black text-sm ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
          sub={todayTrips.length > 0 ? `${todayCompletedTrips.length} completed` : "Today"}
          icon={<RupeeIcon />}
          accent="#FFD700"
        />
        <StatCard
          label="Trips"
          value={String(todayCompletedTrips.length)}
          sub={`${totalCompletedTrips} total`}
          icon={<BikeIcon size={20} />}
          accent="#a78bfa"
        />
        <StatCard
          label="Rating"
          value={driverRating}
          sub="Driver Score"
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
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 m-0 mb-1">
              Trip History Log
            </p>
            <span className="text-[10px] font-bold text-[#FFD700]">
              {trips.length} Total Rides
            </span>
          </div>

          {trips.length === 0 ? (
            <Card className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center text-2xl mb-3">
                🏍️
              </div>
              <p className="text-sm font-extrabold text-white m-0">No Trips Recorded Yet</p>
              <p className="text-xs text-white/40 mt-1 mb-0 max-w-xs">
                Go online to accept incoming ride requests and see your completed trips here.
              </p>
            </Card>
          ) : (
            trips.map((trip, i) => {
              const distanceKm = calculateDistanceKm(
                trip.pickup_lat,
                trip.pickup_long,
                trip.drop_lat,
                trip.drop_long
              );
              const formattedTime = trip.created_at
                ? new Date(trip.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Recent";

              const isCompleted = trip.status === "completed";
              const isCanceled = trip.status === "canceled";

              return (
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
                        <p className="text-xs font-extrabold text-white m-0">{formattedTime}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold text-white/40 m-0">
                            {distanceKm > 0 ? `${distanceKm} km` : "Trip"}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isCanceled
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {trip.status || "completed"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-base font-black text-[#FFD700]">
                      ₹{trip.fare || 0}
                    </span>
                  </div>

                  {/* Route addresses */}
                  <div className="flex flex-col gap-2 relative pl-4 border-l border-white/10 ml-4 py-0.5">
                    <div className="absolute -left-1 top-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="absolute -left-1 bottom-0.5 w-2 h-2 rounded-full bg-amber-500" />
                    <p className="text-xs font-semibold text-white/70 truncate m-0">
                      {trip.pickup_location || "Pickup Location"}
                    </p>
                    <p className="text-xs font-semibold text-white/70 truncate m-0">
                      {trip.drop_location || "Dropoff Location"}
                    </p>
                  </div>
                </Card>
              );
            })
          )}
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
                { label: "Trips Done", val: String(todayCompletedTrips.length) },
                { label: "Distance", val: `${todayDistance.toFixed(1)} km` },
                { label: "Total Fares", val: `₹${todayEarnings}` },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold text-white/40 m-0">{label}</p>
                  <p className="text-sm font-black text-white m-0">{val}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly bar chart visualization component */}
          <WeeklyEarningsGraph data={weeklyData} />
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
