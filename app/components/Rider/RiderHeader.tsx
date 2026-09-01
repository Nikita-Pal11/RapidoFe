"use client";
import React from "react";
import { BellIcon, MenuIcon } from "../Driver/icons";
import { Logo } from "../Logo";

interface RiderHeaderProps {
  onMenuToggle: () => void;
}

export function RiderHeader({ onMenuToggle }: RiderHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/25">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMenuToggle}
          className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-xl cursor-pointer bg-transparent border-0"
          aria-label="Toggle menu"
        >
          <MenuIcon size={20} />
        </button>
        <Logo size="sm" role="rider" />
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-xl cursor-pointer bg-transparent border-0"
          aria-label="Notifications"
        >
          <BellIcon size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black font-black text-xs flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
          R
        </div>
      </div>
    </header>
  );
}
