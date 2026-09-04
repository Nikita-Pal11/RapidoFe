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
    <div className="flex flex-col gap-3 p-1 animate-[fadeSlideUp_0.3s_ease_both]">
      {/* Driver Search Header Row */}
      <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-3 rounded-xl">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex-shrink-0">
          <div className="absolute inset-0 rounded-xl border border-[#FFD700]/20 animate-ping opacity-25" />
          <CyclelogoLoader />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-sm font-black tracking-tight text-white m-0 truncate">
            Finding your driver...
          </h3>
          <p className="text-[11px] text-white/50 font-medium m-0 truncate">
            Contacting nearby drivers for pickup
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          isPending={isCancelling}
          isDisabled={isCancelling}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs px-3 py-2 cursor-pointer flex-shrink-0"
          onPress={cancleride}
        >
          {isCancelling ? "Cancelling..." : "Cancel"}
        </Button>
      </div>

      {/* Animated Linear Progress Bar */}
      <div className="w-full px-1">
        <Loader />
      </div>
    </div>
  );
}