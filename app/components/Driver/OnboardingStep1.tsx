"use client";
import { useState } from "react";
import {
  BikeIcon, CarIcon, VanIcon, TaxiIcon,
  ArrowRightIcon, AlertIcon,
} from "./icons";

/* ── Vehicle type options ──────────────────────────────── */
const VEHICLE_TYPES = [
  { value: "bike",  label: "Bike",  icon: <BikeIcon /> },
  { value: "car",   label: "Car",   icon: <CarIcon /> },
  { value: "van",   label: "Van",   icon: <VanIcon /> },
  { value: "taxi",  label: "Taxi",  icon: <TaxiIcon /> },
];

const COLOR_SWATCHES = [
  { label: "Black",  hex: "#1a1a1a" },
  { label: "White",  hex: "#f5f5f5" },
  { label: "Silver", hex: "#9ca3af" },
  { label: "Red",    hex: "#ef4444" },
  { label: "Blue",   hex: "#3b82f6" },
  { label: "Yellow", hex: "#FFD700" },
];

interface OnboardingStep1Props {
  setstep: (step: number) => void;
  setvehicleid: (id: number) => void;
}

export default function OnboardingStep1({ setstep, setvehicleid }: OnboardingStep1Props) {
  const [vehicletype, setvehicletype] = useState("");
  const [vehiclenumber, setvehiclenumber] = useState("");
  const [color, setcolor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function RegisterVehicle() {
    if (!vehiclenumber.trim()) { setError("Please enter your vehicle number"); return; }
    if (!vehicletype) { setError("Please select a vehicle type"); return; }
    if (!color.trim()) { setError("Please enter or select a colour"); return; }

    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/users/vehicle/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_type: vehicletype, vehicle_number: vehiclenumber, color }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail ?? "Something went wrong. Please try again.");
        return;
      }
      setvehicleid(data.id);
      setstep(1);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col font-[Inter,system-ui,sans-serif]"
      style={{ background: "#0a0a0f" }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#FFD700" }}
        >
          <BikeIcon />
        </div>
        <div className="leading-none">
          <span className="text-white font-black text-xl tracking-tight">raahi</span>
          <span
            className="block text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >captain onboarding</span>
        </div>
      </header>

      {/* ── Progress bar ────────────────────────────────── */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold" style={{ color: "#FFD700" }}>Step 1 of 3</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>— Vehicle Details</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: "33%", background: "linear-gradient(90deg, #d97706, #FFD700)" }}
          />
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6 pb-32">

        {/* Vehicle Number */}
        <div>
          <label
            htmlFor="vehicle-number"
            className="block text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Vehicle Number
          </label>
          <div
            className="flex items-center gap-3 rounded-2xl px-4 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1.5px solid ${vehiclenumber ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.1)"}`,
              boxShadow: vehiclenumber ? "0 0 0 3px rgba(255,215,0,0.08)" : "none",
            }}
          >
            {/* Indian number plate indicator */}
            <div
              className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[8px] font-black"
              style={{ background: "#FFD700", color: "#000" }}
            >IND</div>
            <input
              id="vehicle-number"
              type="text"
              placeholder="MH 12 AB 1234"
              value={vehiclenumber}
              onChange={(e) => { setvehiclenumber(e.target.value.toUpperCase()); setError(""); }}
              className="flex-1 bg-transparent border-none outline-none py-4 text-sm font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
              style={{
                color: "white",
                fontFamily: "Inter, monospace",
              }}
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Vehicle Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_TYPES.map(({ value, label, icon }) => {
              const selected = vehicletype === value;
              return (
                <button
                  key={value}
                  onClick={() => { setvehicletype(value); setError(""); }}
                  className="flex flex-col items-center gap-2.5 rounded-2xl py-5 px-3 transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: selected ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${selected ? "#FFD700" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: selected ? "0 0 0 3px rgba(255,215,0,0.1)" : "none",
                    color: selected ? "#FFD700" : "rgba(255,255,255,0.45)",
                  }}
                >
                  <span style={{ color: selected ? "#FFD700" : "rgba(255,255,255,0.4)" }}>{icon}</span>
                  <span className="text-sm font-bold" style={{ color: selected ? "#FFD700" : "rgba(255,255,255,0.6)" }}>
                    {label}
                  </span>
                  {selected && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#FFD700" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colour */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Vehicle Colour
          </label>

          {/* Colour swatches */}
          <div className="flex gap-2.5 mb-3 flex-wrap">
            {COLOR_SWATCHES.map(({ label, hex }) => {
              const selected = color.toLowerCase() === label.toLowerCase();
              return (
                <button
                  key={label}
                  title={label}
                  onClick={() => { setcolor(label); setError(""); }}
                  className="flex flex-col items-center gap-1 transition-all duration-200"
                >
                  <span
                    className="w-8 h-8 rounded-full block transition-all duration-200"
                    style={{
                      background: hex,
                      border: selected ? "2.5px solid #FFD700" : "2px solid rgba(255,255,255,0.15)",
                      boxShadow: selected ? "0 0 0 3px rgba(255,215,0,0.2)" : "none",
                      transform: selected ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: selected ? "#FFD700" : "rgba(255,255,255,0.3)" }}
                  >{label}</span>
                </button>
              );
            })}
          </div>

          {/* Or type custom colour */}
          <div
            className="flex items-center gap-3 rounded-2xl px-4 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1.5px solid ${color && !COLOR_SWATCHES.some(s => s.label.toLowerCase() === color.toLowerCase()) ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            <span className="text-base" style={{ color: "rgba(255,255,255,0.3)" }}>🎨</span>
            <input
              id="color-input"
              type="text"
              placeholder="Or type a custom colour…"
              value={color}
              onChange={(e) => { setcolor(e.target.value); setError(""); }}
              className="flex-1 bg-transparent border-none outline-none py-3.5 text-sm font-medium placeholder:font-normal"
              style={{ color: "white" }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 animate-[fadeSlideDown_0.4s_ease_both]"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <span style={{ color: "#ef4444" }}><AlertIcon /></span>
            <p className="text-sm font-medium" style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        )}
      </div>

      {/* ── Sticky CTA ──────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-5"
        style={{
          background: "rgba(10,10,15,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          id="register-vehicle-btn"
          onClick={RegisterVehicle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-black transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #d97706, #FFD700)",
            color: "#000",
            boxShadow: "0 8px 28px rgba(255,215,0,0.35)",
          }}
        >
          {loading ? (
            <>
              <span
                className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin"
              />
              Registering…
            </>
          ) : (
            <>
              Continue <ArrowRightIcon />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
