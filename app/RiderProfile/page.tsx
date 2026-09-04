"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Spinner } from "@heroui/react";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import {
  BikeIcon,
  CarIcon,
  StarIcon,
  PhoneIcon,
  ShieldIcon,
  EditIcon,
  LogOutIcon,
  CheckIcon,
} from "../components/Driver/icons";

interface riderType {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  emergencyContact: string;
  totalRides: number;
}

interface triptype {
  id: number | string;
  date: string;
  pickup: string;
  dropoff: string;
  type: string;
  fare: string;
  status: string;
  rating: number;
}

export default function RiderProfile() {
  const router = useRouter();
  const { logout } = useAuth() as any;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Rider Details State (No hardcoded dummy data)
  const [riderData, setRiderData] = useState<riderType>({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    emergencyContact: "",
    totalRides: 0,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    emergencyContact: "",
  });

  // Recent trips
  const [recentTrips, setRecentTrips] = useState<triptype[]>([
    {
      id: "RD-9821",
      date: "Today, 5:30 PM",
      pickup: "Bandra Kurla Complex (BKC)",
      dropoff: "Bandra Station West",
      type: "Bike",
      fare: "₹65",
      status: "Completed",
      rating: 5,
    },
  ]);

useEffect(() => {
  async function loadData() {
    try {
      const [profileRes, tripsRes] = await Promise.all([
        fetch("/api/users/profile/"),
        fetch("/api/ride/alltrips"),
      ]);

      // Profile
      if (profileRes.ok) {
        const data = await profileRes.json();

        if (data) {
          const u = data.user || {};

          const fName = u.first_name || "";
          const lName = u.last_name || "";
          const uName = u.username || "";
          const ph = data.phone || "";
          const em = u.email || "";
          const ec = data.emergency_contact || "";

          setRiderData({
            firstName: fName,
            lastName: lName,
            username: uName,
            phone: ph,
            email: em,
            emergencyContact: ec,
            totalRides: 0,
          });

          setEditForm({
            firstName: fName,
            lastName: lName,
            phone: ph,
            emergencyContact: ec,
          });
        }
      }

      // Trips
      if (tripsRes.ok) {
        const data = await tripsRes.json();
        setRecentTrips(Array.isArray(data) ? data : []);
      } else {
        console.log("Trips response:", tripsRes);
      }
    } catch (err) {
      console.log("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);

  async function handleSaveProfile() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/users/rider/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editForm.firstName.trim(),
          last_name: editForm.lastName.trim(),
          phone: editForm.phone.trim(),
          emergency_contact: editForm.emergencyContact.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.message || data?.detail || "Failed to save profile");
        return;
      }

      setRiderData((prev) => ({
        ...prev,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        emergencyContact: editForm.emergencyContact.trim(),
      }));

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1000);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  // Name resolution: if no first & last name, fallback to username
  const fullName = [riderData.firstName, riderData.lastName].filter(Boolean).join(" ");
  const displayName = fullName || riderData.username || "Rider";
  const avatarLetter = (riderData.firstName || riderData.username || "R").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-[Inter,system-ui,sans-serif]">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => router.push("/")}
            className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-xl px-3 py-1 text-xs font-semibold cursor-pointer"
          >
            ← Back
          </Button>
          <Logo size="sm" role="rider profile" />
        </div>

        <Button
          size="sm"
          onPress={logout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold px-3 py-1 cursor-pointer flex items-center gap-1.5"
        >
          <LogOutIcon size={14} />
          <span>Sign Out</span>
        </Button>
      </header>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner color="warning" />
          </div>
        ) : (
          <>
            {/* ── Rider Details Card ──────────────────────────── */}
            <Card className="bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar Initial */}
                <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#d97706] to-[#FFD700] shadow-lg shadow-[#FFD700]/15 flex-shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-[#0a0a0f] flex items-center justify-center">
                    <span className="text-3xl font-black text-[#FFD700]">
                      {avatarLetter}
                    </span>
                  </div>
                </div>

                {/* Rider Bio */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-black text-white tracking-tight m-0">
                        {displayName}
                      </h1>
                      {riderData.username && fullName && (
                        <p className="text-xs text-white/40 m-0 mt-0.5">@{riderData.username}</p>
                      )}
                      <p className="text-xs text-white/50 m-0 mt-0.5">Rider Account</p>
                    </div>

                    <Button
                      size="sm"
                      onPress={() => setIsEditing(!isEditing)}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl px-3.5 py-1.5 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer self-center sm:self-auto"
                    >
                      <EditIcon size={13} />
                      <span>{isEditing ? "Close" : "Edit Profile"}</span>
                    </Button>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/5">
                    {/* Phone Number */}
                    <div className="flex items-center gap-2.5 text-xs text-white/70">
                      <span className="text-white/40"><PhoneIcon size={14} /></span>
                      {riderData.phone ? (
                        <span className="font-semibold">+91 {riderData.phone}</span>
                      ) : (
                        <span className="text-white/30 italic">No phone added</span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2.5 text-xs text-white/70">
                      <span className="text-white/40">✉️</span>
                      {riderData.email ? (
                        <span className="font-semibold truncate">{riderData.email}</span>
                      ) : (
                        <span className="text-white/30 italic">No email linked</span>
                      )}
                    </div>

                    {/* Emergency SOS Contact */}
                    <div className="flex items-center gap-2.5 text-xs text-white/70 sm:col-span-2">
                      <span className="text-red-400"><ShieldIcon size={14} /></span>
                      <span>
                        Emergency SOS:{" "}
                        {riderData.emergencyContact ? (
                          <strong className="text-white">+91 {riderData.emergencyContact}</strong>
                        ) : (
                          <span className="text-white/30 italic">Not set</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Inline Edit Form ────────────────────────────── */}
              {isEditing && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-fade-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 m-0 mb-3">
                    Update Personal Details
                  </h3>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
                      ⚠️ {error}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <CheckIcon size={14} />
                      <span>Profile updated successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-white/40 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full bg-white/[0.05] border border-white/10 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFD700] placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-white/40 mb-1">
                        Last Name <span className="text-white/30 font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full bg-white/[0.05] border border-white/10 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFD700] placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-white/40 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-white/[0.05] border border-white/10 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFD700] placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-white/40 mb-1">
                        Emergency SOS Contact
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={editForm.emergencyContact}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        className="w-full bg-white/[0.05] border border-white/10 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFD700] placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button
                      size="sm"
                      onPress={() => setIsEditing(false)}
                      className="bg-white/5 text-white/70 font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onPress={handleSaveProfile}
                      isDisabled={saving}
                      className="bg-[#FFD700] hover:bg-[#FFA500] text-black font-extrabold rounded-xl text-xs px-4 cursor-pointer shadow-md"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ── Recent Trips Section ─────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg font-black text-white m-0">Recent Trips</h2>
                  <p className="text-xs text-white/40 m-0 mt-0.5">Your completed ride history</p>
                </div>
                <span className="text-xs text-[#FFD700] font-bold">
                  {recentTrips.length} Total Trips
                </span>
              </div>

              {recentTrips.length === 0 ? (
                <Card className="bg-[#12121a] border border-white/10 p-8 rounded-2xl text-center">
                  <div className="text-3xl mb-2">🛵</div>
                  <p className="text-sm font-bold text-white m-0">No rides taken yet</p>
                  <p className="text-xs text-white/40 m-0 mt-1">
                    Book your first ride on Raahi to see your trip history here!
                  </p>
                  <Button
                    size="sm"
                    onPress={() => router.push("/")}
                    className="mt-4 bg-[#FFD700] text-black font-extrabold rounded-xl text-xs px-4 self-center cursor-pointer shadow"
                  >
                    Book a Ride
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentTrips.map((trip: any) => {
                    const pickup = trip.pickup_location || trip.pickup || "Pickup Location";
                    const dropoff = trip.drop_location || trip.dropoff || "Dropoff Location";
                    const rideType = trip.driver?.vehicle?.vehicle_type || trip.type || "Bike";
                    const isBike = rideType.toLowerCase() === "bike";
                    const fareText = trip.fare ? (String(trip.fare).startsWith("₹") ? trip.fare : `₹${trip.fare}`) : "₹0";
                    const dateText = trip.created_at
                      ? new Date(trip.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })
                      : trip.date || "Recent";

                    return (
                      <Card
                        key={trip.id}
                        className="bg-[#12121a] border border-white/10 hover:border-white/20 p-4 sm:p-5 rounded-2xl transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: Ride route & vehicle */}
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center flex-shrink-0 text-[#FFD700]">
                              {isBike ? <BikeIcon size={18} /> : <CarIcon size={18} />}
                            </div>

                            <div>
                              {/* Pickup & Drop */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white">{pickup}</span>
                                <span className="text-white/30 text-xs">→</span>
                                <span className="text-xs font-bold text-white">{dropoff}</span>
                              </div>

                              {/* Meta Info */}
                              <p className="text-[11px] text-white/40 m-0 mt-1 flex items-center gap-2 capitalize">
                                <span>{dateText}</span>
                                <span>•</span>
                                <span>{rideType} Ride</span>
                                <span>•</span>
                                <span className="font-mono text-white/30">#{trip.id}</span>
                              </p>
                            </div>
                          </div>

                          {/* Right: Price & Status */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                            <div className="text-right">
                              <span className="text-base font-black text-[#FFD700] block">{fareText}</span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full capitalize">
                                {trip.status || "Completed"}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5 text-[#FFD700] text-xs font-bold bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                              <StarIcon size={11} filled />
                              <span>{trip.rating || 5}.0</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
