"use client";
import React, { useState } from "react";
import { Button } from "@heroui/react";
import CyclelogoLoader from "../loader/CyclelogoLoader";
import Loader from "../loader/Loader";

export default function DriverSearching({ ride_id }: { ride_id: number }) {
  const [isCancelling, setIsCancelling] = useState(false);

  async function cancleride() {
    if (!ride_id) return;
    setIsCancelling(true);
    try {
      const resp = await fetch("/api/ride/ridebooking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id }),
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

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-white/[0.03] border border-white/10 rounded-2xl gap-4 text-center animate-[fadeSlideUp_0.3s_ease_both]">
      {/* Animated Cycle Icon Badge */}
      <div className="relative flex items-center justify-center p-3.5 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20">
        <div className="absolute inset-0 rounded-2xl border border-[#FFD700]/30 animate-ping opacity-30" />
        <CyclelogoLoader size={50} />
      </div>

      {/* Header & Subtext */}
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-base font-extrabold tracking-tight text-white m-0">
          Finding your driver...
        </h3>
        <p className="text-xs text-white/50 font-medium m-0">
          Contacting nearby drivers for pickup
        </p>
      </div>

      {/* Animated Linear Progress Bar */}
      <div className="w-full px-2">
        <Loader />
      </div>

      {/* Cancel Button */}
      <Button
        variant="outline"
        size="sm"
        isPending={isCancelling}
        isDisabled={isCancelling}
        className="w-full max-w-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs py-2.5 cursor-pointer transition-all active:scale-[0.98]"
        onPress={cancleride}
      >
        {isCancelling ? "Cancelling..." : "Cancel Ride"}
      </Button>
    </div>
  );
}