"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";

// Load Stripe promise using config publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51U9VxqRqiMQ5RcL6LSLTmn2BTfiVBu0lK1QQMS9c1hPE9QEDqI1LuGc0to3s0lFH35OWPVcueLSeViGVHukYs9SY00yyXCPJD3"
);

// 1. The actual Payment Form Component
const CheckoutForm = ({ 
  ride_id, 
  amount, 
  driver_id, 
  driver_name 
}: { 
  ride_id: number; 
  amount: number; 
  driver_id?: number; 
  driver_name?: string; 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    // Pass driver details in return_url params so success page can display rating form
    const returnUrl = `${window.location.origin}/payment-success?ride_id=${ride_id}` +
      `&driver_id=${driver_id || ""}` +
      `&driver_name=${encodeURIComponent(driver_name || "Driver")}`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {errorMessage && (
        <div className="text-red-500 text-xs font-semibold bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
          {errorMessage}
        </div>
      )}
      <button
        disabled={!stripe || loading}
        className="w-full py-4 mt-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a0f] font-extrabold text-base rounded-2xl shadow-xl shadow-[#FFD700]/15 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
      >
        {!loading ? `Pay ₹${amount}` : "Processing..."}
      </button>
    </form>
  );
};

// 2. The Main Container Component
const CheckoutPage = ({ 
  ride_id, 
  driver_id, 
  driver_name 
}: { 
  ride_id: number; 
  driver_id?: number; 
  driver_name?: string; 
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ride_id }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to initialize payment");
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        if (data.payment) {
          setAmount(Number(data.payment.amount));
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load payment portal");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ride_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3">
        <div className="w-8 h-8 border-3 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
        <p className="text-white/60 text-xs font-semibold">Initializing Stripe checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-500/5 border border-red-500/10 rounded-2xl">
        <p className="text-red-400 text-sm font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111118]/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[28px] max-w-md w-full shadow-2xl animate-[cardPop_0.4s_ease_both]">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-black text-white">Ride Payment</h2>
        <p className="text-xs text-white/50 mt-1">Please enter your payment details to complete the ride</p>
      </div>
      
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#FFD700",
                colorBackground: "#111118",
                colorText: "#ffffff",
                colorDanger: "#ef4444",
                fontFamily: "Inter, system-ui, sans-serif",
                spacingUnit: "4px",
                borderRadius: "12px",
              },
            },
          }}
        >
          <CheckoutForm 
            ride_id={ride_id} 
            amount={amount} 
            driver_id={driver_id} 
            driver_name={driver_name} 
          />
        </Elements>
      )}
    </div>
  );
};

export default CheckoutPage;
