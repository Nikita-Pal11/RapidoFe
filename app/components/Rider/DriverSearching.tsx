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
    <div className="flex flex-col items-center justify-center p-6 gap-6 text-center animate-[fadeSlideUp_0.4s_ease_both]">
      {/* Visual glowing ripple wrapper around loader */}
      <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-white/[0.02] border border-white/5 shadow-2xl shadow-[#FFD700]/5">
        <div className="absolute inset-0 rounded-full border border-[#FFD700]/10 animate-ping opacity-25" />
        <CyclelogoLoader />
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-lg font-black tracking-tight text-white m-0">
          Finding your driver...
        </h3>
        <p className="text-xs text-white/45 font-medium leading-relaxed m-0">
          We are searching for the nearest online vehicles to match your pickup spot. This should only take a moment.
        </p>
      </div>

      <div className="w-full max-w-xs mt-1">
        <Loader />
      </div>

      <Button
        variant="outline"
        size="sm"
        isPending={isCancelling}
        isDisabled={isCancelling}
        className="mt-2 text-xs font-semibold text-white/60 border-white/10 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all rounded-xl py-4 cursor-pointer"
        onPress={cancleride}
      >
        {isCancelling ? "Cancelling..." : "Cancel Search"}
      </Button>
    </div>
  );
}