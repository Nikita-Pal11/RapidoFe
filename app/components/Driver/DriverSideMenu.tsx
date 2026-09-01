"use client";
import React from "react";
import { Button, Card } from "@heroui/react";
import { StarIcon } from "./icons";
import { useAuth } from "@/app/context/AuthContext";
const NAV_ITEMS = ["Dashboard", "Earnings", "Trips", "Documents", "Support", "Settings"];

interface DriverSideMenuProps {
  onClose: () => void;
}

export function DriverSideMenu({ onClose }: DriverSideMenuProps) {
  const { logout } = useAuth();
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Drawer */}
      <nav
        className="relative left-0 top-0 bottom-0 w-72 flex flex-col p-6 bg-[#111118] border-r border-white/5 shadow-2xl animate-[fadeSlideRight_0.3s_ease_both]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Driver profile card */}
        <Card className="bg-white/[0.03] border-white/5 p-4 rounded-2xl flex flex-row items-center gap-3 mb-6 shadow-xl">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/10">
            R
          </div>
          <div className="min-w-0">
            <p className="text-white font-extrabold text-sm m-0">Rahul M.</p>
            <p className="text-[11px] font-semibold text-white/40 m-0 truncate">
              MH12AB1234 · Bike
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4].map((i) => (
                <StarIcon key={i} filled size={11} />
              ))}
              <StarIcon size={11} />
              <span className="text-xs font-bold text-[#FFD700] ml-0.5">
                4.8
              </span>
            </div>
          </div>
        </Card>

        <div className="bg-white/5 mb-4" />

        {/* Nav links */}
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item === "Dashboard";
            return (
              <button
                key={item}
                onClick={onClose}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-all border-0 bg-transparent cursor-pointer ${
                  isActive
                    ? "text-[#FFD700] bg-white/[0.04]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-4 rounded-full bg-[#FFD700] -ml-1" />
                )}
                {item}
              </button>
            );
          })}
        </div>

        {/* Sign out */}
        <div className="mt-auto">
          <Button
            className="w-full py-5 rounded-xl text-xs font-bold border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all cursor-pointer"
            onPress={logout}
          >
            Sign Out
          </Button>
        </div>
      </nav>
    </div>
  );
}
