"use client";
import React from "react";
import { Card } from "@heroui/react";

export interface WeeklyDataPoint {
  d: string;
  v: number;
  isToday: boolean;
}

interface WeeklyEarningsGraphProps {
  data: WeeklyDataPoint[];
}

export function WeeklyEarningsGraph({ data }: WeeklyEarningsGraphProps) {
  const maxWeekly = Math.max(...data.map((w) => w.v), 100);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 m-0">
        Weekly Performance Graph
      </p>
      <Card className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-md">
        <div className="flex items-end justify-between gap-2.5 h-28 pt-2">
          {data.map(({ d, v, isToday }) => {
            const pct = maxWeekly > 0 ? (v / maxWeekly) * 100 : 0;
            return (
              <div
                key={d}
                className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end"
              >
                <div
                  className="w-full rounded-t-md transition-all duration-500 min-h-[4px]"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    background: isToday ? "#FFD700" : "rgba(255,215,0,0.15)",
                    boxShadow: isToday ? "0 0 12px rgba(255,215,0,0.25)" : "none",
                  }}
                />
                <p
                  className={`text-[10px] font-extrabold m-0 ${
                    isToday ? "text-[#FFD700]" : "text-white/30"
                  }`}
                >
                  {d}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
