"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  role?: string;
  dark?: boolean;
}

const BikeIcon = ({ size = 22, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M5.5 17.5 9 6l4 4 4-3.5M9 6h7" />
    <circle cx="16" cy="6" r="1" />
  </svg>
);

export function Logo({
  className = "",
  size = "md",
  showText = true,
  role = "ride smarter",
  dark = false,
}: LogoProps) {
  const boxSizes = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-9 h-9 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 24,
  };

  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-3xl tracking-tight",
  };

  const roleSizes = {
    sm: "text-[9px] tracking-widest mt-0.5",
    md: "text-[10px] tracking-widest mt-0.5",
    lg: "text-[12px] tracking-widest mt-1",
  };

  return (
    <div className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      {/* Icon Box */}
      <div
        className={`${boxSizes[size]} flex items-center justify-center bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/25 transition-all duration-300 hover:scale-105 hover:rotate-[3deg] flex-shrink-0`}
      >
        <BikeIcon size={iconSizes[size]} />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="leading-none flex flex-col">
          <span
            className={`font-black lowercase tracking-tight ${
              dark ? "text-[#17151f]" : "text-white"
            } ${textSizes[size]}`}
          >
            raahi
          </span>
          {role && (
            <span
              className={`font-bold uppercase tracking-widest ${
                dark ? "text-[#6b6880]" : "text-white/30"
              } ${roleSizes[size]}`}
            >
              {role}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
