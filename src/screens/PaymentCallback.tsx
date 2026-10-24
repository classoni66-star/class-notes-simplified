import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallback({ navigate }: any) {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      // Get the orderTrackingId from the URL
      const params = new URLSearchParams(window.location.search);
      const orderTrackingId = params.get("OrderTrackingId");

      if (!orderTrackingId) {
        setStatus("failed");
        return;
      }

      try {
        // Ask our backend to verify with Pesapal
        const res = await fetch("/api/pesapal/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderTrackingId }),
        });
        const data = await res.json();

        if (data.status === "Completed") {
          // 🎉 UNLOCK PREMIUM!
          const pendingPlan = JSON.parse(localStorage.getItem("smartsale_pending_plan") || "null");
          
          let hoursToAdd = 24; // Default to 1 day
          if (pendingPlan) {
            if (pendingPlan.name === "Daily Unlimited") hoursToAdd = 24;
            if (pendingPlan.name === "Weekly Unlimited") hoursToAdd = 24 * 7;
            if (pendingPlan.name === "Monthly Unlimited") hoursToAdd = 24 * 30;
          }

          const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
          const newPremium = Math.max(Date.now(), currentPremium) + (hoursToAdd * 60 * 60 * 1000);
          
          localStorage.setItem("smartsale_premium_until", newPremium.toString());
          localStorage.removeItem("smartsale_pending_plan");
          
          setStatus("success");
          
          // Redirect home after 3 seconds
          setTimeout(() => {
            navigate("home");
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 3000);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [navigate]);

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#F3F4F6] text-center">
      {status === "loading" && (
        <>
          <Loader2 size={64} className="text-[#FF9800] animate-spin mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Verifying Payment...</h1>
          <p className="text-gray-500">Please wait while we confirm with Pesapal.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle size={64} className="text-green-500 mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-8">Your Premium features have been unlocked. Enjoy SmartSale!</p>
          <button onClick={() => navigate("home")} className="bg-[#FF9800] text-white px-8 py-3 rounded-xl font-bold shadow-md">
            Go to Dashboard
          </button>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle size={64} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-gray-500 mb-8">We could not verify your payment. If you were charged, please contact support.</p>
          <button onClick={() => navigate("buyStorage")} className="bg-[#FF9800] text-white px-8 py-3 rounded-xl font-bold shadow-md">
            Try Again
          </button>
        </>
      )}
    </div>
  );
                                        }
