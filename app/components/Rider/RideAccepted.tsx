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
    <div className="flex flex-col gap-4 text-white animate-[fadeSlideUp_0.4s_ease_both]">
      {/* Dynamic Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider m-0">
            {ridestatus === "driver_arrived"
              ? "Driver Reached"
              : ridestatus === "started"
                ? "Ride Started"
                : "Driver is arriving"}
          </p>
        </div>
        <Chip
          size="sm"
          variant="tertiary"
          color="warning"
          className="font-extrabold text-[10px] uppercase"
        >
          Ride Confirmed
        </Chip>
      </div>

      {/* Driver Info Card */}
      <Card className="bg-white/[0.03] border-white/5 p-4 rounded-2xl shadow-xl flex flex-row items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-[#FFD700] text-[#0a0a0f] font-black text-2xl flex items-center justify-center shadow-lg shadow-[#FFD700]/10 flex-shrink-0">
          {firstName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 flex flex-col min-w-0 gap-0.5">
          <span className="text-base font-black truncate">{driverName}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-[#FFD700]/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#FFD700]">
              <StarIcon size={10} filled />
              <span>4.9</span>
            </div>
            <span className="text-[11px] font-medium text-white/45 capitalize">
              {driver.gender || "Driver"}
            </span>
          </div>
        </div>

        {/* Action Button: Call */}
        <Button
          isIconOnly
          variant="danger-soft"
          className="rounded-xl w-11 h-11 border border-warning/10 cursor-pointer"
          aria-label="Call Driver"
        >
          <PhoneIcon size={16} />
        </Button>
      </Card>

      {/* Vehicle Info Row */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-white/35 font-semibold uppercase tracking-wider">
            Vehicle
          </span>
          <span className="text-sm font-extrabold capitalize text-white">
            {vehicle?.color || "White"} • {vehicle?.vehicle_type || "Ride"}
          </span>
        </div>
        {/* High contrast license plate badge */}
        <div className="bg-[#FFD700] text-[#0a0a0f] font-black px-3.5 py-1.5 rounded-xl text-sm border-2 border-black/10 tracking-widest shadow-lg shadow-[#FFD700]/10 font-mono">
          {vehicle?.vehicle_number || "NO PLATE"}
        </div>
      </div>

      {/* OTP Display Card */}
      {(ridestatus === "accepted" || ridestatus === "driver_arrived") && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-4 rounded-2xl text-center flex flex-col gap-2">
          <span className="text-xs text-amber-300/60 font-semibold tracking-wider uppercase">
            Share this OTP to start the ride
          </span>
          <div className="text-3xl font-black tracking-widest text-[#FFD700] font-mono leading-none py-1">
            {ride.otp || "----"}
          </div>
        </Card>
      )}

      {/* Cancel Ride Action */}
      {ridestatus !== "started" && (
        <Button
          variant="outline"
          size="md"
          isPending={isCancelling}
          isDisabled={isCancelling}
          onPress={cancleride}
          className="w-full mt-1 bg-red-500/[0.08] hover:bg-red-500/15 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold text-xs transition-all active:scale-[0.99] py-3 cursor-pointer"
        >
          {isCancelling ? "Cancelling Ride..." : "Cancel Ride"}
        </Button>
      )}
    </div>
  );
}