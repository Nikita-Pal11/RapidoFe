"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Spinner } from "@heroui/react";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import {
  BikeIcon,
  CarIcon,
  VanIcon,
  TaxiIcon,
  StarIcon,
  PhoneIcon,
  UserIcon,
  CameraIcon,
  EditIcon,
  LogOutIcon,
  CheckIcon,
} from "../components/Driver/icons";

interface driverType {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  gender: string;
  profilePhoto: string;
  rating: number;
  totalRides: number;
  vehicle: {
    number: string;
    type: string;
    color: string;
  };
}

export default function DriverProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Driver Details State (No hardcoded dummy data)
  const [driverData, setDriverData] = useState<driverType>({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    gender: "",
    profilePhoto: "",
    rating: 5.0,
    totalRides: 0,
    vehicle: {
      number: "",
      type: "bike",
      color: "",
    },
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "male",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/users/profile/");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const u = data.user || {};
            const v = data.vehicle || {};
            const fName = u.first_name || "";
            const lName = u.last_name || "";
            const uName = u.username || "";
            const ph = data.phone || "";
            const em = u.email || "";
            const gen = data.gender || "male";

            setDriverData({
              firstName: fName,
              lastName: lName,
              username: uName,
              phone: ph,
              email: em,
              gender: gen,
              profilePhoto: data.profile_photo || "",
              rating: data.rating,
              totalRides: 0,
              vehicle: {
                number: v.vehicle_number || "",
                type: v.vehicle_type || "bike",
                color: v.color || "",
              },
            });

            setEditForm({
              firstName: fName,
              lastName: lName,
              phone: ph,
              gender: gen,
            });
          }
        }
      } catch (err) {
        console.log("Profile load fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5MB");
      return;
    }

    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSaveProfile() {
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("first_name", editForm.firstName.trim());
      formData.append("last_name", editForm.lastName.trim());
      formData.append("phone", editForm.phone.trim());
      formData.append("gender", editForm.gender);

      if (photoFile) {
        formData.append("profile_photo", photoFile);
      }

      const res = await fetch("/api/users/driver/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.message || data?.detail || "Failed to save profile");
        return;
      }

      const updated = await res.json();

      setDriverData((prev) => ({
        ...prev,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        gender: editForm.gender,
        profilePhoto: updated.profile_photo || photoPreview || prev.profilePhoto,
      }));

      setPhotoFile(null);
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

  const getVehicleIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "bike":
        return <BikeIcon size={22} className="text-[#FFD700]" />;
      case "car":
        return <CarIcon size={22} className="text-[#FFD700]" />;
      case "van":
        return <VanIcon size={22} className="text-[#FFD700]" />;
      case "taxi":
        return <TaxiIcon size={22} className="text-[#FFD700]" />;
      default:
        return <BikeIcon size={22} className="text-[#FFD700]" />;
    }
  };

  // Name resolution: if no first & last name, fallback to username
  const fullName = [driverData.firstName, driverData.lastName].filter(Boolean).join(" ");
  const displayName = fullName || driverData.username || "Captain";
  const avatarLetter = (driverData.firstName || driverData.username || "C").charAt(0).toUpperCase();

  function getMediaUrl(url: string | null | undefined): string {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return url.startsWith("/") ? url : `/${url}`;
  }

  const currentPhoto = photoPreview || driverData.profilePhoto;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-[Inter,system-ui,sans-serif]">
      {/* ── Hidden File Input ─────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        className="hidden"
      />

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
          <Logo size="sm" role="captain profile" />
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner color="warning" />
          </div>
        ) : (
          <>
            {/* ── Driver Details Card ─────────────────────────── */}
            <Card className="bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Subtle gold glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar / Photo with Camera Quick Button */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#d97706] to-[#FFD700] shadow-lg shadow-[#FFD700]/15">
                    <div className="w-full h-full rounded-[14px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                      {currentPhoto ? (
                        <img
                          src={getMediaUrl(currentPhoto)}
                          alt="Driver Photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-black text-[#FFD700]">
                          {avatarLetter}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Change Photo Badge button */}
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      fileInputRef.current?.click();
                    }}
                    title="Change Profile Photo"
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FFD700] hover:bg-[#FFA500] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 border border-black/40 cursor-pointer"
                  >
                    <CameraIcon size={13} />
                  </button>
                </div>

                {/* Driver Details */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h1 className="text-2xl font-black text-white tracking-tight m-0">
                          {displayName}
                        </h1>
                        <span className="text-[10px] font-black bg-[#FFD700] text-black px-2 py-0.5 rounded-full">
                          CAPTAIN
                        </span>
                      </div>
                      {driverData.username && fullName && (
                        <p className="text-xs text-white/40 m-0 mt-0.5">@{driverData.username}</p>
                      )}
                      <p className="text-xs text-white/50 m-0 mt-0.5 capitalize">
                        {driverData.gender ? `${driverData.gender} • ` : ""}Driver Profile
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onPress={() => {
                        setIsEditing(!isEditing);
                        if (isEditing) {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }
                      }}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl px-3.5 py-1.5 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer self-center sm:self-auto"
                    >
                      <EditIcon size={13} />
                      <span>{isEditing ? "Close" : "Edit Profile"}</span>
                    </Button>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/5">
                    {/* Phone */}
                    <div className="flex items-center gap-2.5 text-xs text-white/70">
                      <span className="text-white/40"><PhoneIcon size={14} /></span>
                      {driverData.phone ? (
                        <span className="font-semibold">+91 {driverData.phone}</span>
                      ) : (
                        <span className="text-white/30 italic">No phone added</span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2.5 text-xs text-white/70">
                      <span className="text-white/40">✉️</span>
                      {driverData.email ? (
                        <span className="font-semibold truncate">{driverData.email}</span>
                      ) : (
                        <span className="text-white/30 italic">No email linked</span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2.5 text-xs text-white/70">
                      <span className="text-[#FFD700]"><StarIcon size={14} filled /></span>
                      <span>
                        Rating: <strong className="text-[#FFD700]">{driverData?.rating}</strong>
                      </span>
                    </div>

                    {/* Verification Status */}
                    <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-semibold">
                      <CheckIcon size={14} />
                      <span>KYC & Background Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Inline Edit Form ────────────────────────────── */}
              {isEditing && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-5 animate-fade-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 m-0">
                    Update Driver Details
                  </h3>

                  {/* ── Profile Photo Upload Section ────────────── */}
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="w-16 h-16 rounded-xl bg-[#0a0a0f] border border-white/15 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {currentPhoto ? (
                        <img
                          src={getMediaUrl(currentPhoto)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={24} className="text-white/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white m-0">Profile Picture</p>
                      <p className="text-[11px] text-white/40 m-0 mt-0.5">
                        JPG, PNG, or WebP (Max 5MB)
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          onPress={() => fileInputRef.current?.click()}
                          className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-lg px-3 py-1 cursor-pointer flex items-center gap-1.5"
                        >
                          <CameraIcon size={12} />
                          <span>{currentPhoto ? "Change Photo" : "Upload Photo"}</span>
                        </Button>

                        {photoPreview && (
                          <button
                            onClick={handleRemovePhoto}
                            className="text-[11px] text-red-400 hover:text-red-300 font-semibold bg-transparent border-0 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

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
                        Gender
                      </label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full bg-[#161622] border border-white/10 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFD700]"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button
                      size="sm"
                      onPress={() => {
                        setIsEditing(false);
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
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

            {/* ── Vehicle Details Card ────────────────────────── */}
            <Card className="bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 m-0">
                  Registered Vehicle
                </h2>
                <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckIcon size={10} />
                  Active
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center">
                    {getVehicleIcon(driverData.vehicle.type)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white m-0 capitalize">
                      {driverData.vehicle.color ? `${driverData.vehicle.color} ` : ""}{driverData.vehicle.type || "Vehicle"}
                    </p>
                    <p className="text-xs text-white/40 m-0 mt-0.5">Commercial Taxi / Ride Vehicle</p>
                  </div>
                </div>

                {/* Indian Number Plate */}
                {driverData.vehicle.number ? (
                  <div className="inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/15 rounded-xl px-4 py-2">
                    <div className="bg-[#FFD700] text-black text-[9px] font-black px-1.5 py-0.5 rounded">
                      IND
                    </div>
                    <span className="font-mono font-black text-sm tracking-wider text-white">
                      {driverData.vehicle.number}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-white/30 italic">No number plate registered</span>
                )}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}