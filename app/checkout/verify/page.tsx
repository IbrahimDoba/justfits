"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying"
  );
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setError("No payment reference provided");
      return;
    }

    verifyPayment(reference);
  }, [reference]);

  const verifyPayment = async (ref: string) => {
    try {
      const response = await fetch(`/api/payments/verify?reference=${ref}`);
      const data = await response.json();

      if (data.success && data.status === "success") {
        setStatus("success");
        setOrderNumber(data.data.orderNumber);

        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push(`/checkout/success?order=${data.data.orderNumber}`);
        }, 2000);
      } else {
        setStatus("failed");
        setError(data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("failed");
      setError("Failed to verify payment. Please contact support.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-sm text-center"
            >
              {status === "verifying" && (
                <>
                  <Loader2 className="w-16 h-16 text-black mx-auto mb-4 animate-spin" />
                  <h1 className="font-display text-2xl text-black mb-2">
                    Verifying Payment
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we confirm your payment...
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h1 className="font-display text-2xl text-black mb-2">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Your payment has been confirmed.
                  </p>
                  {orderNumber && (
                    <p className="text-sm text-gray-500">
                      Order Number: {orderNumber}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    Redirecting to order confirmation...
                  </p>
                </>
              )}

              {status === "failed" && (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h1 className="font-display text-2xl text-black mb-2">
                    Payment Failed
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {error || "We couldn't verify your payment."}
                  </p>
                  <button
                    onClick={() => router.push("/checkout")}
                    className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
