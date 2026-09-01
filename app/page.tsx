"use client";
import { useAuth } from "./context/AuthContext";
import RiderDashboard from "./components/Rider/RiderDashboard";
import DriverDashboard from "./components/Driver/DriverDashboard";
import CyclelogoLoader from "./components/loader/CyclelogoLoader";

export default function Home() {
  const { role, isLoading } = useAuth();
  console.log("role", role);
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0d1a] text-white">
         <CyclelogoLoader/>
      </div>
    );
  }

  return role === "driver" ? <DriverDashboard /> : <RiderDashboard />;
}
