"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OnboardingStep1 from "../../components/Driver/OnboardingStep1";
import {
  BikeIcon,
  PhoneIcon,
  ArrowRightIcon,
  CheckIcon,
} from "../../components/Driver/icons";

const GENDER_OPTIONS = [
  { value: "male", label: "Male", icon: "👨" },
  { value: "female", label: "Female", icon: "👩" },
  { value: "other", label: "Other", icon: "🧑" },
];

export default function OnBoarding() {
  const router = useRouter();
  const [phone, setphone] = useState("");
  const [gender, setgender] = useState("");
  const [step, setstep] = useState(0);
  const [vehicleid, setvehicleid] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function DriverProfile() {
    if (!gender) {
      setError("Please select your gender");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resp = await fetch("/api/users/driver/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gender, phone, vehicle: vehicleid }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail || "Failed to save profile. Please try again.");
        console.log("Error", data);
        return;
      }
      console.log("data---->", data);
      router.push("/");
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.log("error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-[Inter,system-ui,sans-serif] bg-[#0a0a0f] text-white">
      {step === 0 && (
        <OnboardingStep1 setstep={setstep} setvehicleid={setvehicleid} />
      )}

      {step === 1 && (
        <div className="min-h-screen flex flex-col justify-between">
          {/* ── Header ──────────────────────────────────────── */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFD700] text-[#0a0a0f] flex items-center justify-center font-black flex-shrink-0">
                <BikeIcon />
              </div>
              <div className="leading-none">
                <span className="text-white font-black text-xl tracking-tight block">
                  raahi
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/35 block">
                  captain onboarding
                </span>
              </div>
            </div>

            <button
              onClick={() => setstep(0)}
              className="text-xs font-semibold text-white/60 hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              ← Back to Step 1
            </button>
          </header>

          {/* ── Progress bar ────────────────────────────────── */}
          <div className="px-5 pt-6 pb-2 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FFD700]">
                  Step 2 of 2
                </span>
                <span className="text-xs text-white/40">
                  — Personal Details
                </span>
              </div>
              <span className="text-xs font-semibold text-[#FFD700]">100%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#d97706] to-[#FFD700] transition-all duration-500 w-full" />
            </div>
          </div>

          {/* ── Main Form Content ───────────────────────────── */}
          <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight text-white m-0 mb-1">
                  Complete Profile
                </h1>
                <p className="text-sm text-white/50 m-0">
                  Provide your gender and contact phone number to finish registration.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2 animate-shake">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Gender Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/45 mb-2.5">
                  Select Gender
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((g) => {
                    const isSelected = gender === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => {
                          setgender(g.value);
                          setError("");
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-[#FFD700] text-[#0a0a0f] border-[#FFD700] shadow-lg shadow-[#FFD700]/25 -translate-y-0.5 font-extrabold"
                            : "bg-white/[0.04] text-white border-white/10 hover:bg-white/[0.08] font-semibold"
                        }`}
                      >
                        <span className="text-2xl mb-1">{g.icon}</span>
                        <span className="text-xs">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/45 mb-2">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-white/40 flex items-center gap-1.5 text-sm font-semibold pointer-events-none">
                    <PhoneIcon size={16} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setphone(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-white/[0.04] border border-white/10 text-white text-base font-semibold pl-16 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder:text-white/25"
                  />
                </div>
              </div>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-4 mb-4">
              <button
                onClick={DriverProfile}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-base tracking-tight transition-all border-0 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-white/10 text-white/40 cursor-wait"
                    : "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] shadow-xl shadow-[#FFD700]/30 hover:brightness-105 active:scale-[0.99] cursor-pointer"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Saving Profile…</span>
                  </>
                ) : (
                  <>
                    <span>Save & Finish</span>
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}