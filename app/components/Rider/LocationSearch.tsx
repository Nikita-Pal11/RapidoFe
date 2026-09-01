"use client";
import { useEffect, useState } from "react";
import { LocationIcon, XIcon } from "../Driver/icons";

interface LocationSearchProps {
  origin: string;
  dropoff: string;
  onOriginClear: () => void;
  onDropoffClear: () => void;
  onSelectPlace: (formatted: string, lng: number, lat: number, type: "origin" | "dropoff") => void;
  onCurrentLocationShortcut: () => void;
  onHomeShortcut: () => void;
  onOfficeShortcut: () => void;
}

export function LocationSearch({
  origin,
  dropoff,
  onOriginClear,
  onDropoffClear,
  onSelectPlace,
  onCurrentLocationShortcut,
  onHomeShortcut,
  onOfficeShortcut,
}: LocationSearchProps) {
  const [activeInput, setActiveInput] = useState<"origin" | "dropoff" | "">("");
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch autocomplete suggestions whenever query changes
  useEffect(() => {
    if (!query.trim()) { setPlaces([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=a0121d6c1eb34c91bc42b8698129a390`,
        );
        const data = await res.json();
        setPlaces(data.features ?? []);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(formatted: string, lng: number, lat: number) {
    if (!activeInput) return;
    onSelectPlace(formatted, lng, lat, activeInput);
    setQuery("");
    setPlaces([]);
    setActiveInput("");
  }

  return (
    <>
      {/* ── Location Inputs Card ─────────────────────────── */}
      <div className="flex items-stretch gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 mb-2.5">
        {/* Route line indicator */}
        <div className="flex flex-col items-center justify-center pt-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] flex-shrink-0" />
          <div className="w-0.5 flex-1 min-h-[20px] my-1 bg-[repeating-linear-gradient(to_bottom,rgba(255,215,0,0.4)_0,rgba(255,215,0,0.4)_4px,transparent_4px,transparent_8px)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] flex-shrink-0" />
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {/* Pickup input */}
          <div className="relative">
            <input
              id="origin"
              type="text"
              placeholder="Pickup location"
              value={activeInput === "origin" ? query : origin}
              className={`w-full bg-transparent border-0 text-sm font-medium text-white pr-7 py-1.5 rounded-lg focus:outline-none focus:bg-[#FFD700]/[0.06] transition-colors placeholder:text-white/35 font-inherit ${
                activeInput === "origin" ? "bg-[#FFD700]/[0.06]" : ""
              }`}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { setActiveInput("origin"); setQuery(origin); }}
            />
            {origin && (
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 hover:text-white p-1 cursor-pointer"
                onClick={() => { onOriginClear(); setQuery(""); }}
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          <div className="h-px bg-white/10 my-0.5" />

          {/* Dropoff input */}
          <div className="relative">
            <input
              id="dropoff"
              type="text"
              placeholder="Where to? (Drop-off)"
              value={activeInput === "dropoff" ? query : dropoff}
              className={`w-full bg-transparent border-0 text-sm font-medium text-white pr-7 py-1.5 rounded-lg focus:outline-none focus:bg-[#FFD700]/[0.06] transition-colors placeholder:text-white/35 font-inherit ${
                activeInput === "dropoff" ? "bg-[#FFD700]/[0.06]" : ""
              }`}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { setActiveInput("dropoff"); setQuery(dropoff); }}
            />
            {dropoff && (
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 hover:text-white p-1 cursor-pointer"
                onClick={() => { onDropoffClear(); setQuery(""); }}
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Shortcut Chips ─────────────────────────── */}
      {!origin && !dropoff && (
        <div className="flex gap-2 mb-3.5 overflow-x-auto pb-1">
          <button
            className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
            onClick={onCurrentLocationShortcut}
          >
            <LocationIcon size={13} />
            <span>Current Location</span>
          </button>
          <button
            className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
            onClick={onHomeShortcut}
          >
            <span>🏠 Home</span>
          </button>
          <button
            className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
            onClick={onOfficeShortcut}
          >
            <span>💼 Office</span>
          </button>
        </div>
      )}

      {/* ── Autocomplete Suggestions ─────────────────────── */}
      {(places.length > 0 || isSearching) && (
        <div className="bg-[#161622] border border-white/10 rounded-2xl overflow-hidden mb-3.5 shadow-xl">
          {isSearching ? (
            <div className="flex items-center gap-2.5 p-3.5 text-[#FFD700] text-xs font-semibold">
              <div className="w-4 h-4 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
              <span>Searching locations…</span>
            </div>
          ) : (
            places.slice(0, 5).map((val: any, ind: number) => (
              <button
                key={ind}
                className="flex items-center gap-3 w-full text-left p-3 bg-transparent hover:bg-[#FFD700]/[0.08] transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                onClick={() => handleSelect(val?.properties?.formatted, val?.properties?.lon, val?.properties?.lat)}
              >
                <div className="text-[#FFD700] flex-shrink-0">
                  <LocationIcon size={15} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-white truncate block">
                    {val?.properties?.name || val?.properties?.street || val?.properties?.formatted}
                  </span>
                  <span className="text-xs text-white/45 font-normal truncate block">
                    {val?.properties?.formatted}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </>
  );
}
