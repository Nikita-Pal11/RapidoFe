"use client";
import { Switch } from "@heroui/react";
import { MenuIcon, BellIcon } from "./icons";
import { Logo } from "../Logo";

interface DriverTopNavProps {
  isOnline: boolean;
  onMenuToggle: () => void;
  onGoOnline: () => void;
}

export function DriverTopNav({ isOnline, onMenuToggle, onGoOnline }: DriverTopNavProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/25">
      {/* Left — hamburger + brand */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMenuToggle}
          className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-xl cursor-pointer bg-transparent border-0"
          aria-label="Open menu"
        >
          <MenuIcon size={20} />
        </button>
        <Logo size="sm" role="captain" />
      </div>

      {/* Right — online toggle switch + bell */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black uppercase tracking-wider transition-colors ${isOnline ? "text-emerald-400" : "text-white/40"}`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
          <Switch
            isSelected={isOnline}
            onChange={onGoOnline}
            size="md"
            aria-label="Toggle Online status"
          >
            {({ isSelected }) => (
              <Switch.Content>
                <Switch.Control className={isSelected ? "bg-emerald-500/80 border-emerald-500" : "bg-white/10 border-white/10"}>
                  <Switch.Thumb className="bg-white" />
                </Switch.Control>
              </Switch.Content>
            )}
          </Switch>
        </div>

        <button
          className="relative text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-xl cursor-pointer"
          aria-label="Notifications"
        >
          <BellIcon size={18} />
          {isOnline && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
}
