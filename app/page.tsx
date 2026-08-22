"use client";
import { useAuth } from "./context/AuthContext";
import RiderDashboard from "./components/Rider/RiderDashboard";
import DriverDashboard from "./components/Driver/DriverDashboard";

export default function Home() {
  const { role, isLoading } = useAuth();
  console.log("role", role);
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0d1a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-purple-500 border-t-transparent" />
          <p className="text-sm font-medium text-purple-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return role === "driver" ? <DriverDashboard /> : <RiderDashboard />;
}
