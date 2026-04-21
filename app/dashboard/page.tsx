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
  const [orders, setOrders] = useState<Order[]>([]);

  const today = new Date().toISOString().split("T")[0];

  /* ================= FETCH ================= */
  const fetchData = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("booking_date", today);

    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      "Name",
      "Package",
      "Slot",
      "Payment",
    ];

    const rows = orders.map((o) => [
      o.name,
      o.package,
      o.slot_time,
      o.payment_status,
    ]);

    let csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `dashboard_${today}.csv`;
    link.click();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 STREAMS STUDIO DASHBOARD</h1>

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