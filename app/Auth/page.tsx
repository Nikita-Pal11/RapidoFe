"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Chip, Spinner, Alert, InputOTP } from "@heroui/react";

/* ─── tiny SVG icons (no extra deps) ─── */
const MailIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);
const ArrowRight = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      d="M5 12h14M13 6l6 6-6 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const RefreshIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" strokeLinecap="round" />
  </svg>
);

function Auth() {
  const searchparams = useSearchParams();
  const role = searchparams.get("role");
  const router = useRouter();

  const [email, setemail] = useState("");
  const [isotpsent, setisotp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDriver = role === "driver";
  const progress = (timer / 120) * 100;
  const R = 20;
  const C = 2 * Math.PI * R;
  const dash = (progress / 100) * C;

  async function sendotp() {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/auth/send-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail ?? "Failed to send OTP");
        return;
      }
      setisotp(true);
      setTimer(120);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyotp() {
    if (otpValue.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/auth/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue, role }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail ?? "Invalid OTP. Try again.");
        return;
      }
      setTimer(0);
      if (role === "driver") {
        router.push(data.driver ? "/" : "/Driver/Onboarding");
      } else {
        router.push("/");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetToEmail() {
    setOtpValue("");
    setisotp(false);
    setError("");
  }

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const mm = Math.floor(timer / 60)
    .toString()
    .padStart(2, "0");
  const ss = (timer % 60).toString().padStart(2, "0");

  return (
    <div className="flex min-h-screen bg-[#0f0d1a] font-[Inter,system-ui,sans-serif]">
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/auth.png"
            alt="Night city ride"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0d1aee] via-[#1a1630bb] to-[#6c4bf430]" />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0f0d1a] via-[#0f0d1a88] to-transparent" />
        </div>

        <div className="absolute top-20 right-16 w-72 h-72 rounded-full bg-[#6c4bf4] opacity-[0.12] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-32 left-8 w-56 h-56 rounded-full bg-[#9b7bff] opacity-[0.10] blur-[60px] pointer-events-none" />

        <div className="relative z-10 p-10">
          <AahiLogo />
        </div>

        <div className="relative z-10 p-10 pb-14 animate-[fadeSlideUp_0.7s_ease_both]">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">
              Live in your city
            </span>
          </div>

          <h2 className="text-[3.2rem] font-black text-white leading-[1.08] tracking-[-1.5px] mb-5">
            Your city,
            <br />
            <span className="bg-gradient-to-r from-[#9b7bff] to-[#c084fc] bg-clip-text text-transparent">
              your pace.
            </span>
          </h2>

          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm">
            Fast, affordable rides at your fingertips. Join millions who ride
            smarter every day.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f8f7fc] lg:bg-white">
        <div className="w-full max-w-[420px] animate-[cardPop_0.5s_ease_both]">
          <div className="flex lg:hidden mb-8">
            <AahiLogo dark />
          </div>

          <Chip
            className={`mb-5 font-semibold text-xs px-3 py-1 rounded-full border ${
              isDriver
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-violet-50 text-violet-700 border-violet-200"
            }`}
          >
            {isDriver ? "🏍️  Driver Login" : "🙋  Rider Login"}
          </Chip>

          <h1 className="text-[1.9rem] font-black text-[#17151f] leading-tight tracking-tight mb-2">
            {isotpsent ? "Check your inbox" : "Welcome back"}
          </h1>
          <p className="text-sm text-[#6b6880] leading-relaxed mb-8">
            {isotpsent ? (
              <>
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-[#17151f]">{email}</span>
              </>
            ) : (
              "Sign in or create your account — no password needed."
            )}
          </p>

          {!isotpsent && (
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#17151f] mb-2 tracking-wide uppercase"
              >
                Email address
              </label>
              <div
                className={`flex items-center gap-3 rounded-2xl border bg-[#f8f7fc] px-4 py-0 transition-all duration-200
                  ${error ? "border-red-300 ring-2 ring-red-100" : "border-[#e9e6f2] focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100"}`}
              >
                <span className="text-[#a09cb8]">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setemail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendotp()}
                  autoComplete="email"
                  className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-[#17151f] placeholder:text-[#c4bedd] py-4 font-[inherit]"
                />
              </div>
            </div>
          )}

          {isotpsent && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#17151f] mb-4 tracking-wide uppercase">
                Verification code
              </label>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  pattern="^\d+$"
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    setError("");
                  }}
                  isInvalid={!!error}
                  className="gap-2"
                >
                  <InputOTP.Group className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTP.Slot
                        key={i}
                        index={i}
                        className={`w-12 h-14 rounded-2xl border-2 text-center text-xl font-bold transition-all duration-200
                          ${error ? "border-red-300 bg-red-50" : "border-[#e9e6f2] bg-[#f8f7fc] focus:border-violet-500 focus:bg-violet-50 focus:shadow-[0_0_0_4px_rgba(108,75,244,0.12)]"}`}
                      />
                    ))}
                  </InputOTP.Group>
                </InputOTP>
              </div>

              <div className="mt-5">
                {timer > 0 ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8f7fc] border border-[#e9e6f2]">
                    <svg
                      width="44"
                      height="44"
                      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r={R}
                        fill="none"
                        stroke="#e9e6f2"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r={R}
                        fill="none"
                        stroke="#6c4bf4"
                        strokeWidth="3"
                        strokeDasharray={`${dash} ${C}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1s linear" }}
                      />
                    </svg>
                    <div>
                      <p className="text-xs text-[#6b6880] font-medium">
                        Code expires in
                      </p>
                      <p className="text-lg font-bold text-[#6c4bf4] tabular-nums">
                        {mm}:{ss}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-[#a09cb8]">Sent to</p>
                      <p className="text-xs font-semibold text-[#17151f] truncate max-w-[120px]">
                        {email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-2 border-dashed border-violet-300 text-violet-700 font-semibold text-sm py-3 gap-2 hover:bg-violet-50 transition-colors"
                    onPress={() => {
                      setOtpValue("");
                      setisotp(false);
                      setError("");
                      setTimer(0);
                    }}
                  >
                    <RefreshIcon /> Resend OTP
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* {error && (
            <Alert status="error" className="mb-4 rounded-2xl border border-red-200 bg-red-50">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description className="text-red-700 text-sm font-medium">{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )} */}

          <Button
            id="auth-cta"
            fullWidth
            isDisabled={loading}
            onPress={isotpsent ? verifyotp : sendotp}
            className="rounded-2xl py-4 text-base font-bold text-white bg-gradient-to-r from-[#6c4bf4] to-[#9b7bff] shadow-[0_6px_24px_rgba(108,75,244,0.38)] hover:shadow-[0_8px_32px_rgba(108,75,244,0.5)] hover:-translate-y-0.5 transition-all duration-200 mb-5 gap-2.5"
          >
            {loading ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <>
                {isotpsent ? "Verify & Continue" : "Send OTP"}
                <ArrowRight />
              </>
            )}
          </Button>

          {isotpsent && (
            <p className="text-center text-xs text-[#6b6880] mb-4">
              Wrong email?{" "}
              <button
                onClick={resetToEmail}
                className="text-violet-600 font-semibold hover:underline"
              >
                Change it
              </button>
            </p>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#e9e6f2]" />
            <span className="text-xs text-[#a09cb8] font-medium">or</span>
            <div className="flex-1 h-px bg-[#e9e6f2]" />
          </div>

          <a
            href={`/Auth?role=${isDriver ? "rider" : "driver"}`}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-[#e9e6f2] py-3.5 text-sm font-semibold text-[#6b6880] hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all duration-200"
          >
            {isDriver ? "🙋 Switch to Rider" : "🏍️ Switch to Driver"}
          </a>

          <p className="text-center text-xs text-[#a09cb8] mt-6 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-violet-600">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-violet-600">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function AahiLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#6c4bf4] to-[#9b7bff] shadow-[0_4px_14px_rgba(108,75,244,0.45)]">
        <img src="/logo.png" alt="" className="w-18 h-12" />
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`text-xl font-black tracking-[-0.5px] ${
            dark
              ? "text-[#17151f]"
              : "bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
          }`}
        >
          aahi
        </span>
        <span
          className={`text-[10px] font-semibold tracking-widest uppercase ${
            dark ? "text-[#a09cb8]" : "text-white/50"
          }`}
        >
          ride smarter
        </span>
      </div>
    </div>
  );
}

export default Auth;
