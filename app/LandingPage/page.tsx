"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

/* ─── SVG Icons ─────────────────────────────────────────── */
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/* ─── Role Card ─────────────────────────────────────────── */
interface RoleCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  role:string
  delay: string;
}

function RoleCard({ emoji, title, subtitle, description,role, gradientFrom, gradientTo, delay }: RoleCardProps) {
  const router = useRouter();

  return (
    <div
      className="group relative bg-white border border-[#E9E6F2] rounded-[20px] w-[280px] max-sm:w-full max-sm:max-w-[340px] overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_1px_4px_rgba(108,75,244,0.06)] hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(108,75,244,0.18)] hover:border-[rgba(108,75,244,0.25)] animate-card-pop"
      style={{ animationDelay: delay }}
      onClick={() => router.push(`/Auth?role=${role}`)}
    >
      {/* Top gradient strip */}
      <div
        className="h-[5px] w-full"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />

      {/* Emoji bubble */}
      <div
        className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center mx-auto mt-6 transition-transform duration-300 group-hover:scale-[1.08] group-hover:-rotate-[4deg]"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}33)`,
          border: `1.5px solid ${gradientFrom}44`,
        }}
      >
        <span className="text-[36px] leading-none">{emoji}</span>
      </div>

      {/* Body */}
      <div className="px-6 pt-5 pb-3 text-left">
        <p className="text-[11px] font-semibold tracking-[1.2px] uppercase text-text-muted mb-[6px]">
          {subtitle}
        </p>
        <h2 className="text-[22px] font-extrabold text-text-main mb-[10px] tracking-[-0.4px]">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-text-muted">{description}</p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <Button
          className="w-full h-[44px] text-sm font-semibold tracking-[0.2px] rounded-xl text-white shadow-[0_4px_16px_rgba(108,75,244,0.25)] hover:shadow-[0_6px_24px_rgba(108,75,244,0.38)] hover:-translate-y-px transition-all flex items-center justify-center gap-1"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          onClick={() => router.push(`/Auth?role=${role}`)}
        >
          Continue <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}

/* ─── Trust Pill ─────────────────────────────────────────── */
function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-[7px] text-[13px] font-medium text-text-muted">
      <span className="text-primary flex">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-bg">

      {/* ── Animated background blobs ── */}
      <div className="fixed rounded-full blur-[80px] opacity-[0.18] pointer-events-none w-[520px] h-[520px] bg-primary top-[-160px] left-[-160px] animate-blob-float" />
      <div className="fixed rounded-full blur-[80px] opacity-[0.18] pointer-events-none w-[380px] h-[380px] bg-accent top-[40%] right-[-120px] [animation:blobFloat_8s_ease-in-out_infinite] [animation-delay:-3s]" />
      <div className="fixed rounded-full blur-[80px] opacity-[0.12] pointer-events-none w-[280px] h-[280px] bg-primary-light bottom-[-80px] left-[30%] [animation:blobFloat_12s_ease-in-out_infinite] [animation-delay:-6s]" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 px-10 py-5 max-sm:px-5 max-sm:py-4">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Raahi logo"
              className="h-16 w-16 object-contain"
            />
            <span
              className="text-[22px] font-extrabold tracking-[-0.5px] bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6C4BF4, #FF6B81)" }}
            >
              aahi
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-7 max-sm:gap-4">
            <a href="#" className="text-sm font-medium text-text-muted no-underline hover:text-primary transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-text-muted no-underline hover:text-primary transition-colors">
              Safety
            </a>
            <span
              className="text-[13px] font-semibold text-white px-4 py-[6px] rounded-full cursor-pointer"
              style={{ background: "linear-gradient(135deg, #6C4BF4, #9B7BFF)" }}
            >
              Download App
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center max-sm:px-4 max-sm:py-6">



        {/* Headline */}
        <h1
          className="font-extrabold tracking-[-1.5px] leading-[1.1] text-text-main mb-4 max-sm:tracking-[-1px] [animation:fadeSlideDown_0.6s_ease_0.1s_both]"
          style={{ fontSize: "clamp(36px, 6vw, 62px)" }}
        >
          Move freely.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #6C4BF4, #FF6B81)" }}
          >
            Ride safely.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-text-muted font-normal mb-[52px] [animation:fadeSlideDown_0.6s_ease_0.2s_both]"
          style={{ fontSize: "clamp(15px, 2.5vw, 19px)" }}
        >
          Your journey starts with just one tap.
        </p>

        {/* Role Cards */}
        <div className="flex gap-6 justify-center flex-wrap mb-11 max-sm:gap-4 [animation:fadeSlideUp_0.7s_ease_0.3s_both]">
          <RoleCard
            emoji="🚗"
            title="I'm a Rider"
            subtitle="Passenger"
            description="Book a ride quickly & safely. Reach your destination in comfort."
            role="rider"
            gradientFrom="#6C4BF4"
            gradientTo="#9B7BFF"
            delay="0ms"
          />
          <RoleCard
            emoji="🛵"
            title="I'm a Driver"
            subtitle="Captain"
            description="Earn on your own schedule. Be your own boss with flexible hours."
            role="driver"
            gradientFrom="#FF6B81"
            gradientTo="#FF9CAA"
            delay="80ms"
          />
        </div>

        {/* Trust Pills */}
        <div className="flex items-center gap-4 flex-wrap justify-center [animation:fadeSlideUp_0.7s_ease_0.5s_both]">
          <TrustPill icon={<ShieldIcon />} label="Safe rides" />
          <div className="w-1 h-1 rounded-full bg-[#E9E6F2]" />
          <TrustPill icon={<StarIcon />} label="Verified drivers" />
          <div className="w-1 h-1 rounded-full bg-[#E9E6F2]" />
          <TrustPill icon={<ZapIcon />} label="Easy booking" />
        </div>
      </main>
    </div>
  );
}
