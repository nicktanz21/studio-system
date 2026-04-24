"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  name: string;
  package: string;
  slot_time: string;
  payment_status: string;
};

export default function Dashboard() {

  const [allowed, setAllowed] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [mode, setMode] = useState<"today" | "all">("today");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
  const checkAccess = async () => {
    const { data: userData } = await supabase.auth.getUser();

    // ❌ NOT LOGGED IN
    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    // 🔍 GET ROLE
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    // ❌ NOT ADMIN
    if (data?.role !== "admin") {
      window.location.href = "/admin";
      return;
    }

    // ✅ ADMIN → ALLOW PAGE
    setAllowed(true);
  };

  checkAccess();
}, []);

  /* ================= FETCH ================= */
  const fetchData = async () => {
  let query = supabase.from("orders").select("*");

  if (mode === "today") {
    query = query.eq("booking_date", today);
  }

  const { data } = await query;

  if (data) setOrders(data);
};

  useEffect(() => {
  fetchData();
}, [mode]);

  /* ================= METRICS ================= */
  const total = orders.length;
  const paid = orders.filter((o) => o.payment_status === "paid").length;
  const pending = total - paid;

  const revenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.package || 0), 0);

  const conversion = total ? ((paid / total) * 100).toFixed(1) : 0;

  /* ================= SLOT ANALYTICS ================= */
  const slotMap: any = {};

  orders.forEach((o) => {
    if (!slotMap[o.slot_time]) slotMap[o.slot_time] = 0;
    slotMap[o.slot_time]++;
  });

  const slotStats = Object.entries(slotMap);

  /* ================= PACKAGE ANALYTICS ================= */
  const packageMap: any = {};

  orders.forEach((o) => {
    if (!packageMap[o.package]) packageMap[o.package] = 0;
    packageMap[o.package]++;
  });

  const packageStats = Object.entries(packageMap);

  /* ================= EXPORT ================= */
  const exportCSV = () => {
    const headers = [
  "Order ID",
  "Name",
  "Email",
  "Phone",
  "Package",
  "Slot",
  "Payment",
];
     const rows = orders.map((o: any) => [
  `ORD-${String(o.queue_number).padStart(3, "0")}`,
  o.name,
  o.email,
  o.contact,
  o.package,
  o.slot_time,
  o.payment_status || "unpaid",
]);

    let csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `dashboard_${today}.csv`;
    link.click();
  };
  

useEffect(() => {
  const channel = supabase
    .channel("orders-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      () => {
        fetchData(); // 🔁 auto refresh
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
if (!allowed) return null;
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 STREAMS STUDIO DASHBOARD</h1>
      <div style={{ marginBottom: 20 }}>
  <button
    onClick={() => setMode("today")}
    style={{
      marginRight: 10,
      padding: "8px 12px",
      background: mode === "today" ? "#00ff9c" : "#333",
      border: "none",
      color: mode === "today" ? "black" : "white",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    TODAY
  </button>

  <button
    onClick={() => setMode("all")}
    style={{
      padding: "8px 12px",
      background: mode === "all" ? "#00ff9c" : "#333",
      border: "none",
      color: mode === "all" ? "black" : "white",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    ALL
  </button>
</div>

      {/* METRICS */}
      <div style={styles.grid}>
        <Card label="Total Clients" value={total} />
        <Card label="Paid" value={paid} />
        <Card label="Pending" value={pending} />
        <Card label="Revenue" value={`₱${revenue}`} />
        <Card label="Conversion" value={`${conversion}%`} />
      </div>

      {/* SLOT ANALYTICS */}
      <h2 style={styles.section}>⏰ Clients per Time Slot</h2>
      <div style={styles.analytics}>
        {slotStats.map(([slot, count]: any) => (
          <div key={slot} style={styles.barRow}>
            <span style={{ width: 150 }}>{slot}</span>
            <div style={styles.barContainer}>
              <div
                style={{
                  ...styles.bar,
                  width: `${count * 20}px`,
                }}
              />
            </div>
            <span>{count}</span>
          </div>
        ))}
      </div>

      {/* PACKAGE ANALYTICS */}
      <h2 style={styles.section}>📦 Package Distribution</h2>
      <div style={styles.analytics}>
        {packageStats.map(([pkg, count]: any) => (
          <div key={pkg} style={styles.barRow}>
            <span style={{ width: 150 }}>₱{pkg}</span>
            <div style={styles.barContainer}>
              <div
                style={{
                  ...styles.bar,
                  width: `${count * 30}px`,
                }}
              />
            </div>
            <span>{count}</span>
          </div>
        ))}
      </div>

      {/* EXPORT */}
      <button onClick={exportCSV} style={styles.export}>
        EXPORT EXCEL
      </button>
    </div>
  );
}

/* ================= UI COMPONENT ================= */
const Card = ({ label, value }: any) => (
  <div style={styles.card}>
    <p>{label}</p>
    <h2>{value}</h2>
  </div>
);

/* ================= STYLES ================= */
const styles: any = {
  container: {
    padding: 40,
    minHeight: "100vh",
    background: "radial-gradient(circle, #0b2e1f, black)",
    color: "white",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  grid: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 30,
  },
  card: {
    padding: 20,
    background: "#111",
    borderRadius: 12,
    minWidth: 150,
    textAlign: "center",
  },
  section: {
    marginTop: 30,
    marginBottom: 10,
  },
  analytics: {
    background: "#111",
    padding: 20,
    borderRadius: 12,
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  barContainer: {
    flex: 1,
    background: "#222",
    height: 10,
    borderRadius: 5,
  },
  bar: {
    height: 10,
    background: "#00ff9c",
    borderRadius: 5,
  },
  export: {
    marginTop: 30,
    padding: 12,
    background: "#00ff9c",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
  },
};