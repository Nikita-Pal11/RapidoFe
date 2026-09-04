"use client";
import React, { useState } from "react";
import { Card, Button, Chip } from "@heroui/react";
import { StarIcon, PhoneIcon } from "../Driver/icons";

interface RideAcceptedProps {
  rideinfo: any;
  ridestatus: string;
  onReset?: () => void;
}

export default function RideAccepted({ rideinfo, ridestatus, onReset }: RideAcceptedProps) {
  const ride = rideinfo;
  const [isCancelling, setIsCancelling] = useState(false);

  async function cancleride() {
    if (!ride?.id) return;
    setIsCancelling(true);
    try {
      const resp = await fetch("/api/ride/ridebooking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: ride.id }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error("Error in deleting ride:", data);
      }
    } catch (err) {
      console.error("Error cancelling ride:", err);
    } finally {
      setIsCancelling(false);
    }
  }

  // ── No Drivers Screen ────────────────────────────────────────────────────────
  if (ridestatus === "no_drivers") {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-5 text-center animate-[fadeSlideUp_0.4s_ease_both]">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-25" />
          <svg
            className="w-9 h-9 text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>

        <div className="flex flex-col gap-1.5 max-w-sm">
          <h3 className="text-xl font-black tracking-tight text-white m-0">
            No Drivers Found
          </h3>
          <p className="text-xs text-white/50 font-medium leading-relaxed m-0">
            All nearby drivers are currently busy or offline. Try selecting a different vehicle category or try searching again.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2 mt-1">
          <Button
            size="lg"
            className="w-full font-extrabold text-sm bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] border-0 rounded-2xl py-4 transition-all active:scale-[0.99] cursor-pointer shadow-xl shadow-[#FFD700]/20"
            onPress={() => {
              if (onReset) {
                onReset();
              } else {
                window.location.reload();
              }
            }}
          >
            🔄 Try Booking Again / Change Ride
          </Button>
        </div>
      </div>
    );
  }

  // ── Cancelled Screen ────────────────────────────────────────────────────────
  if (ridestatus === "canceled") {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-5 text-center animate-[fadeSlideUp_0.4s_ease_both]">
        {/* Visual glowing ripple wrapper around cancel icon */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-2xl shadow-rose-500/10">
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

        <div className="flex flex-col gap-1.5 max-w-sm">
          <h3 className="text-xl font-black tracking-tight text-white m-0">
            Ride Cancelled
          </h3>
          <p className="text-xs text-white/50 font-medium leading-relaxed m-0">
            This ride request was cancelled. No cancellation fee has been charged.
          </p>
        </div>

        <Button
          size="lg"
          className="w-full mt-2 font-extrabold text-sm bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 rounded-2xl py-4 transition-all active:scale-[0.99] cursor-pointer shadow-lg"
          onPress={() => {
            if (onReset) {
              onReset();
            } else {
              window.location.reload();
            }
          }}
        >
          Book Another Ride
        </Button>
      </div>
    );
  }

  if (!ride || !ride.driver) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
        <p className="text-sm font-semibold text-white/70">Ride Details Not Found</p>
        <p className="text-xs text-white/40">The driver information could not be retrieved.</p>
        <Button size="sm" variant="danger" className="mt-2" onPress={() => window.location.reload()}>
          Go Back
        </Button>
      </div>
    );
  }

  const driver = ride.driver;
  const vehicle = driver.vehicle;
  const username = driver.user?.username || "Driver";
  const firstName = driver.user?.first_name || username;
  const lastName = driver.user?.last_name || "";
  const driverName = `${firstName} ${lastName}`.trim();

  return (
    <div className="flex flex-col gap-2.5 text-white animate-[fadeSlideUp_0.3s_ease_both] pb-1">
      {/* Top Header: Live Status + High Contrast Plate Badge */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
            {ridestatus === "driver_arrived"
              ? "Driver Reached"
              : ridestatus === "started"
                ? "Ride Started"
                : "Driver Arriving"}
          </span>
        </div>
        <div className="bg-[#FFD700] text-[#0a0a0f] font-black px-2.5 py-0.5 rounded-lg text-xs font-mono tracking-wider shadow">
          {vehicle?.vehicle_number || "NO PLATE"}
        </div>
      </div>

      {/* Driver & Vehicle Info Row */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-2.5 rounded-xl gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-[#FFD700] text-[#0a0a0f] font-black text-lg flex items-center justify-center flex-shrink-0 shadow">
          {firstName.charAt(0).toUpperCase()}
        </div>

        {/* Driver & Vehicle Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white truncate">{driverName}</span>
            <div className="flex items-center gap-0.5 bg-[#FFD700]/10 px-1 py-0.2 rounded text-[9px] font-bold text-[#FFD700]">
              <StarIcon size={9} filled />
              <span>4.9</span>
            </div>
          </div>
          <span className="text-[11px] text-white/50 font-semibold truncate capitalize">
            {vehicle?.color || "White"} • {vehicle?.vehicle_type || "Ride"}
          </span>
        </div>

        {/* Call Button */}
        <Button
          isIconOnly
          size="sm"
          variant="danger-soft"
          className="rounded-xl w-9 h-9 border border-amber-500/20 cursor-pointer flex-shrink-0"
          aria-label="Call Driver"
        >
          <PhoneIcon size={14} />
        </Button>
      </div>

      {/* Pickup & Dropoff Address Preview */}
      {(ride?.pickup_location || ride?.drop_location) && (
        <div className="flex flex-col gap-1 bg-white/[0.02] border border-white/5 p-2 rounded-xl text-xs">
          {ride?.pickup_location && (
            <div className="flex items-center gap-2 truncate text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="truncate">{ride.pickup_location}</span>
            </div>
          )}
          {ride?.drop_location && (
            <div className="flex items-center gap-2 truncate text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="truncate">{ride.drop_location}</span>
            </div>
          )}
        </div>
      )}

      {/* OTP Badge & Compact Cancel Action Row */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {(ridestatus === "accepted" || ridestatus === "driver_arrived") && (
          <div className="flex-1 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-amber-300/70 uppercase">OTP</span>
            <span className="text-xl font-black tracking-widest text-[#FFD700] font-mono leading-none">
              {ride.otp || "----"}
            </span>
          </div>
        )}

        {ridestatus !== "started" && (
          <Button
            variant="outline"
            size="sm"
            isPending={isCancelling}
            isDisabled={isCancelling}
            onPress={cancleride}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold text-xs px-3 py-2 cursor-pointer flex-shrink-0"
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Button>
        )}
      </div>
    </div>
  );
}