"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Logo } from "../components/Logo";

/* ─── SVG Icons ─────────────────────────────────────────── */
function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
  role: string;
  delay: string;
}

function RoleCard({
  emoji,
  title,
  subtitle,
  description,
  role,
  gradientFrom,
  gradientTo,
  delay,
}: RoleCardProps) {
  const router = useRouter();

  return (
    <div
      className="group relative bg-[#12121a]/80 backdrop-blur-xl border border-white/5 rounded-[24px] w-[290px] max-sm:w-full max-sm:max-w-[340px] overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:-translate-y-[8px] hover:shadow-[0_20px_50px_rgba(255,215,0,0.15)] hover:border-[#FFD700]/30 animate-card-pop"
      style={{ animationDelay: delay }}
      onClick={() => router.push(`/Auth?role=${role}`)}
    >
      {/* Top gradient strip */}
      <div
        className="h-[5px] w-full"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {/* Emoji bubble */}
      <div
        className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center mx-auto mt-6 transition-transform duration-300 group-hover:scale-[1.08] group-hover:-rotate-[4deg]"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}15, ${gradientTo}25)`,
          border: `1.5px solid ${gradientFrom}33`,
        }}
      >
        <span className="text-[36px] leading-none">{emoji}</span>
      </div>

      {/* Body */}
      <div className="px-6 pt-5 pb-3 text-left">
        <p className="text-[11px] font-semibold tracking-[1.2px] uppercase text-[#FFD700] mb-[6px]">
          {subtitle}
        </p>
        <h2 className="text-[22px] font-extrabold text-white mb-[10px] tracking-[-0.4px]">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-white/60">{description}</p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <Button
          className="w-full h-[44px] text-sm font-semibold tracking-[0.2px] rounded-xl text-black hover:-translate-y-px transition-all flex items-center justify-center gap-1 shadow-lg shadow-[#FFD700]/10 hover:shadow-[#FFD700]/25 font-bold"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          }}
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
    <div className="flex items-center gap-[7px] text-[13px] font-medium text-white/60">
      <span className="text-[#FFD700] flex">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0a0f] text-white">
      {/* ── Animated background blobs ── */}
      <div className="fixed rounded-full blur-[100px] opacity-[0.15] pointer-events-none w-[520px] h-[520px] bg-[#FFD700] top-[-160px] left-[-160px] animate-blob-float" />
      <div className="fixed rounded-full blur-[100px] opacity-[0.12] pointer-events-none w-[380px] h-[380px] bg-[#FF8C00] top-[40%] right-[-120px] [animation:blobFloat_8s_ease-in-out_infinite] [animation-delay:-3s]" />
      <div className="fixed rounded-full blur-[100px] opacity-[0.08] pointer-events-none w-[280px] h-[280px] bg-[#d97706] bottom-[-80px] left-[30%] [animation:blobFloat_12s_ease-in-out_infinite] [animation-delay:-6s]" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 px-10 py-5 max-sm:px-5 max-sm:py-4">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" role="ride smarter" />

          {/* Nav links */}
          <div className="flex items-center gap-7 max-sm:gap-4">
            <a
              href="#"
              className="text-sm font-medium text-white/60 no-underline hover:text-[#FFD700] transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-sm font-medium text-white/60 no-underline hover:text-[#FFD700] transition-colors"
            >
              Safety
            </a>
            <span
              className="text-[13px] font-bold text-black px-4 py-[6px] rounded-full cursor-pointer hover:bg-[#ffe34d] transition-colors shadow-lg shadow-[#FFD700]/10"
              style={{
                background: "#FFD700",
              }}
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
          className="font-extrabold tracking-[-1.5px] leading-[1.1] text-white mb-4 max-sm:tracking-[-1px] [animation:fadeSlideDown_0.6s_ease_0.1s_both]"
          style={{ fontSize: "clamp(36px, 6vw, 62px)" }}
        >
          Move freely.{" "}
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#FF8C00]"
          >
            Ride safely.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-white/60 font-normal mb-[52px] [animation:fadeSlideDown_0.6s_ease_0.2s_both]"
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
            gradientFrom="#FFD700"
            gradientTo="#FF8C00"
            delay="0ms"
          />
          <RoleCard
            emoji="🛵"
            title="I'm a Driver"
            subtitle="Captain"
            description="Earn on your own schedule. Be your own boss with flexible hours."
            role="driver"
            gradientFrom="#FF8C00"
            gradientTo="#d97706"
            delay="80ms"
          />
        </div>

        {/* Trust Pills */}
        <div className="flex items-center gap-4 flex-wrap justify-center [animation:fadeSlideUp_0.7s_ease_0.5s_both]">
          <TrustPill icon={<ShieldIcon />} label="Safe rides" />
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <TrustPill icon={<StarIcon />} label="Verified drivers" />
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <TrustPill icon={<ZapIcon />} label="Easy booking" />
        </div>
      </main>
    </div>
  );
}
