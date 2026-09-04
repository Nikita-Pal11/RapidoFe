"use client";
import React from "react";
import { Button } from "@heroui/react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Logo from "../Logo";

const NAV_ITEMS = ["Dashboard", "Profile", "Earnings", "Trips", "Documents", "Support", "Settings"];

interface DriverSideMenuProps {
  onClose: () => void;
}

export function DriverSideMenu({ onClose }: DriverSideMenuProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleItemClick = (item: string) => {
    if (item === "Profile") {
      router.push("/DriverProfile");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Drawer */}
      <nav
        className="relative left-0 top-0 bottom-0 w-72 flex flex-col p-6 bg-[#111118] border-r border-white/5 shadow-2xl animate-[fadeSlideRight_0.3s_ease_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <Logo />
        </div>

        <div className="h-px bg-white/5 mb-4" />

        {/* Nav links */}
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item === "Dashboard";
            return (
              <button
                key={item}
                onClick={() => handleItemClick(item)}
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
