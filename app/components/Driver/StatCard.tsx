"use client";
import React from "react";
import { Card } from "@heroui/react";
import { TrendUpIcon } from "./icons";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}

export function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <Card className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-row items-start gap-3 transition-all duration-200 hover:bg-white/[0.06] shadow-lg">
      <div
        className="rounded-xl p-2.5 flex-shrink-0 flex items-center justify-center"
        style={{ background: `${accent}20`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider m-0">
          {label}
        </p>
        <p className="text-xl font-black text-white leading-none tracking-tight m-0">
          {value}
        </p>
        {sub && (
          <p className="text-[10px] font-bold mt-1 flex items-center gap-1 text-emerald-400 m-0">
            <TrendUpIcon size={12} />
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
