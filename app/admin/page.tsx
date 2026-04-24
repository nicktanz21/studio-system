"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {

  // ✅ STATES
  const [orders, setOrders] = useState<any[]>([]);
  const [mode, setMode] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");

  const router = useRouter();

  // ✅ LOGIN GUARD
  useEffect(() => {
    const loggedIn = localStorage.getItem("admin");

    if (!loggedIn) {
      router.push("/login");
    }
  }, []);

  // ✅ FETCH
  const fetchOrders = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(`/api/orders?date=${today}`, {
      credentials: "include",
    });

    let data;
    try {
      data = await res.json();
    } catch {
      console.error("Invalid JSON");
      return;
    }

    setOrders(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Fetch failed", err);
  }
};

  useEffect(() => {
    fetchOrders();
  }, [mode, selectedDate]);
  const serveNext = async () => {
  const res = await fetch("/api/serve-next", {
    method: "POST",
    credentials: "include", // ✅ THIS FIXES 401
  });

  let data;
  try {
    data = await res.json();
  } catch {
    alert("Server error");
    return;
  }

  if (!res.ok) {
    alert(data.error);
    return;
  }

  fetchOrders();
};
useEffect(() => {
  fetchOrders();
}, []);

  // ✅ GROUPING
  const safeOrders = Array.isArray(orders) ? orders : [];

const groupedByDate = safeOrders.reduce((acc: any, order: any) => {
  if (!acc[order.booking_day]) {
    acc[order.booking_day] = [];
  }
  acc[order.booking_day].push(order);
  return acc;
  const fetchOrders = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(`/api/orders?date=${today}`, {
      credentials: "include",
    });

    let data;
    try {
      data = await res.json();
    } catch {
      console.error("Invalid JSON");
      return;
    }

    setOrders(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Fetch failed", err);
  }
};
}, {});

  // 🔥 ✅ RETURN MUST BE INSIDE FUNCTION
  return (
    <div style={{ padding: 20, background: "#000", color: "#fff" }}>
      <h1>QUEUE DASHBOARD</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setMode("today")}>TODAY</button>
        <button onClick={() => setMode("all")}>ALL</button>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setMode("custom");
          }}
        />
      </div>

      <button
  onClick={serveNext} // ✅ THIS LINE
  style={{
    width: "100%",
    padding: 14,
    background: "#00ff9c",
    border: "none",
    borderRadius: 10,
    marginBottom: 20,
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  NEXT CUSTOMER →
</button>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {orders.map((o: any) => (
          <div
            key={o.id}
            style={{
              padding: 12,
              background: o.status === "serving" ? "#00ff9c" : "#111",
              color: o.status === "serving" ? "#000" : "#fff",
              borderRadius: 10,
            }}
          >
            <div>
              ORD-{String(o.queue_number).padStart(3, "0")} — {o.name}
            </div>

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {o.slot_time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}