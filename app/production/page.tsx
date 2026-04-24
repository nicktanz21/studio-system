"use client";

import { useEffect, useState } from "react";

export default function ProductionPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (!Array.isArray(data)) return;
      setOrders(data);
    } catch (err) {
      console.error("FETCH FAILED:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 STAGE LOGIC
  const getStage = (o: any) => {
    if (!o.selected) return "shoot";
    if (!o.edited) return "edit";
    if (!o.printed) return "print";
    return "done";
  };

  const grouped = {
    shoot: orders.filter((o) => getStage(o) === "shoot"),
    edit: orders.filter((o) => getStage(o) === "edit"),
    print: orders.filter((o) => getStage(o) === "print"),
    done: orders.filter((o) => getStage(o) === "done"),
  };

  // 🔁 MOVE TO NEXT STEP
  const nextStep = async (o: any) => {
  let field = "";

  if (!o.selected) field = "selected";
  else if (!o.edited) field = "edited";
  else if (!o.printed) field = "printed";

  // ✅ FIX GOES HERE
  if (!field) return;

  try {
    await fetch("/api/update-flag", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: o.id, field }),
    });
  } catch (err) {
    console.error("API FAILED");
  }

  setOrders((prev) =>
    prev.map((item) =>
      item.id === o.id ? { ...item, [field]: true } : item
    )
  );

  setTimeout(() => {
    fetchOrders();
  }, 500);
};

  // 💰 MARK PAID
  const markPaid = async (o: any) => {
    try {
      const res = await fetch("/api/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: o.id }),
      });

      const data = await res.json();
      console.log("MARK PAID RESPONSE:", data);

      if (data.error) return;

      fetchOrders();
    } catch (err) {
      console.error("REQUEST FAILED:", err);
    }
  };

  return (
    <div style={{ padding: 20, background: "#292626", color: "#fff" }}>
      <h1>PRODUCTION BOARD</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
        }}
      >
        {["shoot", "edit", "print", "done"].map((stage) => (
          <div key={stage}>
            <h3 style={{ marginBottom: 10 }}>
              {stage.toUpperCase()}
            </h3>

            {(grouped[stage as keyof typeof grouped] || []).map((o: any) => (
              <div
                key={o.id}
                style={{
                  background: "#111",
                  padding: 10,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <div>
                  ORD-{String(o.queue_number).padStart(3, "0")}
                </div>

                <div>{o.name}</div>

                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <button
                    onClick={() => nextStep(o)}
                    style={{
                      background: "#00ff9c",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 6,
                    }}
                  >
                    NEXT
                  </button>

                  <button
                    onClick={() => markPaid(o)}
                    style={{
                      background: "#444",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 6,
                      color: "#fff",
                    }}
                  >
                    PAID
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}