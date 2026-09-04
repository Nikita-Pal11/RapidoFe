"use client";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import OnboardingStep1 from "../../components/Driver/OnboardingStep1";
import { Logo } from "../../components/Logo";
import {
  PhoneIcon,
  ArrowRightIcon,
  CheckIcon,
  UserIcon,
  CameraIcon,
} from "../../components/Driver/icons";

const GENDER_OPTIONS = [
  { value: "male", label: "Male", icon: "👨" },
  { value: "female", label: "Female", icon: "👩" },
  { value: "other", label: "Other", icon: "🧑" },
];

export default function OnBoarding() {
  const router = useRouter();
  const [firstname, setfirstname] = useState("");
  const [lastname, setlastname] = useState("");
  const [phone, setphone] = useState("");
  const [gender, setgender] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setstep] = useState(0);
  const [vehicleid, setvehicleid] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  }

  function handleRemovePhoto() {
    setProfilePhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function DriverProfile() {
    const trimmedFirstName = firstname.trim();
    if (!trimmedFirstName) {
      setError("Please enter your first name");
      return;
    }
    if (trimmedFirstName.length < 3) {
      setError("First name must be at least 3 characters");
      return;
    }
    if (!gender) {
      setError("Please select your gender");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("first_name", trimmedFirstName);
      formData.append("last_name", lastname.trim());
      formData.append("gender", gender);
      formData.append("phone", phone.trim());
      if (vehicleid) {
        formData.append("vehicle_id", String(vehicleid));
      }
      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      const res = await fetch("/api/users/driver/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail ?? data?.message ?? data?.error ?? "Failed to save profile");
        return;
      }
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-[Inter,system-ui,sans-serif] bg-[#0a0a0f] text-white">
      {step === 0 && (
        <OnboardingStep1 setstep={setstep} setvehicleid={setvehicleid} />
      )}

      {step === 1 && (
        <div className="min-h-screen flex flex-col justify-between">
          {/* ── Header ──────────────────────────────────────── */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
            <Logo size="md" role="captain onboarding" />

            <button
              onClick={() => setstep(0)}
              className="text-xs font-semibold text-white/60 hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              ← Back to Step 1
            </button>
          </header>

          {/* ── Progress bar ────────────────────────────────── */}
          <div className="px-5 pt-6 pb-2 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FFD700]">
                  Step 2 of 2
                </span>
                <span className="text-xs text-white/40">
                  — Personal Details
                </span>
              </div>
              <span className="text-xs font-semibold text-[#FFD700]">100%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#d97706] to-[#FFD700] transition-all duration-500 w-full" />
            </div>
          </div>

          {/* ── Main Form Content ───────────────────────────── */}
          <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight text-white m-0 mb-1">
                  Complete Profile
                </h1>
                <p className="text-sm text-white/50 m-0">
                  Provide your personal details to finish captain registration.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2 animate-shake">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Profile Photo Upload */}
              <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="relative group">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-white/[0.06] border-2 border-dashed border-white/20 hover:border-[#FFD700] flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 shadow-md group-hover:scale-105"
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white/40 group-hover:text-[#FFD700] transition-colors">
                        <CameraIcon size={24} />
                      </div>
                    )}
                  </div>

                  {/* Small Camera Badge */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-[#FFD700] text-black rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform cursor-pointer border border-black/40"
                    title="Upload photo"
                  >
                    <CameraIcon size={12} />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                      Profile Photo
                    </span>
                    <span className="text-xs text-white/30 lowercase font-normal">(optional)</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1 mb-2">
                    Upload a clear photo. JPG, PNG up to 5MB.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#FFD700] hover:text-[#FFA500] bg-[#FFD700]/10 hover:bg-[#FFD700]/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {photoPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Full Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {/* First Name (Required, at least 3 chars) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/45 mb-2">
                    First Name <span className="text-[#FFD700]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-white/40 flex items-center pointer-events-none">
                      <UserIcon size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. John"
                      value={firstname}
                      onChange={(e) => {
                        setfirstname(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-white/[0.04] border border-white/10 text-white text-base font-semibold pl-10 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder:text-white/25 placeholder:text-sm placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Last Name (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/45 mb-2">
                    Last Name <span className="text-white/30 lowercase font-normal">(optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-white/40 flex items-center pointer-events-none">
                      <UserIcon size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Doe"
                      value={lastname}
                      onChange={(e) => {
                        setlastname(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-white/[0.04] border border-white/10 text-white text-base font-semibold pl-10 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder:text-white/25 placeholder:text-sm placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Gender Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/45 mb-2.5">
                  Select Gender <span className="text-[#FFD700]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((g) => {
                    const isSelected = gender === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => {
                          setgender(g.value);
                          setError("");
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-[#FFD700] text-[#0a0a0f] border-[#FFD700] shadow-lg shadow-[#FFD700]/25 -translate-y-0.5 font-extrabold"
                            : "bg-white/[0.04] text-white border-white/10 hover:bg-white/[0.08] font-semibold"
                        }`}
                      >
                        <span className="text-2xl mb-1">{g.icon}</span>
                        <span className="text-xs">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/45 mb-2">
                  Phone Number <span className="text-[#FFD700]">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-white/40 flex items-center gap-1.5 text-sm font-semibold pointer-events-none">
                    <PhoneIcon size={16} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setphone(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-white/[0.04] border border-white/10 text-white text-base font-semibold pl-16 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder:text-white/25"
                  />
                </div>
              </div>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-4 mb-4">
              <button
                onClick={DriverProfile}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-base tracking-tight transition-all border-0 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-white/10 text-white/40 cursor-wait"
                    : "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] shadow-xl shadow-[#FFD700]/30 hover:brightness-105 active:scale-[0.99] cursor-pointer"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Saving Profile…</span>
                  </>
                ) : (
                  <>
                    <span>Save & Finish</span>
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}