"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rideId = searchParams.get("ride_id");
  const driverId = searchParams.get("driver_id");
  const driverName = searchParams.get("driver_name") || "your driver";

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (rideId) {
      fetch("/api/payment/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ride_id: Number(rideId) }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error("Failed to confirm payment on mount:", errData);
          } else {
            console.log("Payment status confirmed and ride completed successfully");
          }
        })
        .catch((err) => {
          console.error("Error confirming payment on mount:", err);
        });
    }
  }, [rideId]);

  const handleSubmitFeedback = async () => {
    if (!driverId) {
      router.push("/");
      return;
    }

    // If rider selected stars, submit them
    if (rating > 0) {
      setSubmitting(true);
      try {
        const resp = await fetch("/api/users/rating", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driver: Number(driverId),
            rating: rating,
            review: reviewText || "",
          }),
        });
        if (!resp.ok) {
          console.error("Failed to submit rating");
        }
      } catch (err) {
        console.error("Error submitting rating:", err);
      } finally {
        setSubmitting(false);
        router.push("/");
      }
    } else {
      // Just redirect if no rating selected
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center font-[Inter,system-ui,sans-serif] text-white p-4">
      <div className="max-w-md w-full bg-[#111118]/85 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] shadow-2xl text-center flex flex-col items-center gap-6 animate-[cardPop_0.5s_ease_both]">
        {/* Glow Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/10">
          ✓
        </div>
        
        <div>
          <h1 className="text-2xl font-black tracking-tight m-0 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Payment Received
          </h1>
          {rideId && (
            <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest mt-2 mb-0">
              Ride #{rideId} completed
            </p>
          )}
          <p className="text-xs text-white/45 mt-3 mb-0 leading-relaxed">
            Your transaction has been processed successfully.
          </p>
        </div>

        {/* Rating and Review Section (Only render if driver_id is present) */}
        {driverId && (
          <div className="w-full border-t border-b border-white/5 py-5 my-1 flex flex-col items-center gap-4">
            <p className="text-xs font-extrabold text-white/80 uppercase tracking-wider m-0">
              Rate your ride with {driverName}
            </p>
            
            {/* Stars Container */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="bg-transparent border-0 cursor-pointer p-0 transition-transform hover:scale-110 active:scale-95 outline-none"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill={star <= (hoverRating || rating) ? "#FFD700" : "none"}
                    stroke={star <= (hoverRating || rating) ? "#FFD700" : "rgba(255,255,255,0.2)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-150"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Optional Comment Input Box */}
            <textarea
              placeholder="Write a quick review about your trip... (optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-[#FFD700] rounded-xl p-3 text-xs text-white placeholder:text-white/25 outline-none transition-all resize-none"
            />
          </div>
        )}

        {/* Submit Feedback and Finish CTA */}
        <button
          onClick={handleSubmitFeedback}
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] font-black text-sm tracking-tight rounded-2xl shadow-xl shadow-[#FFD700]/10 hover:brightness-105 active:scale-[0.99] transition-all border-0 cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Submitting..." : rating > 0 ? "Submit Feedback & Return" : "Skip & Return"}
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-3 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
