"use client";
import React, { useState,useEffect } from "react";
import { Card, Button, Chip } from "@heroui/react";
import { StarIcon, CheckIcon, XIcon, PhoneIcon, NavIcon, LocationIcon } from "./icons";
import { NewRideRequestEvent } from "@/app/context/type";
import { useSocket } from "@/app/context/socketcontext";

interface RideRequestSheetProps {
  incomingRideRequest: NewRideRequestEvent | null;
  activeRideId: number | null;
  rideTimer: number;
  rideAccepted: boolean;
  onAction: (action: "accepted" | "reject") => void;
}

export function RideRequestSheet({
  incomingRideRequest,
  activeRideId,
  rideTimer,
  rideAccepted,
  onAction,
}: RideRequestSheetProps) {
  const { rideEvent } = useSocket();
  const [dbStatus, setDbStatus] = useState<string>("accepted");
  const [otpValue, setOtpValue] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle");
  const [rideStarted, setRideStarted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      const id = incomingRideRequest?.ride_id ?? activeRideId;
      if (!id) return;
      try {
        const resp = await fetch("/api/ride/ridebooking");
        if (resp.ok) {
          const data = await resp.json();
          if (data.ride && data.ride.id === id) {
            setDbStatus(data.ride.status);
            if (data.ride.status === "started") {
              setRideStarted(true);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkStatus();
  }, [activeRideId, incomingRideRequest]);

 useEffect(() => {
    if (rideEvent?.status) {
      setDbStatus(rideEvent.status);
      if (rideEvent.status === "started") {
        setRideStarted(true);
      }
    }
  }, [rideEvent]);

  const handleUpdateStatus = async (newStatus: string) => {
    const id = incomingRideRequest?.ride_id ?? activeRideId;
    if (!id) return;
    try {
      const resp = await fetch("/api/ride/ride-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: id,
          status: newStatus,
        }),
      });
      if (resp.ok) {
        setDbStatus(newStatus)
      } else {
        console.error("Failed to update status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const circumference = 2 * Math.PI * 24;
  const totalSeconds = incomingRideRequest?.timeout_seconds ?? 15;

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 4) return;
    setVerifyStatus("verifying");
    try {
      const resp = await fetch("/api/ride/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: incomingRideRequest?.ride_id ?? activeRideId,
          otp: otpValue,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setVerifyStatus("error");
        setTimeout(() => setVerifyStatus("idle"), 2000);
        return;
      }
      setVerifyStatus("verified");
      setRideStarted(true);
    } catch {
      setVerifyStatus("error");
      setTimeout(() => setVerifyStatus("idle"), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end pointer-events-none"
    >
      {/* Scrim: only show if incoming request and not collapsed */}
      {!rideAccepted && !isCollapsed && (
        <div 
          onClick={() => setIsCollapsed(true)}
          className="absolute inset-0 bg-black/60 backdrop-blur-[4px] pointer-events-auto transition-opacity duration-300"
        />
      )}

      {/* Main Sheet Container with smooth transition */}
      <div 
        className={`relative w-full bg-[#111118]/95 backdrop-blur-2xl rounded-t-[32px] p-5 border-t border-white/10 shadow-2xl transition-all duration-300 ease-in-out pointer-events-auto ${
          isCollapsed ? "max-h-[88px] pb-3 overflow-hidden cursor-pointer" : "max-h-[85vh] pb-8 overflow-y-auto"
        }`}
        onClick={() => {
          if (isCollapsed) setIsCollapsed(false);
        }}
      >
        {/* Panel drag handle & toggle bar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="w-full flex flex-col items-center justify-center py-1 -mt-2 mb-2 cursor-pointer group focus:outline-none"
          aria-label={isCollapsed ? "Expand sheet" : "Collapse sheet"}
        >
          <div className="w-10 h-1.5 rounded-full bg-white/25 group-hover:bg-[#FFD700] transition-colors" />
          <span className="text-[10px] font-bold text-white/40 group-hover:text-[#FFD700] transition-colors mt-1 flex items-center gap-1">
            {isCollapsed ? "▲ Expand Panel (View Details)" : "▼ Minimize Panel (View Map)"}
          </span>
        </button>

        {!rideAccepted ? (
          /* ── 1. Ride Pending / Incoming Request State ── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <Chip
                  size="sm"
                  color="warning"
                  variant="soft"
                  className="font-extrabold uppercase text-[9px] mb-1"
                >
                  Incoming Request
                </Chip>
                <h2 className="text-xl font-black text-white m-0">
                  Rider #{incomingRideRequest?.ride_id ?? activeRideId}
                </h2>
              </div>

              {/* Circular countdown */}
              <div className="relative flex items-center justify-center">
                <svg width="56" height="56" className="-rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="3"
                    strokeDasharray={`${(rideTimer / totalSeconds) * circumference} ${circumference}`}
                    strokeLinecap="round"
                    className="transition-[stroke-dasharray] duration-1000 linear"
                  />
                </svg>
                <span className="absolute text-base font-black text-[#FFD700]">
                  {rideTimer}
                </span>
              </div>
            </div>

            {/* Rider rating */}
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} filled size={13} />
              ))}
              <span className="text-xs font-bold text-[#FFD700] ml-1">4.8</span>
              <span className="text-xs text-white/35 ml-1">· 1.2 km away</span>
            </div>

            {/* Route card */}
            <Card className="bg-white/[0.03] border-white/5 p-4 mb-4 rounded-2xl flex flex-row justify-between items-start gap-4">
              <div className="flex gap-3 flex-1 min-w-0">
                {/* Route dot line */}
                <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="flex-1 w-px min-h-[24px] bg-[repeating-linear-gradient(to_bottom,rgba(255,215,0,0.4)_0,rgba(255,215,0,0.4)_4px,transparent_4px,transparent_8px)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                </div>

                {/* Pickup / Drop */}
                <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/35 uppercase m-0">
                      Pickup
                    </p>
                    <p className="text-sm font-extrabold text-white truncate m-0">
                      {incomingRideRequest?.pickup_location ?? "—"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/35 uppercase m-0">
                      Destination
                    </p>
                    <p className="text-sm font-extrabold text-white truncate m-0">
                      {incomingRideRequest?.dropoff_location ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fare Info */}
              <div className="text-right flex-shrink-0 flex flex-col items-end">
                <span className="text-2xl font-black text-[#FFD700] tracking-tight leading-none">
                  ₹{incomingRideRequest?.fare ?? "—"}
                </span>
                <span className="text-[10px] text-white/40 mt-1 font-semibold">
                  Cash Trip
                </span>
              </div>
            </Card>

            {/* Accept / Decline CTA Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-red-500 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 font-extrabold rounded-2xl py-6 cursor-pointer"
                onPress={() => onAction("reject")}
              >
                <XIcon size={16} /> Decline
              </Button>
              <Button
                className="flex-[2] bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black shadow-xl shadow-yellow-500/20 rounded-2xl py-6 cursor-pointer"
                onPress={() => onAction("accepted")}
              >
                <CheckIcon size={16} /> Accept Request
              </Button>
            </div>
          </>
        ) : (
          /* ── 2. Ride Accepted & In-Progress Controller State (UI ONLY) ── */
          <div className="flex flex-col gap-4 text-left animate-[fadeSlideUp_0.5s_ease_both]">
            {/* Header chip and state progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider m-0">
                  {rideStarted ? "Ride in progress" : "Heading to Pickup Spot"}
                </p>
              </div>
              <Chip
                size="sm"
                variant="soft"
                color="warning"
                className="font-extrabold uppercase text-[9px]"
              >
                {rideStarted ? "Started" : "Accepted"}
              </Chip>
            </div>

            {/* Rider Details Card */}
            <Card className="bg-white/[0.03] border-white/5 p-4 rounded-2xl flex flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-black font-black text-xl flex items-center justify-center flex-shrink-0">
                R
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-extrabold text-white block">
                  Rider #{incomingRideRequest?.ride_id ?? activeRideId}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarIcon size={11} filled />
                  <span className="text-[11px] font-bold text-[#FFD700]">
                    4.8 Rating
                  </span>
                </div>
              </div>
              <Button
                isIconOnly
                variant="danger-soft"
                className="rounded-xl w-10 h-10 border border-warning/10 cursor-pointer"
              >
                <PhoneIcon size={14} />
              </Button>
            </Card>

            {/* Stage Info progress */}
            <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-white/35 uppercase m-0">
                {rideStarted ? "Destination Address" : "Pickup Point Address"}
              </p>
              <p className="text-sm font-extrabold text-white truncate m-0">
                {rideStarted
                  ? (incomingRideRequest?.dropoff_location ?? "—")
                  : (incomingRideRequest?.pickup_location ?? "—")}
              </p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-[#FFD700] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${rideStarted ? 65 : 25}%` }}
                />
              </div>
            </div>

            {/* OTP Input section (visible when arriving at pickup, before starting ride) */}
            {!rideStarted && (
              <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 font-extrabold">
                    Enter Rider 4-digit OTP
                  </span>
                  {verifyStatus === "error" && (
                    <span className="text-xs text-red-500 font-bold">
                      Invalid OTP!
                    </span>
                  )}
                  {verifyStatus === "verified" && (
                    <span className="text-xs text-green-500 font-bold">
                      Verified!
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    name="otp"
                    maxLength={4}
                    placeholder="Enter 4-Digit OTP"
                    value={otpValue}
                    onChange={(event) => setOtpValue(event.target.value)}
                    className="max-w-[200px] w-full text-center font-mono font-black text-lg tracking-widest text-white placeholder:text-white/20 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.06] border border-white/15 focus:border-[#FFD700] rounded-xl py-2 px-3 outline-none transition-all"
                  />
                  <Button
                    className="flex-1 font-extrabold rounded-xl cursor-pointer bg-[#FFD700] text-black hover:bg-[#FFE033] active:bg-[#E6C200] disabled:opacity-50"
                    onPress={handleVerifyOtp}
                    isPending={verifyStatus === "verifying"}
                    isDisabled={dbStatus==="accepted"}
                  >
                    {verifyStatus === "verifying" ? "Starting..." : "Start Ride"}
                  </Button>
                </div>
              </div>
            )}

            {/* Main morphing CTA button */}
            {dbStatus === "accepted" ? (
              <Button
                onPress={() => handleUpdateStatus("driver_arrived")}
                className="w-full py-6 font-extrabold rounded-2xl shadow-xl transition-all cursor-pointer bg-white/[0.06] border border-white/10 text-white hover:bg-white/[0.1] active:scale-[0.99]"
              >
                Arrived at Pickup Spot
              </Button>
            ) : dbStatus === "driver_arrived" ? (
              <Button
                isDisabled
                className="w-full py-6 font-extrabold rounded-2xl shadow-xl transition-all cursor-not-allowed bg-white/[0.04] border border-white/5 text-white/40"
              >
                Waiting for OTP Verification...
              </Button>
            ) : dbStatus === "started" ? (
              <Button
                onPress={() => handleUpdateStatus("payment_pending")}
                className="w-full py-6 font-extrabold rounded-2xl shadow-xl transition-all cursor-pointer bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/30 text-red-500 shadow-red-500/5 hover:brightness-105 active:scale-[0.99]"
              >
                End & Complete Trip
              </Button>
            ) : dbStatus === "payment_pending" ? (
              <Button
                isDisabled
                className="w-full py-6 font-extrabold rounded-2xl shadow-xl transition-all cursor-not-allowed bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] animate-pulse"
              >
                Waiting for Rider Payment...
              </Button>
            ) : (
              <Button
                isDisabled
                className="w-full py-6 font-extrabold rounded-2xl shadow-xl transition-all cursor-not-allowed bg-white/[0.04] border border-white/5 text-white/40"
              >
                Trip Finished
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
