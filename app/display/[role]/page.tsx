"use client";

import { useEffect, useState } from "react";

export default function DisplayPage() {
  const [orders, setOrders] = useState<any[]>([]);

const fetchOrders = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(`/api/orders?date=${today}`);

    if (!res.ok) {
      console.error("API ERROR:", res.status);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) return;

    setOrders(data);
  } catch (err) {
    console.error("FETCH FAILED:", err);
  }
};

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
  <div
  style={{
    minHeight: "100vh",

    // 🔥 BACKGROUND IMAGE
    backgroundImage: "url('/bg.jpg')", // ← put your image in /public
    backgroundSize: "cover",
    backgroundPosition: "center",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",

    position: "relative",
  }}
>
  <div
  style={{
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(220,220,220,0.8))",
    backdropFilter: "blur(4px)",
  }}
/>
<div style={{ position: "relative", zIndex: 2 }}>
  {/* your existing glass card */}
</div>
    {(() => {
      const current = orders.find(
        (o: any) => o.status === "serving"
      );

      return (
        <div
          style={{
            width: 420,
            padding: 40,
            borderRadius: 20,

            // 🔥 GLASS
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",

            border: "1px solid rgba(255,255,255,0.4)",

            boxShadow:
              "0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",

            textAlign: "center",
          }}
        >
          {/* LOGO */}
          <img
            src="/logo.png"
            style={{
              height: 50,
              opacity: 0.6,
              marginBottom: 20,
            }}
          />

          {/* LABEL */}
          <div
            style={{
              fontSize: 12,
              letterSpacing: 3,
              color: "#6b6b6b",
              marginBottom: 10,
            }}
          >
            NOW SERVING
          </div>

          {/* MAIN STATE */}
          {!current ? (
            <div
              style={{
                fontSize: 20,
                color: "#8a8a8a",
              }}
            >
              Waiting...
            </div>
          ) : (
            <>
              {/* NUMBER */}
              <div
                style={{
                  fontSize: 90,
                  fontWeight: "bold",
                  color: "#2e2e2e",
                  textShadow:
                    "0 10px 25px rgba(0,0,0,0.2), 0 0 10px rgba(255,255,255,0.5)",
                  animation: "softGlow 2s ease-in-out infinite",
                }}
              >
                {String(current.queue_number).padStart(3, "0")}
              </div>

              {/* NAME */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  color: "#555",
                  letterSpacing: 1,
                }}
              >
                {current.name}
              </div>
            </>
          )}

          {/* NEXT QUEUE */}
          <div
            style={{
              marginTop: 25,
              display: "flex",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {orders
              .filter((o: any) => o.status !== "done")
              .slice(0, 3)
              .map((o: any) => (
                <div
                  key={o.id}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.05)",
                    fontSize: 12,
                    color: "#555",
                  }}
                >
                  {String(o.queue_number).padStart(3, "0")}
                </div>
              ))}
          </div>
        </div>
      );
    })()}

    {/* ANIMATION */}
    <style jsx>{`
      @keyframes softGlow {
        0% {
          transform: scale(1);
          opacity: 0.9;
        }
        50% {
          transform: scale(1.05);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0.9;
        }
      }
    `}</style>
  </div>
);
}